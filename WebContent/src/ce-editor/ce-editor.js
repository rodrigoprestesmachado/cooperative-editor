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
		this.labelContribution = 1;
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
		  			this._registerUser(json.idUser);
		  			this._setContributions(json.production.contributions);
		  			this.userProductionConfigurations = json.production.userProductionConfigurations;
		  			this._updatePublisher(json.production.userProductionConfigurations);
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
			this.$.check.contentCheck = false;
			this.currentContribution  = this.contributions.length - 1;
			this._updateContent(this.contributions[this.currentContribution].content);
			this.$.next.disabled = true;
			this.$.previous.disabled = true;
			this.$.displayNumberContribution.style.display = "none";
		} else {
			this.$.check.contentCheck = true;
			this.$.next.disabled = false;
			this.$.previous.disabled = false;
			this.$.previous.firstClick = true;
			this.$.displayNumberContribution.style.display = "inline";

			// activated until the history is working
			this.currentContribution = 0;
			this.labelContribution = 1;
			this._updateContent(this._diff());

			// history disabled until its correct
			//var texts = [];
			//for(var x in this.contributions)
				//texts.push({text:this.contributions[x].content,owner:this._getClassUser(this.contributions[x].user.id)});
			//this.exec(texts);
		}
	}
	
	/**
     * Private method to return to previous diff
     *  
     */
	_previous(event){		
		if(this.currentContribution > 0){
			this.currentContribution--;
			this.labelContribution--;
		}else{
			this.currentContribution = this.contributions.length - 1;
			this.labelContribution = this.contributions.length;
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
			this.labelContribution++;
		} else {
			this.currentContribution = 0;
			this.labelContribution = 1;
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
		return this.userSoundEffect.get(id).color
	}
	
	/**
     * Private method to apply the diff
     * 
     * @return text in HTML format with marked diff
     *
     */     
	_diff(){
		var text1 = "";
		if(this.currentContribution > 0)
			text1 = this.contributions[this.currentContribution - 1].content;
		var text2 = this.contributions[this.currentContribution].content;
		var clazz = this._getClassUser(this.contributions[this.currentContribution].user.id);
		var dmp = new diff_match_patch();
   	var d = dmp.diff_main(text1, text2, false);
   	dmp.diff_cleanupSemantic(d);
	   	
   	var author = this.contributions[this.currentContribution].user.name;
   	this.domHost.playTTS(super.localize("contribution") + "," + this.labelContribution + "," + author);
   	
   	for (var x in this.userProductionConfigurations) {
   		var upc = this.userProductionConfigurations[x];
   		if (upc.user.name === author){
   			var effect = upc.soundEffect.effect;
   			var position =  upc.soundEffect.position;
   		}
   	}
   	this.domHost.playSound("nextContribution", effect, position);
   	
   	return dmp.diff_prettyHtml(d,clazz);
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
    * Private method to refresh the editor panel
    * 
    * @param userProductionConfiguration list
    */
	_updatePublisher(uPCs) {
  	  	for(var x in uPCs) {
  	  		this.userSoundEffect.set(uPCs[x].user.id,uPCs[x].soundEffect);
			if(this.idUser === uPCs[x].user.id){
			    if(uPCs[x].situation === "CONTRIBUTING"){
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
				
		// Test cases
		// three participations
		//var texts = [{text:"Rodrigo", owner:"A"}, {text:"Rodrigo Prestes", owner:"B"}, {text:"Rodrigo Prestes Machado", owner:"C"}];
		//var texts = [{text:"Rodrigo", owner:"A"}, {text:"Rodrigo Prestes", owner:"B"}, {text:"RodrABC Prestes", owner:"C"}];
		//var texts = [{text:"Rodrigo", owner:"A"}, {text:"Rodryygo", owner:"B"}, {text:"Rodryygo Prestes", owner:"C"}];
		//var texts = [{text:"Rodrigo", owner:"A"}, {text:"Rodrigo Prestes", owner:"B"}, {text:"Rodrigoo Prrestis", owner:"C"}];
		
		// More than three participations
		//var texts = [{text:"Rodrigo", owner:"A"}, {text:"Rodrigo Prestes", owner:"B"}, {text:"Rodrigo Prestes Machado", owner:"C"}, {text:"Rodrigo Prestes Machado!!", owner:"A"}];
		//var texts = [{text:"Rodrigo", owner:"A"}, {text:"Rodrigo Prestes", owner:"B"}, {text:"Rodrigo Prestes Machado", owner:"C"}, {text:"Rodrigo Prestes Myychado", owner:"A"}];
		//var texts = [{text:"Rodrigo", owner:"A"}, {text:"Rodrigo Prestes", owner:"B"}, {text:"Rodrigo Prestis Machado", owner:"C"}, {text:"Roodrigo Prestis Machado", owner:"A"}];
		
		//var texts = [{text:"Rodrigo", owner:"A"}, {text:"Rodrigo Prestes", owner:"B"}, {text:"Rodrigo Prestes Machado", owner:"C"}, {text:"Rodrigo Prestes Machado: primeiro", owner:"A"}, {text:"Rodrigo Prestes Machado: primeiro segundo", owner:"C"}];
		//var texts = [{text:"Rodrigo", owner:"A"}, {text:"Rodrigo Prestes", owner:"B"}, {text:"Rodrigo Prestis Machado", owner:"C"}, {text:"Rodrigo Prestis Machado: primeiro", owner:"A"}, {text:"Rodrigo Prestis Machado: Primeiro, segundo", owner:"C"}];
		// Remove
		//var texts = [{text:"Rodrigo", owner:"A"}, {text:"Rodrigo Prestes", owner:"B"}, {text:"Rodrigo Prest", owner:"C"}, {text:"Rodrigo Prestes", owner:"C"}];
		//var texts = [{text:"Rodrigo", owner:"A"}, {text:"Rodrgo", owner:"B"}, {text:"Rodrigo Prestes", owner:"C"}];
		
		
		var diff;
		var previous = "";
		var results;
		var previousResults = new Array();
		for (var i = 0; i < (texts.length - 1); i++) {
			
			results = new Array();
			if (previous === "")
				diff = JsDiff.diffChars(texts[i].text, texts[i+1].text);
			else{
				diff = JsDiff.diffChars(previous, texts[i+1].text);
				previous = "";
			}
			
			// Indicates the number of characters already discovered in the previous 
			// string. It is used to know start point to cut the string of the new part
			var discovered = 0;
			
			// Indicates the number of characters that still need to be discovered
			var remaining = 0;
			
			// Stores the number of characters of the mutation in the value of a part 
			// (added or modified) 
			var mutation = 0;
			
			diff.forEach(function(part){
				 var splitPoint = "";
				 var owner = "";
				 if (! part.removed ){
					 if (part.added){
						 results.push({part:part, owner:texts[i+1].owner});
						 mutation += part.count;
					 }
					 else{
						 // We are discovering a new string
						 discovered = 0;
						 
						 // If it's the first diff, assign the owner
						 if (previousResults.length === 0)
							 results.push({part:part, owner:texts[i].owner});
						 else{
							 
							 remaining = part.count;
							 // Checking the contributions' owners
							 for (var x in previousResults){
								 
								 // The owners of all characters of the previous part/result have 
								 // already been discovered
								 if (previousResults[x].used == true)
									 continue;
								 
								 // if the new part is larger than the previous part then we must split
								 // to assign owners
								if (part.count > previousResults[x].part.count){
									
									// If the number of characters of the new part is equals to the number of 
									// characters already discovered plus (+) the number of characters in the 
									// mutation (added or modified) then we have to discard the previous part
									if (previousResults[x].part.count != (previousResults[x].usedCharacters + mutation)){
										
										// Find the number of characters that will be used to cut the string/value of the new part
										var tmpAmount = previousResults[x].part.count - previousResults[x].usedCharacters;
										// Check the number of characters of the previous part/result is not greater than the remainder
										var amount = tmpAmount > remaining ? remaining : tmpAmount;
										
										
										var value = part.value.substring(discovered, discovered + amount)
										var newPart = {count:value.length, value:value};
										results.push({part:newPart, owner:previousResults[x].owner});
										
										// Updating the number of discovered and remaining characters
										discovered += amount;
										remaining = part.count - discovered;
										
										// Saves the number of characters already discovered in the previous part/result
										previousResults[x].usedCharacters += amount;
										
										// Mark the previous part/result because all of the characters were discovered 
										if (previousResults[x].usedCharacters >= previousResults[x].part.count ){
											previousResults[x].used = true;
											mutation = 0;
										}
									}
									else{
										// if it is a change in the word then discard the previous part/result
										previousResults[x].used = true;
										mutation = 0;
										continue;
									} 
								}
								else {
									results.push({part:part, owner:previousResults[x].owner});
									
									// Stores the number of characters that have already been identified owners
									previousResults[x].usedCharacters += part.value.length;
									discovered += part.count;
									// Eliminates possibility of negative number
									remaining = Math.abs(part.count - discovered);
									
									// Mark the previous part/result because all of the characters were discovered 
									//TODO test to see if we can sum the mutation with the number of previous characters
									if ((previousResults[x].usedCharacters + mutation) >= previousResults[x].part.count )
										previousResults[x].used = true;
									
									break;											 
								}
								
							 }
						 }
					 }
					 previous += part.value;
				}
			});
			
			previousResults = results;
			// Releases all markings made on results obtained
			previousResults = this.freeResults(previousResults);
			
		}
		this.printResults(results);
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
	
	freeResults(previousResults){
		for (var x in previousResults){
			previousResults[x].used = false;
			previousResults[x].usedCharacters = 0;
		}
		return previousResults;
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