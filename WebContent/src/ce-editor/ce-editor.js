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
		this.content = "";
		this.ctemp = "";
		this.cSpeech = "";
		// Count 100 actions with the keyboard
        this.countTypingMessages = 70;
	}
     
	connectedCallback() {
		super.connectedCallback();
	}
	
	/**
     * Executes the messages from the server
     */
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
	      	case "ACK_TYPING_CONTRIBUTION":
	      		this._ackTypingContributionHandler(json);
	      		break;
      	}
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
		if(this.$.check.contentCheck) {
			this.currentContribution  = this.contributions.length - 1;
			this.ctemp = '';
			this._updateContent(this.ctemp);
			this.$.displayNumberContribution.style.display = "none";
		} else {			
			this.$.previous.firstClick = true;
			this.$.displayNumberContribution.style.display = "inline";
			this._next();
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
			this.ctemp = this.content;
		}

		event.target.firstClick = false;
		
		var oldText = '';
		var newText = '';
		this.ctemp = '';
		
		for(var x = 0; x <= this.currentContribution ; x++){
			oldText = this.ctemp;
			newText = this._getTextContritution(x);
		}
		var clazz = this._getClassUser(this.contributions[x].user.id);

		this._updateContent(this._diff(oldText,newText,clazz));
		this._talkContribution();
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
			this.ctemp = '';
		}
		
		var oldText = this.ctemp;
		var newText = this._getTextContritution(this.currentContribution);
		var clazz = this._getClassUser(this.contributions[this.currentContribution].user.id);
		this._updateContent(this._diff(oldText,newText,clazz));
		this._talkContribution();
	}
	
	/**
	 * Return the text according to the order that was generated
	 * 
	 * @param int order
	 * @return string text
	 */
	
	_getTextContritution(order) {
		if(this.contributions[order] !== undefined){
			var dmp = new diff_match_patch();
			var patches = dmp.patch_fromText(this.contributions[order].content);
			this.ctemp = dmp.patch_apply(patches, this.ctemp)[0];
		}
		return this.ctemp;
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
     * @return text in HTML format with marked diff
     */     
	_diff(oldText,newText,clazz){
		var DIFF_DELETE = -1;
		var DIFF_INSERT = 1;
		var DIFF_EQUAL = 0;
		this.cSpeech = "";
		
		var dmp = new diff_match_patch();
		var diffs =  dmp.diff_main(oldText,newText);
		var html = [];
		var pattern_amp = /&/g;
		var pattern_lt = /</g;
		var pattern_gt = />/g;
		var pattern_para = /\n/g;
		for (var x = 0; x < diffs.length; x++) {
			var op = diffs[x][0];    // Operation (insert, delete, equal)
			var data = diffs[x][1];  // Text of change.
			var text = data.replace(pattern_amp, '&amp;').replace(pattern_lt, '&lt;').replace(pattern_gt, '&gt;').replace(pattern_para, '&para;<br>');
		switch (op) {
		  case DIFF_INSERT:
		    html[x] = '<ins data-start="'+this.localize('insStart') +'" data-end="'+this.localize('insEnd') +'" class="'+clazz+'">' + text + '</ins>';
		    this.cSpeech += this.localize('insStart') +", "+ text +", "+this.localize('insEnd');
		    break;
		  case DIFF_DELETE:
		    html[x] = '<del data-start="'+this.localize('delStart') +'" data-end="'+this.localize('delEnd') +'" class="'+clazz+'">' + text + '</del>';
		    this.cSpeech += this.localize('delStart') +", "+ text +", "+this.localize('delEnd');
		    break;
		  case DIFF_EQUAL:
		    html[x] = '<span>' + text + '</span>';
		    this.cSpeech += ", "+ text +", ";
		    break;
		    }
		  }
		  return html.join('');
	}
	
	/**
	 * Simulates the reading of the label of contributions
	 */	
	_talkContribution() {
		this._adjustLabel();
		if(this.contributions[this.currentContribution] !== undefined ) {
			var soundEffect = this._getSoundEffect(this.contributions[this.currentContribution].user.id);
			this.domHost.playTTS(this.labelContribution+". "+this.cSpeech);
			this.domHost.playSound("nextContribution", soundEffect.effect, soundEffect.position);
		}
	}
	
	/**
	 * Adjust the label of contributions
	 */
	_adjustLabel(){
		if(this.contributions[this.currentContribution] !== undefined ) {
			var descri = this.currentContribution + 1 +' '+this.contributions[this.currentContribution].user.name;
			this.labelContribution = this.localize('contribution','descripction',descri);
		}
	}
     
	/**
     * Private method to display the text in the editor
     * @param text to be displayed in the editor
     */
	_updateContent(txt){
		this.$.text.innerHTML = txt;
	}
     
	/**
	 * Private method add a contribution
	 * @param contribution object
	 */
	_setContribution(contribution){
		contribution.content = this.jsonUnescape(contribution.content);
		this.contributions.push(contribution);
		this.currentContribution = this.contributions.length - 1;
		var dmp = new diff_match_patch();	
		var patches = dmp.patch_fromText(contribution.content);
		this.content = dmp.patch_apply(patches, this.content)[0];
		this.$.content.value = this.content;
	}
     
   /**
    * Private method to add a list of contributions
    * @param contribution object list
    */
   _setContributions(contributions){
	   for(var contribution of contributions){
		   this._setContribution(contribution);
	   }
   }
   
   /**
 	 * Private method to publisher search and loads userSoundEffect
 	 * @param Array userProductionConfigurations
 	 * @return int User id
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
		return str ? str.replace(/\n/g, "\\\\n").replace(/\r/g, "\\\\r").replace(/\t/g, "\\\\t").replace(/\"/g, "'") : '';
	}
	
	/**
	* Method to add line breaks
	* 
	* @param string
	*/
	jsonUnescape(str) {
		return str ? str.replace(/\\n/g, "\n").replace(/\\r/g, "\r").replace(/\\t/g, "\t").replace(/\\"/g, "'").replace(/\\/g, "") : '';
	}
	
	/**
	 * Sends the message of each contribution character to the server. 
	 * The server sends it back to the client to inform that another user still contributing
	 */
	_typingContribution(){
		if (CooperativeEditorParticipants.userSituation === "CONTRIBUTING")
			this._setSendMessage({type:'TYPING_CONTRIBUTION'});	
	}
	
	/**
	 * Private method to handle the ACK_TYPING_CONTRIBUTION message from the 
	 * server
	 * 
	 * @param The JSON message
	 */
	_ackTypingContributionHandler(json){
	       
       var playTyping = false;
       
       if (this.countTypingMessages === 70){
    	   this.countTypingMessages = 0;
    	   playTyping = true;
       }  
       else
           this.countTypingMessages++;
       
       if ((json.user !== CooperativeEditorParticipants.userName) && (playTyping))
    	   this.domHost.playTTS(this.localize('typingContribution','name', json.user));
	}

	/**
	 * Private method to indicate the finalization of the contribution
	 */
	_finishParticipation() {
		var dmp = new diff_match_patch();
		var diffs = dmp.diff_main(this.content, this.$.content.value);
		dmp.diff_cleanupSemantic(diffs);		
		var patches = dmp.patch_make('', diffs);		
		var text = dmp.patch_toText(patches);
		var content = {text:this.jsonEscape(text)};				
		this._setSendMessage({type:'FINISH_PARTICIPATION',content:content});	
	}
    
	/**
	 * Private method to set objective
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
	 * 
	 */
	readComponentStatus(){
	    this.domHost.playTTS(this.$.content.value);
	}
	
	/**
	 * Set the focus to the content area
	 */
	setFocus(){
		this.$.content.focus();
		this.domHost.playSound("moveCursor", "", "");
	}
	
	/**
	 * Log the users navigation
	 */
	_browse(){
		this._setSendMessage({type:'BROWSE'});
	}
	
  }
window.customElements.define(CooperativeEditor.is, CooperativeEditor);