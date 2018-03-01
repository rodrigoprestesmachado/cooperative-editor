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
class CooperativeEditorForm extends CooperativeEditorFormLocalization {
		static get is() { 
			return 'ce-form';
		}
		
		constructor() {
			super();
			this.production = {
				participatInProduction : false,
				arrRubricProductionConfiguration : [],
				arrUserProductionConfiguration : []
			}
			this.descriptors = [];
			this.sdate;
			this.stime;		
		}
		
		connectedCallback() {		      
			super.connectedCallback();
			const production = this;
						
			// This event is triggered when an item is selected in
			// "descriptionRubric"
			this.$.descriptionRubric.addEventListener("autocomplete-selected",function(event) {
				production.dispatchEvent(new CustomEvent('pullDescriptors', {detail:{rubricId: event.detail.value}}));
			});
			
			// This event is triggered when an item is selected in 
			// "paperSuggestPerson"
			this.$.paperSuggestPerson.addEventListener("autocomplete-selected",function(event) {
				production._setPerson({id:event.detail.value,name:event.detail.text});
				this.clear();
			});
			
			// Event available to set an externally selected production
			this.addEventListener('setProduction',this.productionSelected.bind(this));
		}
		
		// Method used by the component to add a person to the 
		// "userProductionConfiguration" list, the result of this method
		// is to an event captured by WebService.js, to which it relates
		// the selected person in the "paperSuggestPerson" tag to this new production
 		_setPerson(person){			
			var userProductionConfiguration = new Object();
			if(this.production.id)
				userProductionConfiguration.production = { id : this.production.id };
			userProductionConfiguration.user = person;
			
			this.dispatchEvent(new CustomEvent('userProductionConfiguration', {detail:  {"userProductionConfiguration" : userProductionConfiguration}}));
		}
 		
 		// Method used by "WebService.js" to add a "UserProductionConfiguration" 
 		// object to the internal array of this production before adding is checked
 		// if it does not have a UserProductionConfiguration with the same ID if 
 		// it has it, it will be replaced
		setRelationBetweenProductionAndUser(userProductionConfiguration){
			console.log(userProductionConfiguration);
						
			this.setProduction(userProductionConfiguration.production);
			
			var index = this._positionInArray(this.production.arrUserProductionConfiguration,"id",userProductionConfiguration.id);
			if(index > -1 ){
				this.splice('production.arrUserProductionConfiguration', index, 1,userProductionConfiguration);
			}else{	
				this.push('production.arrUserProductionConfiguration', userProductionConfiguration);
			}
		}
		
		_findInArrayById(arr, key, val) {			
		    return arr.filter(function (el) {
		    	return el[key].id == val;
		    });
		}
		
		//used by the component to convert the answer into question
		// "participate in production" from boolean to yes or no
		_convertResponse(answer){
			if(answer){
				return this.localize('true');
			}else{
				return this.localize('false');
			}
		}
		
		// Method used by "WebService.js" to set the people who were returned from the database
		suggestPeople(persons){
			var personsName = '';
			for (var i = 0; i < persons.length; i++) {
				if(this._findInArrayById(this.production.arrUserProductionConfiguration,"user",persons[i].id).length == 0 )
					personsName += `{ "text" : "` + persons[i].name + `", "value" :"` + persons[i].id + `"},`;
			}
			this.$.paperSuggestPerson.suggestions(JSON.parse("[" + personsName.substring(0, personsName.length - 1) + "]"));
		}
				
