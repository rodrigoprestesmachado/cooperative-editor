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
class CooperativeEditorParticipants extends CooperativeEditorSound {
	
	static get is() {
		return 'ce-participants'; 
	}
	
	constructor() {
   		super();
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
    		// Polymer.Base splice method
		this.splice("uPCs", 0, this.uPCs.length);
	
		var strPeople = "";
		var numberPeople = 0;
		for (var x in json.userProductionConfigurations) {
			var uPC = json.userProductionConfigurations[x];
			// Polymer.Base push method
			this.push("uPCs", uPC);
			strPeople += "   " + uPC.user.name;
			numberPeople = numberPeople + 1;
		}
	
		// Plays the Earcon and update the user`s number
		this.playSound("connect","");
	
		// TTS
		if (numberPeople === 1){
			var userMessage = super.localize("participants");
			this.speechMessage.text = numberPeople + " " + userMessage.substring(0, userMessage.length - 1);
		}
		else
			this.speechMessage.text = numberPeople + " " + super.localize("participants");
	
		this.playTTS("connect", this.speechMessage);
		this.speechMessage.text = strPeople;
		this.playTTS("connect", this.speechMessage);
    }
    
    _urlValide(url){    	
    		return url !== "null" && url !== undefined;
    }
    
    /**
     * Describe the status of the component to the users
     */
    readComponentStatus(){
    		var strMessage = "";
    		var userProductionConfigurations = this.get("uPCs");
    		
    		if (userProductionConfigurations.length > 0) {
    			for (var x in userProductionConfigurations) {
    				var userName = userProductionConfigurations[x].user.name;
    				var id = userProductionConfigurations[x].user.id;
    				var tickets = userProductionConfigurations[x].production.minimumTickets;
        			strMessage += userName + "; " + super.localize("more") + "," + tickets + 
    					super.localize("participation");
    			}
        			
        		this.speechMessage.text = strMessage;
        		this.playTTS("participantsDescription", this.speechMessage);
    		} else {
    			this.speechMessage.text = super.localize("noUser");
        		this.playTTS("participantsDescription", this.speechMessage);
    		}
    		
    		this.dispatchEvent(new CustomEvent('readParticipantsStatus'));
    	}
    
    _browse(){
    		this.dispatchEvent(new CustomEvent('browse'));
    }
    	
}
window.customElements.define(CooperativeEditorParticipants.is, CooperativeEditorParticipants);