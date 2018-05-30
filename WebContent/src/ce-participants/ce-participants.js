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

	constructor() {
   		super();
   		// Controls when the user connect in the system
   		this.isDisconnected = true;
   		this.uPCs = [];
   		console.log("ce-participants constructor");
   	}

	connectedCallback() {
		super.connectedCallback();
		console.log("ce-participants connectedCallback");
	}

   	ready(){
   		super.ready();
   		console.log("ce-participants ready");
   	}

    /**
     * Executes the messages from the server
     */
    receiveMessage(strJson) {
    		// Parses the JSON message from Web Socket service
    		var json = JSON.parse(strJson);
    		switch(json.type) {
    	    case "ACK_CONNECT":
    	    		this._connectHandler(json);
    	        break;
    	    case "ACK_FINISH_PARTICIPATION":
    	    		this._loadUserProductionConfigurations(json);
	    		this._playSoundParticipation(json, "endParticipation");
	    		break;
    	    case "ACK_REQUEST_PARTICIPATION":
    	    		this._loadUserProductionConfigurations(json);
	    		this._playSoundParticipation(json, "startParticipation");
	    		break;
    	    case "ACK_LOAD_EDITOR":
    	    		this._loadUserHanlder(json.idUser);
    	        break;
    		}
    	}

    /**
     * Private method to handle the ACK_CONNECT message from server
     *
     * @param The JSON message
     */
    _connectHandler(json){
    		if (this.isDisconnected){
    		    
    		    // Load the name of the connected user
    		    CooperativeEditorParticipants.userName = json.newConnectedProductionConfiguration.user.name;
    		    
    			var numberPeople = json.userProductionConfigurations.length;
    			var userNames = this._loadUserProductionConfigurations(json);

    			if (numberPeople === 1){
    				var userMessage = super.localize("titleParticipants");
    				this.domHost.speechMessage.text = numberPeople + " " +
    					userMessage.substring(0, userMessage.length - 1) + ", " + userNames;
    			}
    			else
    				this.domHost.speechMessage.text = numberPeople + " " +
    					super.localize("titleParticipants") + ", " + userNames;

    			var effect = json.newConnectedProductionConfiguration.soundEffect.effect;
    			var position = json.newConnectedProductionConfiguration.soundEffect.position;
    			this.domHost.playSound("connect",effect, position);
    			this.domHost.playTTS(this.domHost.speechMessage);
    			this.isDisconnected = false;
    		}
    		else{
    			if (typeof json.disconnectedProductionConfiguration != "undefined"){
    				var uPC = json.disconnectedProductionConfiguration;
    				this.domHost.speechMessage.text = uPC.user.name + ", " + "saiu";
    				this.domHost.playTTS(this.domHost.speechMessage);
    				this._loadUserProductionConfigurations(json);
    			}
    			else {
    				var uPC = json.newConnectedProductionConfiguration;
    				this.domHost.speechMessage.text = uPC.user.name + ", " + "entrou";
    				this.domHost.playTTS(this.domHost.speechMessage);
    				this._loadUserProductionConfigurations(json);
    			}
    		}
    	}
    
	 _loadUserHanlder(id){
 		this.idUser = id;
	 }
	 
	 /**
     * Rings the sound of starting participation
     */
	 _playSoundParticipation(json, action){
		 this.domHost.playSound(action, json.effect, json.position);
		 
		 var userName = json.author.name;
		 if (CooperativeEditorParticipants.userName != userName){
			 this.domHost.speechMessage.text = userName;
	 		 this.domHost.playTTS(this.domHost.speechMessage);	 
		 }
	 }

    /**
     * Private method to Load or refresh the user on the screen
     * 
     * @param The JSON message
     * @return string with user names all
     */
    _loadUserProductionConfigurations(json) {
    		console.log("ce-participants _loadUserProductionConfigurations");
    		// Clear - Polymer.Base splice method
		this.splice("uPCs", 0, this.uPCs.length);
		var userNames = "";
		var uPCsTemp = [];
		for (var x in json.userProductionConfigurations) {
			var uPC = json.userProductionConfigurations[x];
			uPCsTemp.push(uPC);
			userNames += " " + uPC.user.name + ", ";
		}
		console.log("ce-participants userProductionConfigurations.length "+json.userProductionConfigurations.length);
		this.uPCs = uPCsTemp;
		return userNames;
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
			this.dispatchEvent(new CustomEvent('requestParticipation'));
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
		this.dispatchEvent(new CustomEvent('browse'));
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

        		this.domHost.speechMessage.text = strMessage;
        		wasSpoken = this.domHost.playTTS(this.domHost.speechMessage);
    		} else {
    			this.domHost.speechMessage.text = super.localize("noUser");
    			wasSpoken = this.domHost.playTTS(this.domHost.speechMessage);
    		}

    		if (wasSpoken)
    			this.dispatchEvent(new CustomEvent('readParticipantsStatus'));
    	}

}
window.customElements.define(CooperativeEditorParticipants.is, CooperativeEditorParticipants);