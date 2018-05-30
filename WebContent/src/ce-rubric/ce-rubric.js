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

class CooperativeEditorRubric extends CooperativeEditorRubricLocalization {
	static get is() { 
		return 'ce-rubric';
	}
	
	constructor() {
		super();
		this.userSoundEffect = new Map();
		this.ceContainer = document.querySelector("ce-container");
		this.newConnectedProductionConfiguration = null;
		
	}
	
	connectedCallback() {
		super.connectedCallback();
	}
				
	// Used by the component to return the value of a valid property a person object
	_returnIdentification(object){
		var name;
		if(object.name !== "null" && object.name != null)
			name = object.name;
		else
			name = object.email.substring(0, object.email.indexOf("@"));
		return name;								
	}
	
	/**
     * Private method to finish rubric
     *
     * @param event
     *
     */
	_finishRubric(event){
		event.target.disabled = true;
		var idRPC = event.model.rPC.id;
		
		this.dispatchEvent(new CustomEvent('finishRubric',{detail: {idRPC: idRPC}}));
	}
	
	/**
     * Private method to open rubric dialog
     *
     * @param event
     *
     */
	_openDialog(event) {
		var rubric = event.model.rPC.rubric;
		var content =  "<h1>"+rubric.objective +"</h1>";
		for (var x in rubric.descriptors)
			content += rubric.descriptors[x]+"<br/>";
		this.ceContainer.dispatchEvent(new CustomEvent('openDialog', {detail:content}));
    }
	
	/**
     * Private method to add class in iron-icon
     *
     * @param idUser
     * @return String name class
     */
	_getClass(idUser){
		return this.userSoundEffect.get(idUser).color;
	}
	
	/**
	* Private method to identify whether the logged 
	* in user can press the end of rubric button
	*
	* @param userRubricstatus list
    * @return Boolean
	*
	*/
	_isFinish(userRubricStatuss){
		var disabled = false;
		if(this.idUser != null)
			for (var y in userRubricStatuss) {
				if(userRubricStatuss[y].user.id == this.idUser){
					disabled = true;
				}
			}
		return disabled;
	}
	
	/**
	* Private method to set a RubricProductionConfiguration object
	* 
	* @param RubricProductionConfiguration object
    *
    */
	_setRubricProductionConfiguration(RPC){
		this.rubricProductionConfigurations = RPC;
	}
	
	/**
	* Private method to mount a map to easily find the user's soundEffect
	*/
	_setUserProductionConfiguration(UPCs){				
		for (var y in UPCs) {
			this.userSoundEffect.set(UPCs[y].user.id,UPCs[y].soundEffect);
		}
	}
				
	_setUserRubricStatuss(userRubricStatuss){
		for(var x in userRubricStatuss)
			this._setUserRubricStatus(userRubricStatuss[x])
	}
	
	/**
     * Private method to cut the text in 50 characters
     *
     * @param txt
     * @return txt with 50 characters
     *
     */
	_cutText(txt){
        if(txt.length > 50)
            txt = txt.substring(0, txt.indexOf(" ", 50)) + "...";				
        return txt;
	}
	/**
     * Executes the messages from the server
     */
	receiveMessage(strJson){
      	var data = JSON.parse(strJson);
      	if (data.type === 'ACK_LOAD_EDITOR'){
      		this.newConnectedProductionConfiguration = data.newConnectedProductionConfiguration;
      		this.idUser = data.idUser;
      		this._setUserProductionConfiguration(data.production.userProductionConfigurations);
      		this._setRubricProductionConfiguration(data.production.rubricProductionConfigurations);
      	}else if (data.type === 'ACK_FINISH_RUBRIC'){
	      	this._setUserRubricStatus(data);
	    }
    }
	
	_setUserRubricStatus(json){
        this.rubricProductionConfigurations = [];
        this.rubricProductionConfigurations = json.RubricProductionConfiguration;
        
        // Awareness
        var effect = json.upcUser.soundEffect.effect;
		var position = json.upcUser.soundEffect.position;
	   	this.domHost.domHost.playSound("acceptedRubric", effect, position);
	   	
	    if (json.upcUser.user.name !== CooperativeEditorParticipants.userName ){
	    		this.domHost.domHost.speechMessage.text = json.upcUser.user.name;
			this.domHost.domHost.playTTS(this.domHost.domHost.speechMessage);
	    }
	}
	/**
     * Describe the status of the component to the users
     */
	readComponentStatus() {
		var wasSpoken = false;
		var strMessage = "";
		if (this.rubricProductionConfigurations.length > 0){
			for (var x in this.rubricProductionConfigurations) {
				var rpc = this.rubricProductionConfigurations[x];
				strMessage += super.localize("descriptionIntro") + "," + rpc.rubric.objective + ",";
				if (rpc.rubric.userRubricStatuss !== "undefined") {
					var accepted = 0;
				    for (var y in rpc.rubric.userRubricStatuss) {
						var rubricStatus = rpc.rubric.userRubricStatuss[y];
						strMessage += rubricStatus.user.name + ";"
						accepted++;
					}
					if (accepted > 1)
						strMessage += ","+ super.localize("descriptionEnd");
					else if (accepted === 1)
						strMessage += ","+ super.localize("descriptionEndSingular");
				}
				
				this.domHost.domHost.speechMessage.text = strMessage;
				wasSpoken = this.domHost.domHost.playTTS(this.domHost.domHost.speechMessage);
				strMessage = "";
			}
		}
		else{
			this.domHost.domHost.speechMessage.text = super.localize("noRubric");
			wasSpoken = this.domHost.domHost.playTTS(this.domHost.domHost.speechMessage);
		}
		
		if (wasSpoken)
			this.dispatchEvent(new CustomEvent('readRubricStatus'));
	}
	
}
window.customElements.define(CooperativeEditorRubric.is, CooperativeEditorRubric);