		// Set production, 
		setProduction(production){
			console.log("setProduction ");
			console.log(production);
			
			this.production.id = production.id;
			
			if(production.objective){				
				this.$.objective.alwaysFloatLabel = true;
				this.set('production.objective',production.objective);
//				this.$.objective.value = production.objective;				
			}
			if(production.productionTime){				
				this.$.productionTime.alwaysFloatLabel = true;
				this.set('production.productionTime',parseInt(production.productionTime));
//				this.$.productionTime.value = parseInt(production.productionTime);
			}
			if(production.minimumTickets){
				this.$.minimumParticipationInProduction.alwaysFloatLabel = true;
				this.set('production.minimumTickets',production.minimumTickets);
//				this.$.minimumParticipationInProduction.value = production.minimumTickets;
			}
			if(production.limitTickets){
				this.$.limitOfParticipationInProduction.alwaysFloatLabel = true;
				this.set('production.limitTickets',production.limitTickets);
				//this.$.limitOfParticipationInProduction.value = production.limitTickets;
			}
			if(production.startOfProduction){
				this.set('sdate',parseInt(production.startOfProduction));
				this.set('stime',parseInt(production.startOfProduction));
			}
			
			if(production.contributorsAndConfiguration){
				for (var i = 0; i < production.contributorsAndConfiguration.length; i++) {
					this.setRelationBetweenProductionAndUser(production.contributorsAndConfiguration[i].userProductionConfiguration);
				}
			}
			
			if(production.rubricsAndConfiguration){
				for (var i = 0; i < production.rubricsAndConfiguration.length; i++) {
					this.setRelationBetweenProductionAndRubric(production.rubricsAndConfiguration[i].rubricProductionConfiguration);
				}
			}
		}
		
		// Method provided by event to set a production from the id of the same
		productionSelected(event){
			this._resetForm();
			this.dispatchEvent(new CustomEvent('getProduction', {detail: event.detail.id}));
		}
		
		_resetForm(){
			this.production.id = null;
			this.set('production.objective',null);
			this.set('production.minimumTickets',null);
			this.set('production.limitTickets',null);
			this.set('production.productionTime',null);
			this.set('production.participatInProduction',false);
			var d = new Date();
			this.set('sdate',d.getTime());
			this.set('stime',d.getTime());
			this.set('production.arrUserProductionConfiguration',[]);
			this.set('production.arrRubricProductionConfiguration',[]);			
		}
		
		// Used by the component to return the value of a valid property a person object
		_returnIdentification(object){
			if(object.name != "null" && object.name != null){
				return object.name;
			}else{
				return object.email;
			}			
		}
		
		// Method used by the component to save the information to bank
		_setInformation(event){	
			if((event.target.value != undefined )  || event.target.text != undefined ){
			
				if("minimumParticipationInProduction" == event.target.name){
					if(isNaN(this.production.limitTickets) || (this.production.limitTickets < this.production.minimumTickets)){
						this.$.limitOfParticipationInProduction.value = parseInt(this.production.minimumTickets);
					}
				}
				
				if("limitOfParticipationInProduction" == event.target.name ){			
					if(isNaN(this.production.minimumTickets)){
						this.$.minimumParticipationInProduction.value = 0;
					}else if(this.production.minimumTickets > this.production.limitTickets){
						this.$.minimumParticipationInProduction.value = parseInt(this.production.limitTickets);
					}
				}
				
				if(isNaN(this.production.minimumTickets) || this.production.minimumTickets == ""){
					delete this.production.minimumTickets 
				}
				
				if(isNaN(this.production.limitTickets) ||  this.production.limitTickets == ""){
					delete this.production.limitTickets;
				}
				
				this.production.startOfProduction = new Date(this.sdate +" "+ this.stime).getTime();
				
				console.log(this.production);
				
				this._partialSubmit(this.production);				
			}
		}
		
		_findInArrayByEmail(arr, key, val) {			
		    return arr.filter(function (el) {
		    	return el[key].email == val;
		    });
		}
				
