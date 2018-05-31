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

		static get properties() {
			return {
				url: {
			        type: String,
			        value: "/CooperativeEditor/webservice/form"
			      }
			}
		}

		constructor() {
			super();
			this.rubricId;
			this.objective = '';
			this.descriptors = [];
			this.onkeyup = function (e){ return e.keyCode === 27 ? this._closeDialog():'';};
		}

		connectedCallback() {
			super.connectedCallback();

			// This event is triggered when an item is selected in
			// "descriptionRubric"
			this.$.descriptionRubric.addEventListener("autocomplete-selected",(event) =>
				{ this._requestRubric(event.detail.value) });
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
				this._requestDeleteRubric(this.rubricId);
		   }
		   this._closeDialog();
	    }

		/**
		 * To trigger rubric saved event
		 */
		_rubricRemoved(rubric) {
			this.dispatchEvent(new CustomEvent('rubric-removed', {detail: rubric}));
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
			if((event.keyCode > 64 && event.keyCode < 91) && event.target.text !== ""){
				this._requestSearchRubric(event.target.text);
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
		_saveRubric(rubric) {
			this._requestSaveRubric(rubric);
		}

		/**
		 * To trigger rubric saved event
		 */
		_rubricSaved(rubric) {
			this.dispatchEvent(new CustomEvent('new-rubric', {detail: rubric}));
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

		/**
	     * Private method triggers the Rubric search request
	     *
	     */
		_requestSearchRubric(text) {
			this.$.ajaxRequest.url = this.url+"/rubricsuggestion/"+text;
			this.$.ajaxRequest.method = "GET";
			this.$.ajaxRequest.generateRequest().completes.then((req) => {this.suggestRubric(req.response)});
		}

		/**
	     * Private method triggers the Rubric request
	     *
	     */
		_requestRubric(id) {
			this.$.ajaxRequest.url = this.url+"/getrubric/"+id;
			this.$.ajaxRequest.method = "GET";
			this.$.ajaxRequest.generateRequest().completes.then((req) => {this.setRubric(req.response)});
		}

		/**
	     * Private method triggers the Rubric request
	     *
	     */
		_requestSaveRubric(rubric) {
			this.$.ajaxRequest.url = this.url+"/saveRubric";
			this.$.ajaxRequest.method = "POST";
			this.$.ajaxRequest.body = rubric;
			this.$.ajaxRequest.generateRequest().completes.then((req) => {this._rubricSaved(req.response)});
		}

		/**
	     * Private method triggers the Rubric delete request
	     *
	     */
		_requestDeleteRubric(id) {
			this.$.ajaxRequest.url = this.url+"/deleteRubric/"+id;
			this.$.ajaxRequest.method = "DELETE";
			this.$.ajaxRequest.generateRequest().completes.then((req) => {this._rubricRemoved(req.response)});
		}
	}

	window.customElements.define(CooperativeEditorRubric.is, CooperativeEditorRubric);