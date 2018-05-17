class CooperativeEditor extends CooperativeEditorLocalization {
	static get is() { return 'ce-editor'; }
	constructor() {
		super();
		this.contributions = [];
		this.currentContribution = 0;
		this.userSoundEffect = new Map();		
	}
     
	connectedCallback() {
		super.connectedCallback();
	}
	
	/**
     * Private method to start diff system
     *  
     */     
	_contentCheck(){
		if(this.$.check.contentCheck){
			this.$.check.contentCheck = false;
			this.currentContribution  = this.contributions.length - 1;
			this._updateContent(this.contributions[this.currentContribution].content);
			this.$.next.disabled = true;
			this.$.previous.disabled = true;
		} else {
			this.$.check.contentCheck = true;
			this.$.next.disabled = false;
			this.$.previous.disabled = false;
			
			var texts = [];
			for(var x in this.contributions)
				texts.push({text:this.contributions[x].content,owner:this._getClassUser(this.contributions[x].user.id)});
			
			this.showHistory(texts);
			
		}
	}
	
	/**
     * Private method to return to previous diff
     *  
     */
	_previous(){		
		if(this.currentContribution > 0){
			this.currentContribution--;			
		} else {
			this.currentContribution = this.contributions.length - 1;			
		}
		this._updateContent(this._diff());
	}
     
	/**
     * Private method to go to the next diff
     *  
     */
	_next(){
		if(this.currentContribution < (this.contributions.length -1)) {
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
     */
	_getClassUser(id){
		return this.userSoundEffect.get(id).color
	}
	
	/**
     * Private method to apply the diff
     * 
     * @return text in HTML format with marked diff
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
	   	return dmp.diff_prettyHtml(d,clazz);
     }
     
	/**
     * Private method to display the text in the editor
     * 
     * @param text to be displayed in the editor
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
      */
     _setContributions(contributions){
	   	 this.contributions = contributions;
	   	 this.currentContribution = this.contributions.length - 1;
	   	 if(this.currentContribution > -1)
	   	 	this._updateContent(this.contributions[this.currentContribution].content);
     }
     
     /**
      * Private method to sound the closed beep
      * 
      * @param json with effect and position
      */
     _endParticipation(json){
   	  	this.playSound("endParticipation", json.effect, json.position);
     }
     
     /**
      * Handles the messages from the Web Socket server 
      * 
      * @param Json in String format 
      */
	 receiveMessage(strJson){
		var json = JSON.parse(strJson);     	
      	switch(json.type){
	      	case "ACK_FINISH_PARTICIPATION":
	  			this._setContribution(json.contribution);
	  			this._endParticipation(json);
    		case "ACK_REQUEST_PARTICIPATION":
    			this._updatePublisher(json.userProductionConfigurations);
        		break;
    		case "ACK_LOAD_EDITOR":
    			this._setObjective(json.production.objective);
  				this._registerUser(json.userId);
  				this._setContributions(json.production.contributions);
  				this._updatePublisher(json.production.userProductionConfigurations);
        		break;
      	}
     }
     
	 /**
      * Private method to refresh the editor panel
      * 
      * @param userProductionConfiguration list
      */
	_updatePublisher(uPCs) {
  	  	for(var x in uPCs) {
  	  		this.userSoundEffect.set(uPCs[x].user.id,uPCs[x].soundEffect);
			if(this.userId === uPCs[x].user.id){
			    if(uPCs[x].situation === "CONTRIBUTING"){
			        this.$.content.readonly = false;
			        this.$.content.focus();
			        this.$.save.style.display = "inline";
			    } else {
			     	  this.$.content.readonly = true;
			     	  this.$.save.style.display = "none";
			 	}
			}
		}
	}
    
	/**
	 * Method to remove line breaks
	 * 
	 * @param String
	 * @return The same string without line breaks
	 */
	jsonEscape(str) {
		return str.replace(/\n/g, "\\\\n").replace(/\r/g, "\\\\r").replace(/\t/g, "\\\\t");
	}
    
	/**
	 * A private method to finish the participation/contribution
	 */
	_finishParticipation() {
		var content = "{'text':'"+this.jsonEscape(this.$.content.value)+"'}";
		this.dispatchEvent(new CustomEvent('finishParticipation',{detail:content}));
	}
    
	/**
     * Private method to set objective
     */
	_setObjective(objective){
		this.$.objective.innerHTML = objective;
	}
    
	/**
     * Private method to set user id logged
     */
	_registerUser(id){
		this.userId = id;
	}

	/**
	 * Receives an array of all contributions and do diffs operations to 
	 * determine the participation of each member of the group
	 * 
	 * @param Array texts: An array of contributions
	 */
	showHistory(texts){
		
		this.clearTexts(texts);
				
		// It is not necessary to execute diffs if the input array (texts) has only one contribution
		if (texts.length == 1)
			results = [{owner:texts[0].owner, part:{value:texts[0].text}}]
		else{
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
				previousResults = this._freeResults(previousResults);	
			}
		}
		
		this._printResults(results);
	}
	
	/**
	 * 
	 */
	clearTexts(texts){
		for (var x in texts){
			var value = texts[x].text;
			var chars = value.split('');
			for (var y in chars)
				console.log(String.fromCharCode(chars[y]));
				
		}	
	}
	
	/**
	 * Reset the control data inside the results 
	 */
	_freeResults(previousResults){
		for (var x in previousResults){
			previousResults[x].used = false;
			previousResults[x].usedCharacters = 0;
		}
		return previousResults;
	}
	
	/**
	 * Create HTML to show the results
	 */
	_printResults(results){
		var html;
		for(var x in results) {
		    var result = results[x];
		    var span = document.createElement('span');
		    span.classList.add(result.owner);
		    span.appendChild(document.createTextNode(result.part.value));
		    this.$.text.appendChild(span);
	  	}
		this.$.content.value = "";
	}
	
	/**
	 * Logs the user navigation
	 */
	_browse(){
		this.dispatchEvent(new CustomEvent('browse'));
   	}
	
}
window.customElements.define(CooperativeEditor.is, CooperativeEditor);