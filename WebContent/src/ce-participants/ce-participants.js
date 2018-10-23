/**
 * @license
 * Copyright 2018,Instituto Federal do Rio Grande do Sul (IFRS)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * 		http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class CooperativeEditorParticipants extends CooperativeEditorParticipantsLocalization {

	static get is() {
		return 'ce-participants';
	}
	
	static get properties() {
		return {
			/**
			 * Messages received
			 */
			receiveMessage: {
				type: Object,
				observer: '_receiveMessage',
				notify: true
			},
			/**
			 * Messages sent
			 */
			sendMessage: {
			type: Object,
			notify: true,
			readOnly: true
			}
		};
	}

	constructor() {
   		super();
   		this.uPCs = [];
   		this.userSoundEffect = new Map();
   		
   		this.firstTime = 1;
   	}

	connectedCallback() {
		super.connectedCallback();
	}

    /**
     * Executes the messages from the server
     */
    _receiveMessage(json) {    		
    	switch(json.type) {
    	    case "ACK_NEW_CONNECTED":
    	    	this._connectHandler(json.userProductionConfiguration);
    	    	this._describesUsers(json.userProductionConfiguration);
    	    	break;
    	    case "ACK_DISCONNECTION":
    	    	this._disconnectedHandler(json.disconnected);
    	    	this._loadUserProductionConfigurations(json.userProductionConfigurations);
	    		break;
    	    case "ACK_FINISH_PARTICIPATION":
    	    	this._loadUserProductionConfigurations(json.userProductionConfigurations);
    	    	this._playSoundParticipation(json.author, "endParticipation");
	    		break;
    	    case "ACK_REQUEST_PARTICIPATION":
    	    	this._loadUserProductionConfigurations(json.userProductionConfigurations);
    	    	this._playSoundParticipation(json.author, "startParticipation");
	    		break;
    	    case "ACK_LOAD_INFORMATION":
    	    	this._loadUserHanlder(json.user);
    	    	this._loaderSoundEffect(json.production.userProductionConfigurations);
    	    	this._loadUserProductionConfigurations(json.uPCsConnected);
    	    	break;
		}
	}
    
    /**
     * Private method to handle the ACK_DISCONNECTION message from server
     *
     * @param The name
     */
    _disconnectedHandler(name){
    	this.domHost.playTTS(name + ", " + super.localize("phraseExit"));
    }

    /**
     * Private method to handle the ACK_NEW_CONNECTED
     *
     * @param The JSON message
     */
    _connectHandler(uPC){
    	
    	if(uPC !== undefined){
    		if(this._isUser(uPC.user.id))
    			uPC.user.tabindex = 0; // Current user
    		else{
    			this.domHost.playTTS(uPC.user.name + ", " + super.localize("phraseEntered"));
    			uPC.user.tabindex = -1;
    		}
    		
    		// Adds the User Production Configuration to the array 
    		this.push('uPCs', uPC);
    	}
    }
    
    _describesUsers(uPC){
    	if((uPC !== undefined) && (this.firstTime === 1)){
			var numberPeople = this.uPCs.length;			
			var userMessage = super.localize("titleParticipants");
			
			var text = numberPeople + " ";
			text += numberPeople === 1 
				? userMessage.substring(0, userMessage.length - 1) + ", "
				: userMessage + ", ";
				
			for(var uPC of this.uPCs)
				text += uPC.user.name + " ,";
			
			var soundEffect = this._getSoundEffect(uPC.user.id);
			if(soundEffect !== undefined) {	
				this.domHost.playSound("connect",soundEffect.effect, soundEffect.position);
				this.domHost.playTTS(text);
			}
			
			this.firstTime++;
    	}
    }
    
    /**
     * Private method to return the SoundEffect
     * 
     * @param The user id
     * @return String name SoundEffect
     *
     */
  	_getSoundEffect(id){
  		return this.userSoundEffect.get(id);
  	}
  	
  	/**
 	 * Private method to publisher search and loads userSoundEffect
 	 */
 	_loaderSoundEffect(uPCs){
 		for(var uPC of uPCs)
 			this.userSoundEffect.set(uPC.user.id,uPC.soundEffect);
 	}
 	
 	_loadUserHanlder(user){ 
 		this.idUser = user.id;
 		
 		// Stores the id and name of the connected/current user
 		CooperativeEditorParticipants.userName = user.name;
 		CooperativeEditorParticipants.idUser = user.id;
	 }
	 
	 /**
	  * Order the participants, the current participant will be the first
	  * @param Object userProductonConfiguration
	  * @param not user
	  * @return int
	  */
	 _sortParticipants(uPC) {
		return this._isUser(uPC.user.id) ? -1 : 1;
	 }
	 
	 /**
     * Rings the sound of starting participation
     */
	 _playSoundParticipation(author, action){
		 var soundEffect = this._getSoundEffect(author.id);
		 this.domHost.playSound(action, soundEffect.effect, soundEffect.position);
		 
		 var userName = author.name;
		 if (CooperativeEditorParticipants.userName != userName){
	 		 this.domHost.playTTS(userName);
		 }
	 }

    /**
     * Private method to Load or refresh the user on the screen
     * 
     * @param UserProductionConfigurations array
     */
    _loadUserProductionConfigurations(uPCs) {
    	// Stores the situation of the current user 
    	for (var x in uPCs){
    		var upc = uPCs[x];
    		if (CooperativeEditorParticipants.idUser === upc.user.id){
    			CooperativeEditorParticipants.userSituation = upc.situation;
    			upc.user.tabindex = 0;
    		}
    		else
    			upc.user.tabindex = -1;
    		
    	}
    		
    	// Clear - Polymer.Base splice method
		this.splice("uPCs", 0, this.uPCs.length);
		this.uPCs = uPCs;
    }
    
    /**
     * Private method to test if url is not null
     *
     * @param The string url
     * @return Boolean
     */
    _urlValide(url){
    	return url !== "null" && url !== undefined && url.trim() !== "";
    }
    
    /**
     * Private method to return the label
     *
     * @param The user
     * @return Boolean
     */
    _getLabelRequestParticipation(upc) {
    	if (!this._isUser(upc.user.id))
    		if (upc.situation === "FREE")
    			return this.localize('buttonRequestParticipationColleague','name',upc.user.name);
    		else
    			return this.localize('buttonRequestParticipationContributing','name', upc.user.name);
    	else
    		if (upc.situation === "FREE")
    			return this.localize('buttonRequestParticipation');
    		else
    			return this.localize('buttonRequestParticipationContributing','name', upc.user.name);
    }
    
    /**
     * Private method to test whether the user ID is the same as the logged-in user
     *
     * @param The id
     * @return Boolean
     */
    _isUser(id){
    	return this.idUser === id;
    }
    
    /**
     * Private method to calculate the number of tickets available to the user
     *
     * @param The userProductionConfiguration
     * @return Interger
     */
    _tickets(uPC){
    	return parseInt(uPC.production.minimumTickets) - parseInt(uPC.ticketsUsed);
    }

    /**
     * Private method for the participant to request editing in the production
     */
    _requestParticipation(event) {
		if(this._isUser(event.model.item.user.id))
			this._setSendMessage({type:'REQUEST_PARTICIPATION'});
	}
    
    /**
     * Private method to add class in paper-card
     *
     * @param situation
     * @return String name class
     */
 	_isContributing(situation) {
   		return situation === "CONTRIBUTING" ? "paper-card-user contributing" : "paper-card-user";
   	}
 	
 	/**
     * Private method to add class in paper-icon-button id requestParticipation
     *
     * @param situation
     * @return String name class
     */
   	_isFree(situation) {
   		return situation === "FREE" ? "show" : "hide";
   	}
   	
   	/**
     * Private method to add class in paper-icon-button id requestParticipation
     *
     * @param situation
     * @return String name class
     */
   	_isWriting(situation) {
   		return situation === "CONTRIBUTING" ? "show" : "hide";
   	}
   	
   	/**
     * Private method to add class in iron-icon
     *
     * @param situation
     * @return String name class
     */
   	_isWatching(situation) {
   		return situation === "BLOCKED" ? "show" : "hide";
   	}

   	_browse(){
   		this._setSendMessage({type:'BROWSE'});
   	}

    /**
     * Describe the status of the component to the users
     */
    readComponentStatus(){
		var strMessage = "";
		if (this.uPCs.length > 0) {
			for (var uPC of this.uPCs) {
    			strMessage += uPC.user.name + ", ";
    			strMessage += super.localize("phraseMore") + ", ";
    			strMessage += this._tickets(uPC) + " ";
    			strMessage += (this._tickets(uPC) === 1) ? super.localize("phraseParticipationSingular") : super.localize("phraseParticipation");
    			strMessage += ",";
    			if (uPC.situation === "CONTRIBUTING")
    				strMessage += super.localize("phraseContributing");
    			else{
    				if (uPC.situation === "BLOCKED")
    					strMessage += super.localize("phraseBlocked");
    				else
    					strMessage += super.localize("phraseFree");
    			}
    		}
		} else
			strMessage = super.localize("noUser");

		if (this.domHost.playTTS(strMessage))
			this._setSendMessage({type:'DESCRIBE_PARTICIPANTS'});
    }
    
    /**
     * Move the cursor for this component
     */
    setFocus(){
    	Polymer.dom(this.root).querySelector("#cardUser"+this.idUser).focus();
    	this.domHost.playSound("moveCursor", "", "");
    	this._setSendMessage({type:'FOCUS_PARTICIPANTS'});
    }

}
window.customElements.define(CooperativeEditorParticipants.is, CooperativeEditorParticipants);