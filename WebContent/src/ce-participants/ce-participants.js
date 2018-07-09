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
    	this.domHost.playTTS(name + ", " + "saiu");
    }

    /**
     * Private method to handle the ACK_NEW_CONNECTED
     *
     * @param The JSON message
     */
    _connectHandler(uPC){
    	if(uPC !== undefined)
	    	this.push('uPCs', uPC);
	    	 if(CooperativeEditorParticipants.userName !== uPC.user.name)
	    		this.domHost.playTTS(uPC.user.name + ", " + "entrou");    	
    }
    
    _describesUsers(uPC){
    	if(uPC !== undefined){
				var numberPeople = this.uPCs.length;
				var userNames = '';
				for(var uPC of this.uPCs)
					userNames += uPC.user.name + " ,";
				
				var text = numberPeople + " ";
				var userMessage = super.localize("titleParticipants");
				text += numberPeople === 1 
					? userMessage.substring(0, userMessage.length - 1) + ", " 
					: userMessage + ", ";
				text += userNames;
			
				var soundEffect = this._getSoundEffect(uPC.user.id);
				if(soundEffect !== undefined) {	
					this.domHost.playSound("connect",soundEffect.effect, soundEffect.position);
					this.domHost.playTTS(text);
				}
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
 		 // Load the name of the connected user
	    CooperativeEditorParticipants.userName = user.name;
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
     * @param The UserProductionConfigurations
     * @return string with user names all
     */
    _loadUserProductionConfigurations(uPCs) {
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
     * @param The id
     * @return Boolean
     */
    _getLabelRequestParticipation(id) {
    	var label = '';
    	if(this._isUser(id))
    		label = this.localize('buttonRequestParticipation');
    	else {
				for(var uPC of this.uPCs)
					 if(uPC.user.id == id)break;
				label = this.localize('buttonRequestParticipationColleague','name',uPC.user.name);
    	}
			
    	return label;
    }
    
    /**
     * Private method to test whether the user ID is the same as the logged-in user
     *
     * @param The id
     * @return Boolean
     */
    _isUser(id){
    		return this.idUser == id;
    }
    
    /**
     * Private method to calculate the number of tickets available to the user
     *
     * @param The userProductionConfiguration
     * @return Interger
     */
    _tickets(uPCs){
    		return parseInt(uPCs.production.minimumTickets) - parseInt(uPCs.ticketsUsed);
    }

    /**
     * Private method for the participant to request editing in the production
     */
    _requestParticipation(event) {
		if(event.model.item.user.id === this.idUser)
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
   	_isCreating(situation) {
   		return situation === "CONTRIBUTING" || situation === "FREE" ? "show" : "hide";
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
    		var wasSpoken = false;
    		var strMessage = "";
    		var userProductionConfigurations = this.get("uPCs");

    		if (userProductionConfigurations.length > 0) {
    			for (var x in userProductionConfigurations) {
    				var userName = userProductionConfigurations[x].user.name;
    				var id = userProductionConfigurations[x].user.id;
    				var tickets = userProductionConfigurations[x].production.minimumTickets - userProductionConfigurations[x].ticketsUsed;
        			strMessage += userName + ", " + super.localize("phraseMore") + ", " + tickets +
    					" " + super.localize("phraseParticipation");
    			}
        		
        		wasSpoken = this.domHost.playTTS(strMessage);
    		} else {
    			wasSpoken = this.domHost.playTTS(super.localize("noUser"));
    		}

    		if (wasSpoken)
    			this._setSendMessage({type:'READ_PARTICITANTS_STATUS'});
    	}
    
    /**
     * Move the cursor for this component
     */
    setFocus(){
 	   this.$.startCursor.focus();
 	   this.domHost.playSound("moveCursor", "", "");  
    }

}
window.customElements.define(CooperativeEditorParticipants.is, CooperativeEditorParticipants);