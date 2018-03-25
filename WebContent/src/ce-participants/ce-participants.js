/**
 * @license
 * Copyright 2018, Rodrigo Prestes Machado and Lauro Correa Junior
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
   		//this.users = [];
   		this.uPCs = [];
   	}
	
	connectedCallback() {		      
		super.connectedCallback();
		const production = this;
	}
	
   	ready(){
   		super.ready();
   	}
   	
    /**
     * Executes the messages from the server
     */
    receiveMessage(strJson) {
    	
    		// Parses the JSON message from WS service
    		var data = JSON.parse(strJson);
 	
    		if (data.type === 'ACK_CONNECT') {
    			// Polymer.Base splice method
    			this.splice('uPCs', 0, this.uPCs.length);
 		
    			var strPeople = "";
    			var numberPeople = 0;
    			for (var x in data.userProductionConfigurations) {
    				var uPC = data.userProductionConfigurations[x];
    				// Polymer.Base push method
    				this.push('uPCs', uPC);
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
    		
    	}
    
    _urlValide(url){    	
    	return url !== 'null' && url !== undefined;
    }
    	
}
window.customElements.define(CooperativeEditorParticipants.is, CooperativeEditorParticipants);