		_searchPeople(event) {				
			if ((event.keyCode > 64 && event.keyCode < 91) && event.target.value !=""){
				this.dispatchEvent(new CustomEvent('searchPeople', {detail: {emailSuggestion: event.path[0].value}}));
			}
			if (event.keyCode == 13 && event.target.text.trim() != ""){
				var email = event.target.text.trim();
				if(email.indexOf("@") > 2 && email.indexOf("@") < email.lastIndexOf(".") && email.lastIndexOf(".") < email.length){
					if(this._findInArrayByEmail(this.production.arrUserProductionConfiguration,"user",email).length == 0 )
						this._setPerson({ email : email });				
				}else{
					this.$.help.lastElementChild.innerHTML = this.localize('helpNewparticipat');
					this.$.help.open();
				}
				this.$.paperSuggestPerson.clear();
			}
		}
		
		_partialSubmit(form){
			this.dispatchEvent(new CustomEvent('partialSubmit', {detail:  form}));
		}
		
		_submit() {
			let is_valid = true;
			
			let startOfProduction = new Date(this.sdate +" "+ this.stime);
			
			if(startOfProduction < new Date()){
				console.log("startOfProduction invalid");
				this.production.startOfProduction = new Date().getTime();
			}
			
			if(!this.production.objective){
				console.log("objective invalid");
				this.$.objective.invalid = true;
				is_valid = false;
			}
			
//			if(!this.production.productionTime){
//				console.log("productionTime invalid");
//				this.$.productionTime.invalid = true;
//				is_valid = false;
//			}
					
			if(this.production.arrUserProductionConfiguration.length < 1){
				console.log("user invalid");
				this.$.paperSuggestPerson.required = true;
				this.$.paperSuggestPerson.$.autocompleteInput.invalid = true;
				is_valid = false;
			}
			
			console.log(this.production);	
			if(is_valid){
				this.dispatchEvent(new CustomEvent('submit', {detail: this.production}));
			}
		}
		
		_disableNumberOfParticipationInProduction(){
			this.$.minimumParticipationInProduction.disabled = true;
			this.$.limitOfParticipationInProduction.disabled = true;
		}
		
		_enableNumberOfParticipationInProduction(){
			this.$.minimumParticipationInProduction.disabled = false;
			this.$.limitOfParticipationInProduction.disabled = false;
		}
		
		_tapHelp(event){
			this.$.help.lastElementChild.innerHTML = event.target.title;
			this.$.help.open();
		}
		
		// RUBRIC METHODS
		
		// This is public method to be accessed by WebServiceApp.js.
		suggestRubric(rubrics){
			var rubricsName = '';
			for (var i = 0; i < rubrics.length; i++) {
				rubricsName += `{ "text" : "` + rubrics[i].name + `", "value" :"` + rubrics[i].id + `"},` ;
			}		
			this.$.descriptionRubric.suggestions( JSON.parse("[" + rubricsName.substring(0, rubricsName.length - 1) + "]"));	
		}
		

		// This is public method to be accessed by WebServiceApp.js.
		setRubric(rubric){
			console.log("setRubric ")
			console.log(rubric);					
			this.$.dialog.rubricProductionConfiguration.rubric = rubric;
			this.$.descriptionRubric.text = rubric.objective;
			this.descriptors = rubric.descriptors;
			this.push('descriptors');
		}
		
		// Used by WebService to set a "rubricProductionConfiguration",
		// if it already exists in the array it will be replaced
		setRelationBetweenProductionAndRubric(rubricProductionConfiguration) {	
			console.log("setRelationBetweenProductionAndRubric ");
			console.log(rubricProductionConfiguration);
			this.setProduction(rubricProductionConfiguration.production);
					
			var index = this._positionInArray(this.production.arrRubricProductionConfiguration,"id" ,rubricProductionConfiguration.id);
			if(index >= 0 ){
				this._incrementCountersProduction();
				this.splice('production.arrRubricProductionConfiguration', index, 1,rubricProductionConfiguration);	
			}else{	
				this.push('production.arrRubricProductionConfiguration',rubricProductionConfiguration);
			}
	    }
			
