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
class CooperativeEditor extends CooperativeEditorLocalization {
	static get is() { 
		return 'ce-editor'; 
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
      },
      /**
       * Bridge to pass on messages from the child components
       */
      bindMessage:{
      	type: Object,
        notify: true,
        observer(json){this._setSendMessage(json)}
      }
		};
}
	
	constructor() {
		super();
		this.contributions = [];
		this.currentContribution = 0;		
		this.userProductionConfigurations = null;
		this.userSoundEffect = new Map();
	}
     
	connectedCallback() {
		super.connectedCallback();		
	}
	
	_receiveMessage(json){
      	switch(json.type){
	      	case "ACK_FINISH_PARTICIPATION":
		  			this._setContribution(json.contribution);
		  			this._endParticipation(json);
	      	case "ACK_REQUEST_PARTICIPATION":
	      		this._updatePublisher(json.userProductionConfigurations);
	      		break;
	      	case "ACK_LOAD_INFORMATION":
	    			this._setObjective(json.production.objective);
		  			this._registerUser(json.user.id);
		  			this._setContributions(json.production.contributions);
		  			this.userProductionConfigurations = json.production.userProductionConfigurations;
		  			this._updatePublisher(json.production.userProductionConfigurations);		  			
	  			break;
      	}
     }
	
	_adjustLabel(){
		var descri = this.currentContribution + 1 +' '+this.contributions[this.currentContribution].user.name;
		this.labelContribution = this.localize('contribution','descripction',descri);
	}
	 /**
     * Private method to sound the closed beep
     * 
     * @param json with effect and position
     *
     */
    _endParticipation(json){
  	  	this.domHost.playSound("endParticipation", json.effect, json.position);
    }
	
	/**
     * Private method to start diff system
     *
     */
	_contentCheck(){
		this._adjustLabel();
		if(this.$.check.contentCheck) {
			this.currentContribution  = this.contributions.length - 1;
			this._updateContent(this.contributions[this.currentContribution].content);
			this.$.displayNumberContribution.style.display = "none";
		} else {			
			this.$.previous.firstClick = true;
			this.$.displayNumberContribution.style.display = "inline";

			// activated until the history is working
			this.currentContribution = 0;
			this._updateContent(this._diff());

			// history disabled until its correct
			//var texts = [];
			//for(var x in this.contributions)
				//texts.push({text:this.contributions[x].content,owner:this._getClassUser(this.contributions[x].user.id)});
			//this.exec(texts);
		}
		this.$.check.contentCheck = !this.$.check.contentCheck;
		this.$.next.disabled = !this.$.check.contentCheck;
		this.$.previous.disabled = !this.$.check.contentCheck;
		
	}
	
	/**
     * Private method to return to previous diff
     *  
     */
	_previous(event){		
		if(this.currentContribution > 0){
			this.currentContribution--;
		}else{
			this.currentContribution = this.contributions.length - 1;
		}

		event.target.firstClick = false;
		this._updateContent(this._diff());
	}
     
	/**
     * Private method to go to the next diff
     *  
     */
	_next(){		
		if(this.currentContribution < (this.contributions.length - 1)) {
			this.currentContribution++;
		} else {
			this.currentContribution = 0;
		}
		this._updateContent(this._diff());
	}
	
	/**
     * Private method to return the user class
     * 
     * @param The user id
     * @return String name class
     *
     */
	_getClassUser(id){
		return this.userSoundEffect.get(id).color;
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
     * Private method to apply the diff
     * 
     * @return text in HTML format with marked diff
     *
     */     
	_diff(){		
		var text1 = this.currentContribution > 0 ? this.contributions[this.currentContribution - 1].content :'';
		var text2 = this.contributions[this.currentContribution].content;
		
		var author = this.contributions[this.currentContribution].user;
		var soundEffect = this._getSoundEffect(author.id);		
		
		var dmp = new diff_match_patch();
   	var d = dmp.diff_main(text1, text2, false);
   	dmp.diff_cleanupSemantic(d);
   	
   	
   	this._talkContribution(soundEffect,author);
   	
   	
   	return dmp.diff_prettyHtml(d,soundEffect.color);
  }
	
	
	_talkContribution(soundEffect) {
		this._adjustLabel();
		this.domHost.playTTS(this.labelContribution);
   	this.domHost.playSound("nextContribution", soundEffect.effect, soundEffect.position);
	}
     
	/**
     * Private method to display the text in the editor
     * 
     * @param text to be displayed in the editor
     *
     */
	_updateContent(txt){
		if(txt.includes("<")){
			this.$.content.value = "";
			this.$.text.innerHTML = txt;
		} else {
			this.$.text.innerHTML = "";
			this.$.content.value = txt;			
		}
	}
     
	/**
   * Private method add a contribution
   * 
   * @param contribution object
   *
   */
   _setContribution(contribution){
   	 this.contributions.push(contribution);
   	 this.currentContribution = this.contributions.length - 1;
   	 this._updateContent(this.contributions[this.currentContribution].content);
   }
     
   /**
    * Private method to add a list of contributions
    * 
    * @param contribution object list
    *
    */
   _setContributions(contributions){
   	 this.contributions = contributions;
   	 this.currentContribution = this.contributions.length - 1;
   	 if(this.currentContribution > -1)
   	 	this._updateContent(this.contributions[this.currentContribution].content);
   }
   
   /**
 	 * Private method to publisher search and loads userSoundEffect
 	 */
 	_loaderAndLoads(uPCs){
 		var key = null;
 		for(var x in uPCs) {
 			this.userSoundEffect.set(uPCs[x].user.id,uPCs[x].soundEffect);
 			if(this.idUser === uPCs[x].user.id) {
 				key = x;
 			}
 		}
 		return key;
 	}
     
	 /**
    * Private method to refresh the editor panel
    * 
    * @param userProductionConfiguration list
    */
	_updatePublisher(uPCs) {		
		var key = this._loaderAndLoads(uPCs);			 
		if(key !== null && uPCs[key].situation === "CONTRIBUTING"){
			this.$.content.readonly = false;
			this.$.content.focus();
			this.$.save.style.display = "inline";
			this.$.check.disabled = true;
		} else {
			this.$.content.readonly = true;
			this.$.save.style.display = "none";
			this.$.check.disabled = false;
		}
	}
	    
	/**
   * Method to remove line breaks
   * 
   * @param string
   */
	jsonEscape(str) {
		return str ? str.replace(/\n/g, "\\\\n").replace(/\r/g, "\\\\r").replace(/\t/g, "\\\\t") : '';
	}
    
	/**
   * Private method to indicate the finalization in the contricuition
   * 
   */
	_finishParticipation() {
		var content = {text:this.jsonEscape(this.$.content.value)};
		this._setSendMessage({type:'FINISH_PARTICIPATION',content:content});		
	}
    
	/**
   * Private method to set objective
   * 
   */
	_setObjective(objective){
		this.$.objective.innerHTML = objective;
	}
    
	/**
   * Private method to set user id logged
   * 
   */
	_registerUser(id){
		this.idUser = id;
	}
	
	exec(texts){
		this.printResults(diff_rodrigo(texts));
	}
	
	printResults(results){
		var html;
		for(var x in results){
		  var result = results[x];
		  var span = document.createElement('span');
		  span.classList.add(result.owner);
  		  span.appendChild(document.createTextNode(result.part.value));
  			this.$.text.appendChild(span);
	  	}
		
		this.$.content.value = "";
	}	

	
	/**
	 * Set the focus to the content area
	 */
	setFocus(){
		this.$.content.focus();
		this.domHost.playSound("moveCursor", "", "");
	}
	
  }
window.customElements.define(CooperativeEditor.is, CooperativeEditor);