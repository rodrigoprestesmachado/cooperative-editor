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
   		
   		this.is = 'ce-participants';
   		this.uPCs = [];
   	}
	
	connectedCallback() {		      
		super.connectedCallback();
		const production = this;
	}
	
   	ready(){
   		super.ready();
   	}
   	
   	_ackRequestParticipation(json){
   		
   	}
   	
    /**
     * Executes the messages from the server
     */
    receiveMessage(strJson) {
    		// Parses the JSON message from Web Socket service
    		var json = JSON.parse(strJson);
 	
    		if (json.type === 'ACK_CONNECT')
    			this._ackConnectHandler(json);
    		if (json.type === "ACK_REQUEST_PARTICIPATION")
    			this._ackRequestParticipation(json);
    	}
    
    /**
     * Private method for the participant to request editing in the production
     */
    _requestParticipation(){
    		this.dispatchEvent(new CustomEvent('requestParticipation'));
    }
    
    /**
     * Private method to handle the ACK_CONNECT message from server
     * 
     * @param The JSON message
     */
    _ackConnectHandler(json){
    		if (this.isDisconnected){
    			
    			var userNames = this._loadUserProductionConfigurations(json);
    			var numberPeople = json.userProductionConfigurations.length;
    			
    			// Plays the Earcon and update the user`s number
    			this.playSound("connect","");
    		
    			// TTS
    			if (numberPeople === 1){
    				var userMessage = super.localize("titleParticipants");
    				this.speechMessage.text = numberPeople + " " + userMessage.substring(0, userMessage.length - 1) + ", " + userNames;
    			}
    			else
    				this.speechMessage.text = numberPeople + " " + super.localize("titleParticipants") + ", " + userNames;
    			this.playTTS("connect", this.speechMessage);
    			this.isDisconnected = false;
    		}
    		else{
    			if (typeof json.disconnectedProductionConfiguration != "undefined"){
    				var uPC = json.disconnectedProductionConfiguration;
    				this.speechMessage.text = uPC.user.name + ", " + "saiu";
    				this.playTTS("connect", this.speechMessage);
    				this._loadUserProductionConfigurations(json);
    			}
    			else {
    				var uPC = json.newConnectedProductionConfiguration;
    				this.speechMessage.text = uPC.user.name + ", " + "entrou";
    				this.playTTS("connect", this.speechMessage);
    				this._loadUserProductionConfigurations(json);
    			}
    		}
    	}
    
    _loadUserProductionConfigurations(json) {
    		// Clear - Polymer.Base splice method
		this.splice("uPCs", 0, this.uPCs.length);
		var userNames = "";
		for (var x in json.userProductionConfigurations) {
			var uPC = json.userProductionConfigurations[x];
			this.push("uPCs", uPC);
			userNames += " " + uPC.user.name + ", ";
		}
		return userNames;
    }
    
    _urlValide(url){    	
    		return url !== "null" && url !== undefined;
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
    				var tickets = userProductionConfigurations[x].production.minimumTickets;
        			strMessage += userName + ", " + super.localize("phraseMore") + ", " + tickets + 
    					" " + super.localize("phraseParticipation");
    			}
        			
        		this.speechMessage.text = strMessage;
        		wasSpoken = this.playTTS("participantsDescription", this.speechMessage);
    		} else {
    			this.speechMessage.text = super.localize("noUser");
    			wasSpoken = this.playTTS("participantsDescription", this.speechMessage);
    		}
    		
    		if (wasSpoken)
    			this.dispatchEvent(new CustomEvent('readParticipantsStatus'));
    	}
    
    _browse(){
    		this.dispatchEvent(new CustomEvent('browse'));
    }
    	
}
window.customElements.define(CooperativeEditorParticipants.is, CooperativeEditorParticipants);