		_incrementCountersProduction(){
			console.log("incrementCountersProduction");
			
			var arrRuPrCo = this.production.arrRubricProductionConfiguration;
			var total = 0;
			for (var i = 0, len = arrRuPrCo.length; i < len; i++) {				
				if(arrRuPrCo[i].minimumTickets != "null"){
					total += parseInt(arrRuPrCo[i].minimumTickets);
				}
			}			
			this.$.minimumParticipationInProduction.value = total;
			
			var total = 0;
			for (var i = 0, len = arrRuPrCo.length; i < len; i++) {				
				if(arrRuPrCo[i].limitTickets != "null"){
					total += parseInt(arrRuPrCo[i].limitTickets);
				}
			}
			this.$.limitOfParticipationInProduction.value = total;
			
			if(this.$.minimumParticipationInProduction.value == 0 || this.$.limitOfParticipationInProduction.value == 0){				
				this._enableNumberOfParticipationInProduction();
				this.$.minimumParticipationInProduction.value = "";
				this.$.limitOfParticipationInProduction.value = "";
				
			}else{
				this._disableNumberOfParticipationInProduction();			
			}
			
		}
		
		rubricRemoved(situetion) {			
			if(situetion == "OK"){
				var index = this._positionInArray(this.production.arrRubricProductionConfiguration,"rubric",this.rubricToRemove);	
				this.splice('production.arrRubricProductionConfiguration', index, 1);
				this._incrementCountersProduction();
				this.rubricToRemove = null;
			}else{
				alert("algo deu errado");	
			}
	    }
				
		_positionInArray(arr, key, val){
			for(var i=0; i < arr.length; i++) {
			    if(arr[i][key] === val) {
			        return i;
			    }
			}			
			return -1;
		}
		
		
		// Respond to the click of a remove a participant button
		_clearParticipant(event){
			console.log(event.model.item);
			var index = this._positionInArray(this.production.arrUserProductionConfiguration,"id",event.model.item.id);				
			this.splice('production.arrUserProductionConfiguration', index, 1);
						
		}

		// Respond to the click of a remove a descriptor button, 
		// when the dialog is open for
		_clearDescriptor(event){			
			var item = event.model.item,
			evaluation = this.descriptors.indexOf(item);
			this.splice('descriptors', evaluation, 1);
		}
		
		// When the person finishes filling a descriptor, at enter this
		// descriptor is added to the list of descriptors
		_enterEvent(event){
			if (event.keyCode === 13){	
				this.push('descriptors', event.path[0].value);
				event.target.value = "";
			}
		}
		
		// Quando for alterado os valores de mínimo e limite de número de
		// participações este método será chamado para salvar os valores na rubrica.
		// A ordem para alterar é, se no campo mínino for um número e campo
		// limite não for ou se o campo limite for menor que o mínimo o campos 
		// limite terá o valor de mínimo Caso so o campo mínimo não tenha valor
		// numerico, será setado o valor de mínimo será o calor de limite
		_setInformactionRubric(event){
			console.log("_setInformactionRubric");
			if(event.target.value.trim() != "" && event.target.name != "" 
				&& event.target.value != "null" && event.target.value != null){
				var ruPrCo = event.model.item;
							
				if("minimumOfParticipation" == event.target.name){
					if(isNaN(ruPrCo.limitTickets) || (parseInt(ruPrCo.limitTickets) < parseInt(ruPrCo.minimumTickets))){
						ruPrCo.limitTickets = ruPrCo.minimumTickets;
					}
				}

				if("limitOfParticipation" == event.target.name){
					if(isNaN(ruPrCo.minimumTickets)){
						ruPrCo.minimumTickets = 0;
					}else if(parseInt(ruPrCo.minimumTickets) > parseInt(ruPrCo.limitTickets)){
						ruPrCo.minimumTickets = ruPrCo.limitTickets;
					}
				}					
				this._updateRubricProductionConfiguration(ruPrCo);
			}
		}
		
		// To search for rubrics in the database, respond to the key
		// click in the rubric field
		_searchRubric(event) {
			if(event.target.text !=""){
				this.dispatchEvent(new CustomEvent('searchRubric', {detail: {rubricSuggestion: event.target.text}}));
			}
		}
		
