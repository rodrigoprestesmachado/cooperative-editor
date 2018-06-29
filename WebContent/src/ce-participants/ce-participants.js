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
    	    	this._loadUserProductionConfigurations(json.userProductionConfigurations);
    	    	this._connectHandler(json);
    	    	this._describesUsers(json);
    	        break;
    	    case "ACK_DISCONNECTION":
    			this._disconnectedHandler(json.disconnected);
    			this._loadUserProductionConfigurations(json.userProductionConfigurations);
	    		break;
    	    case "ACK_FINISH_PARTICIPATION":
	    		this._loadUserProductionConfigurations(json);
	    		this._playSoundParticipation(json, "endParticipation");
	    		break;
    	    case "ACK_REQUEST_PARTICIPATION":
	    		this._loadUserProductionConfigurations(json);
	    		this._playSoundParticipation(json, "startParticipation");
	    		break;
    	    case "ACK_LOAD_INFORMATION":
	    		this._loadUserHanlder(json.user);	    		
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
     * Private method to handle the ACK_NEW_CONNECTED message from server
     *
     * @param The JSON message
     */
    _connectHandler(json){
    	var uPC = json.newConnectedProductionConfiguration;
    	if(uPC !== undefined && CooperativeEditorParticipants.userName !== uPC.user.name)
    		this.domHost.playTTS(uPC.user.name + ", " + "entrou");
    }
    
    _describesUsers(json){
		var numberPeople = this.uPCs.length;
		var userNames = '';
		for(var x = 0; x < numberPeople;x++)
			userNames += this.uPCs[x].user.name + " ,";
		
		var text = numberPeople + " ";
		var userMessage = super.localize("titleParticipants");
		text += numberPeople === 1 
			? userMessage.substring(0, userMessage.length - 1) + ", " 
			: userMessage + ", ";
		text += userNames;
	
		if(json.newConnectedProductionConfiguration !== undefined){
			var effect = json.newConnectedProductionConfiguration.soundEffect.effect;
			var position = json.newConnectedProductionConfiguration.soundEffect.position;
			this.domHost.playSound("connect",effect, position);
			this.domHost.playTTS(text);
		}
    }
    
	 _loadUserHanlder(user){
 		this.idUser = user.id;
 		 // Load the name of the connected user
	    CooperativeEditorParticipants.userName = user.name;
	 }
	 
	 /**
     * Rings the sound of starting participation
     */
	 _playSoundParticipation(json, action){
		 this.domHost.playSound(action, json.effect, json.position);
		 
		 var userName = json.author.name;
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