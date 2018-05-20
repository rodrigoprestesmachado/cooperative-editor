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
class CooperativeEditorRubric extends CooperativeEditorRubricLocalization {

		static get is() {
			return 'ce-rubric';
		}

		constructor() {
			super();
			this.rubricId;
			this.objective = '';
			this.descriptors = [];
		}

		connectedCallback() {
			super.connectedCallback();

			// This event is triggered when an item is selected in
			// "descriptionRubric"
			var ceRubric = this;
			this.$.descriptionRubric.addEventListener("autocomplete-selected",function(event) {
				ceRubric.dispatchEvent(new CustomEvent('pullDescriptors', {detail:{rubricId: event.detail.value}}));
			});
		}

		_findInArrayById(arr, key, val) {
		    return arr.filter(function (el) {
		    	return el[key].id == val;
		    });
		}

		/**
		 * Used to delete database rubric
		 *
		 * @param The event to retrieve the user's choice
		 */
		dismissDialog(event) {
		   if (event.detail.confirmed && this.rubricId) {
				this.dispatchEvent(new CustomEvent('deleteRubric', {detail: { rubricId: this.rubricId }}));
		   }
		   this._closeDialog();
	    }

		/**
		 * Used to close the edit dialog
		 */
		_closeDialog() {
			this._cleanDialog();
			this.$.dialog.close();
		}

		/**
		 * Method to place a rubric for edition
		 *
		 * @param Rubric
		 */
		setRubric(rubric){
			this.rubricId = rubric.id;
			this.objective = rubric.objective;
			this.set('descriptors',rubric.descriptors);
		}

		/**
		 * This is public method to be accessed by WebServiceApp.js.
		 *
		 * @param list of rubrics
		 */
		suggestRubric(rubrics){
			var rubricsName = '';
			for (var i = 0; i < rubrics.length; i++) {
				rubricsName += `{ "text" : "` + rubrics[i].name + `", "value" :"` + rubrics[i].id + `"},` ;
			}
			this.$.descriptionRubric.suggestions( JSON.parse("[" + rubricsName.substring(0, rubricsName.length - 1) + "]"));
		}


		/**
		 * Respond to the click of a remove a descriptor
		 * button, when the dialog is open for
		 *
		 * @param event to retrieve the clicked item
		 */
		_clearDescriptor(event) {
			var item = event.model.item,
			evaluation = this.descriptors.indexOf(item);
			this.splice('descriptors', evaluation, 1);
		}

		/**
		 * To clear the dialog
		 */
		_cleanDialog() {
			this.$.evaluetion.value = null;
			this.rubricId = null;
			this.objective = null;
			this.set('descriptors',[]);
	    }

		/**
		 *  Trash button, appears when the dialog is open, to discard
		 *  a rubric. It opens the delete confirmation dialog
		 */
		_discardButton() {
			this.$.confirm.open();
	    }

		/**
		 * When the person finishes filling a descriptor, at enter
		 * this descriptor is added to the list of descriptors.
		 *
		 * @param event to retrieve recover key code
		 */
		_enterEvent(event){
			if (event.keyCode === 13){
				this.push('descriptors', event.target.value);
				event.target.value = "";
			}
		}


		/**
		 * Button to save a rubric, appears when the dialog is open.
		 */
		_saveButton() {
			if(this.$.descriptionRubric.text) {
				// If the field has something written, consider that it
				// was not added to the descriptors, then add it
				if(this.$.evaluetion.value && this.$.evaluetion.value.trim() !== ""){
					this.descriptors.push(this.$.evaluetion.value);
				}

				var rubric = new Object();
				if(this.rubricId && this.rubricId !== "null")
					rubric.id = this.rubricId;
				rubric.objective = this.objective;
				rubric.descriptors = this.descriptors;

				this._saveRubric(rubric);
			}
			this._closeDialog();
	    }

		/**
		 * To search for rubrics in the database, respond to
		 * the key click in the rubric field
		 *
		 * @param event to retrieve input text
		 */
		_searchRubric(event) {
			if(event.target.text !== "" && event.target.text.length > 4){
				this.dispatchEvent(new CustomEvent('searchRubric', {detail: {rubricSuggestion: event.target.text}}));

//				var ceRubric = this;
//				this.domHost.getRubrics(event.target.text)
//					.then(function(response) {
//						ceRubric.suggestRubric(response.data);
//				}).catch(function(e) {
//					new Error("Error in searchRubric method: " + e);
//				});
			}
		}

		/**
		 * Available to open the dialog
		 */
		openDialog() {
	        this.$.dialog.open();
	    }

		/**
		 * To save rubric
		 */
		_saveRubric(rubric){
			this.dispatchEvent(new CustomEvent('saveRubric', {detail: rubric}));
		}

		/**
		 * Used to open the help dialog
		 *
		 * @param event to retrieve the description of the help and send it to the dialog
		 */
		_tapHelp(event) {
			this._transmitHelp(event.target.title);
		}

		/**
		 * 	Method that passes to the dialog the content of what must be inserted.
		 *
		 * @param the string of what should be inserted in the dialog
		 */
		_transmitHelp(content) {
			this.domHost.openHelp(content);
		}
	}

	window.customElements.define(CooperativeEditorRubric.is, CooperativeEditorRubric);