		// Trash button, appears when the dialog is open, to discard a rubric.
		_discardButton() {	
			console.log("_discardRubric ");
			this.$.confirm.open();	        
	    }	
		
		dismissDialog(e) {		      
		   if (e.detail.confirmed) {
			   if(this.$.dialog.rubricProductionConfiguration.rubric){
		        	this.rubricToRemove = this.$.dialog.rubricProductionConfiguration.rubric;
					var _rubricId = this.rubricToRemove.id;
					this.dispatchEvent(new CustomEvent('deleteRubric', {detail: { rubricId: _rubricId }}));
					console.log(this.rubricToRemove);
				}
		   }		   
		   this._closeDialog();
	    }
				
		// dissociates the production line
		_disconnectButton(event) {
			if(undefined != event.model){
				console.log("_disconnectButton");
				console.log(event.model);
	        	var id = event.model.item.id;
				this.dispatchEvent(new CustomEvent('disconnectRubric', {detail: {configurationId: id }}));	
				this.rubricToRemove = event.model.item.rubric;
			}			
	        this._closeDialog();
	    }	
		
		
		_openDialog(event) {			
			if(undefined != event.model){	
				this.$.dialog.rubricProductionConfiguration = event.model.item;
				this.$.descriptionRubric.text = event.model.item.rubric.objective;
				this.descriptors = event.model.item.rubric.descriptors;
				this.push('descriptors');
			}else{
				this.$.dialog.rubricProductionConfiguration = new Object();
			}		
			
	        this.$.dialog.open();
	    }	
			
		_closeDialog() {	
			this.$.evaluetion.value = null;
			this.descriptors = [];
			this.push('descriptors');
			this.$.descriptionRubric.text = null;
	        this.$.dialog.close();
	        this.$.dialog.rubricProductionConfiguration = null;
	    }	
		
		// Button to save a rubric, appears when the dialog is open.
		_saveButton() {	
			console.log("_saveButton");
			if(this.$.descriptionRubric.text){
				// If the field has something written, consider that it was not
				// added to the descriptors, then add it
				if(this.$.evaluetion.value && this.$.evaluetion.value.trim() != ""){
					this.descriptors.push(this.$.evaluetion.value);
				}
				
				var ruPrCo = this.$.dialog.rubricProductionConfiguration;
				isNaN(ruPrCo.minimumTickets) ? delete ruPrCo.minimumTickets : '' ;
				isNaN(ruPrCo.limitTickets) ? delete ruPrCo.limitTickets : '' ;
				ruPrCo.rubric = (ruPrCo.rubric) ? ruPrCo.rubric : new Object() ;
				ruPrCo.rubric.objective = this.$.descriptionRubric.text;
				ruPrCo.rubric.descriptors = this.descriptors;
								
				
				this._updateRubricProductionConfiguration(ruPrCo);				
			
			}
			this._closeDialog();			
	    }
		
		_updateRubricProductionConfiguration(rubricProductionConfiguration){
			if(rubricProductionConfiguration.production == null && this.production.id){
				rubricProductionConfiguration.production = new Object();
				rubricProductionConfiguration.production.id = this.production.id;
			}
			
			console.log("updateRubricProductionConfiguration");
			console.log(rubricProductionConfiguration);			
			this.dispatchEvent(new CustomEvent('rubricProductionConfiguration', {detail: {"rubricProductionConfiguration": rubricProductionConfiguration}}));
		}
		
		_cutText(txt){
			// o texto é maior que o numero de caracteres a ser exibido
	        if(txt.length > 50)
	            txt = txt.substring(0, txt.indexOf(" ", 50)) + "...";
			
	        return txt;
		}
			
		//END METHODS OF RUBRIC
	}
	
	window.customElements.define(CooperativeEditorForm.is, CooperativeEditorForm);  