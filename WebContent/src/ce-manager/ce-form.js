/**
 * @license
 * Copyright 2018, Instituto Federal do Rio Grande do Sul (IFRS)
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
				rubricProductionConfigurations : [],
				userProductionConfigurations : [],
				startOfProduction : new Date().getTime()
			}

			this.ceManager = document.querySelector("ce-manager");

			this.descriptors = [];
		}

		connectedCallback() {
			super.connectedCallback();
			var production = this;

			// This event is triggered when an item is selected in
			// "paperSuggestPerson"
			this.$.paperSuggestPerson.addEventListener("autocomplete-selected",function(event) {
				production._setPerson({id:event.detail.value,name:event.detail.text});
				// This "this" is the paperSuggestPerson
				this.clear();
			});

			// Event available to set an externally selected production
			this.addEventListener('setProduction',this.productionSelected.bind(this));
		}

		/**
		 * Method accessed by the setProduction event, to fetch a production from the id
		 *
		 * @param the event to retrieve the production id
		 */
		productionSelected(event){
			this._resetForm();
			this.dispatchEvent(new CustomEvent('getProduction', {detail: event.detail.id}));
		}

		/**
		 * Set production
		 *
		 * @param Production
		 */
		setProduction(production){
			this.production.id = production.id;

			if(production.objective){
				this.$.objective.alwaysFloatLabel = true;
				this.set('production.objective',production.objective);
			}

// 			TODO Is temporarily disabled
//			if(production.productionTime){
//				this.$.productionTime.alwaysFloatLabel = true;
//				this.set('production.productionTime',parseInt(production.productionTime));
//			}

			if(production.minimumTickets && parseInt(production.minimumTickets) !== 0 ){
				this.$.minimumParticipationInProduction.alwaysFloatLabel = true;
				this.set('production.minimumTickets',production.minimumTickets);
			}
			if(production.limitTickets && parseInt(production.limitTickets) !== 0){
				this.$.limitOfParticipationInProduction.alwaysFloatLabel = true;
				this.set('production.limitTickets',production.limitTickets);
			}
			if(production.startOfProduction){
				var a = new Date(parseInt(production.startOfProduction));
				this.$.sdate.datetime = a;
				this.$.stime.hour = a.getHours();
				this.$.stime.minute = a.getMinutes();
				this.set('production.startOfProduction',parseInt(production.startOfProduction));
			}

			if(production.userProductionConfigurations){
				this.set('production.userProductionConfigurations',production.userProductionConfigurations);
			}
			if(production.rubricProductionConfigurations){
				this.set('production.rubricProductionConfigurations',production.rubricProductionConfigurations);
			}
		}

		// Method used by "WebService.js" to add a "UserProductionConfiguration"
 		// object to the internal array of this production before adding is checked
 		// if it does not have a UserProductionConfiguration with the same ID if
 		// it has it, it will be replaced
		setUserProductionConfiguration(uPC){
			this.setProduction(uPC.production);
			var index = this._positionInArray(this.production.userProductionConfigurations,"id",uPC.id);
			if(index > -1 ) {
				this.splice('production.userProductionConfigurations', index, 1,uPC);
			} else {
				this.push('production.userProductionConfigurations', uPC);
			}
		}

		/**
		 * Method used by "WebService.js" to set the people who were returned from the database
		 *
		 * @param User List
		 */
		suggestPeople(persons){
			var personsName = '';
			for (var i = 0; i < persons.length; i++) {
				if(this._findInArrayById(this.production.userProductionConfigurations,"user",persons[i].id).length == 0 )
					personsName += `{ "text" : "` + persons[i].name + `", "value" :"` + persons[i].id + `"},`;
			}
			this.$.paperSuggestPerson.suggestions(JSON.parse("[" + personsName.substring(0, personsName.length - 1) + "]"));
		}

		/**
		 * Respond to the click of a remove a participant button
		 *
		 * @param The event to retrieve the clicked item
		 */
		_clearParticipant(event){
			var index = this._positionInArray(this.production.userProductionConfigurations,"id",event.model.item.id);
			this.splice('production.userProductionConfigurations', index, 1);
			this.dispatchEvent(new CustomEvent('disconnectUserProductionConfiguration', {detail:  event.model.item.id}));
		}

		/**
		 * Disable input fields
		 */
		_disableNumberOfParticipationInProduction(){
			this.$.minimumParticipationInProduction.disabled = true;
			this.$.limitOfParticipationInProduction.disabled = true;
		}

		/**
		 * Enable input fields
		 */
		_enableNumberOfParticipationInProduction(){
			this.$.minimumParticipationInProduction.disabled = false;
			this.$.limitOfParticipationInProduction.disabled = false;
		}

		_findInArrayByEmail(arr, key, val) {
		    return arr.filter(function (el) {
		    	return el[key].email == val;
		    });
		}

		_findInArrayById(arr, key, val) {
		    return arr.filter(function (el) {
		    	return el[key].id == val;
		    });
		}

		/**
		 * To save production, without ending it
		 *
		 * @param Production
		 */
		_partialSubmit(production){
			this.dispatchEvent(new CustomEvent('partialSubmit', {detail:  production}));
		}

		/**
		 * To reset the form
		 */
		_resetForm(){
			this.production.id = null;
			this.set('production.objective',null);
			this.set('production.minimumTickets',null);
			this.set('production.limitTickets',null);
			this.set('production.productionTime',null);
			this.set('production.participatInProduction',false);
			var d = new Date();
			this.set('production.startOfProduction',d.getTime());
			this.set('production.userProductionConfigurations',[]);
			this.set('production.rubricProductionConfigurations',[]);
		}

		/**
		 * Used by the component to return the value of a valid property a person object
		 *
		 * @param An object user
		 */
		_returnIdentification(object){
			if(object.name !== "null" && object.name != null){
				return object.name;
			}else{
				return object.email;
			}
		}
		/**
		 * Used to control the entries in the users field, if the key is a
		 * character, it suggests people, if it is "enter" saves the person
		 *
		 * @param event
		 */

		_inputUser(event) {
			var email = event.target.text.trim();
			if ((event.keyCode > 64 && event.keyCode < 91) && email !=""){
				this.dispatchEvent(new CustomEvent('searchPeople', {detail: {emailSuggestion: email}}));
			} else
			if (event.keyCode === 13 && email !== ""){
				if(this._emailValid(email)){
					if(this._findInArrayByEmail(this.production.userProductionConfigurations,"user",email).length == 0 )
						this._setPerson({ email : email });
				} else {
					this._transmitHelp(this.localize('helpNewparticipat'));
				}
				this.$.paperSuggestPerson.clear();
			}
		}

		/**
		 * Test a word to see if it is in a valid email format
		 *
		 * @param the email
		 */
		_emailValid(email) {
			return email !== ""
				&& email.indexOf("@") > 2
				&& email.indexOf("@") < email.lastIndexOf(".")
				&& email.lastIndexOf(".") < email.length;
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
					delete this.production.minimumTickets;
				}

				if(isNaN(this.production.limitTickets) ||  this.production.limitTickets == ""){
					delete this.production.limitTickets;
				}

				this._partialSubmit(this.production);
			}
		}

		_setDate(event) {
			var a;
			if(this.$.stime.time)
				a = new Date(this.$.sdate.date+"T"+this.$.stime.time);
			else
				a = new Date(this.$.sdate.date+"T00:00:00.000");
			this.production.startOfProduction = a.getTime();
			this._partialSubmit(this.production);
		}


		/**
		 * Method used by the component to add a person to the
		 * "userProductionConfiguration" list, the result of this method
		 * is to an event captured by WebService.js, to which it relates
		 * the selected person in the "paperSuggestPerson" tag to this new production
		 *
		 * @param User
		 */
 		_setPerson(user) {
			var uPC = new Object();
			if(this.production.id)
				uPC.production = { id : this.production.id };
			uPC.user = user;

			this.dispatchEvent(new CustomEvent('userProductionConfiguration', {detail: {"uPC" : uPC }}));
		}

		_submit() {
			let is_valid = true;

			let startOfProduction = new Date(this.sdate +" "+ this.stime);

			if(startOfProduction < new Date())
				this.production.startOfProduction = new Date().getTime();

			if(!this.production.objective){
				this.$.objective.invalid = true;
				is_valid = false;
			}
// 			TODO Is temporarily disabled
//			if(!this.production.productionTime){
//				console.log("productionTime invalid");
//				this.$.productionTime.invalid = true;
//				is_valid = false;
//			}

			if(this.production.userProductionConfigurations.length < 1){
				this.$.paperSuggestPerson.required = true;
				this.$.paperSuggestPerson.$.autocompleteInput.invalid = true;
				is_valid = false;
			}

			if(is_valid)
				this.dispatchEvent(new CustomEvent('submit', {detail: this.production}));
		}

		_openDialogRubric(event){
			var rubric = (event.currentTarget.rubric) ? event.currentTarget.rubric : null;
			this.domHost.openDialogRubric(rubric);
		}

		// dissociates the production line
		_disconnectButton(event) {
			var ruPrCo = event.model.item;
			if(undefined != ruPrCo){
				var id = ruPrCo.id;
				this.dispatchEvent(new CustomEvent('disconnectRubric', {detail: {configurationId: id }}));
			}
	    }

		/**
		 * used to open the help dialog
		 *
		 * @param event to retrieve the description of the help and send it to the dialog
		 */
		_tapHelp(event){
			this._transmitHelp(event.target.title);
		}

		/**
		 * 	method that passes to the dialogue the content of what must be inserted.
		 *
		 * @param the string of what should be inserted in the dialog
		 */
		_transmitHelp(content){
			this.domHost.openHelp(content);
		}

		_updateUPC(event){
			var index = this._positionInArray(this.production.userProductionConfigurations,"id",event.model.item.id);
			if(index >= 0)
				this.dispatchEvent(new CustomEvent('userProductionConfiguration', {detail:  {"uPC" : event.model.item}}));
		}

		// Used by WebService to set a "rubricProductionConfiguration",
		// if it already exists in the array it will be replaced
		setRubricProductionConfiguration(rPC) {
			this.setProduction(rPC.production);
			var index = this._positionInArray(this.production.rubricProductionConfigurations,"id" ,rPC.id);
			if(index >= 0 ){
				this._incrementCountersProduction();
				this.splice('production.rubricProductionConfigurations', index, 1,rPC);
			}else{
				this.push('production.rubricProductionConfigurations',rPC);
			}
	    }

		/**
		 * novo
		 */
		newRubric(rubric){
			var rPC = new Object();
			rPC.rubric = rubric;
			if(this.production.id) {
				rPC.production = new Object();
				rPC.production.id = this.production.id;
			}
			this.dispatchEvent(new CustomEvent('rubricProductionConfiguration',{detail:{"rPC":rPC}}));
		}


		rubricRemoved(situetion) {
			if(situetion === "OK") {
				var index = this._positionInArray(this.production.rubricProductionConfigurations,"rubric",this.rubricToRemove);
				this.splice('production.rubricProductionConfigurations', index, 1);
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

		_cutText(txt){
			// o texto é maior que o numero de caracteres a ser exibido
	        if(txt.length > 50)
	            txt = txt.substring(0, txt.indexOf(" ", 50)) + "...";

	        return txt;
		}

		_updateRubricProductionConfiguration(rPC){
			if(rPC.production == null && this.production.id){
				rPC.production = new Object();
				rPC.production.id = this.production.id;
			}

			this.dispatchEvent(new CustomEvent('rubricProductionConfiguration', {detail: {"rPC": rPC}}));
		}
	}

	window.customElements.define(CooperativeEditorForm.is, CooperativeEditorForm);