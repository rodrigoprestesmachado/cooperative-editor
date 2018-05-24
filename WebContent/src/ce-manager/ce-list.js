/**
 * @license Copyright 2018, Instituto Federal do Rio Grande do Sul (IFRS)
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */
class CooperativeEditorList extends CooperativeEditorListLocalization {

	static get is() {
		return 'ce-list';
	}

	constructor() {
		super();
		this.arrProduction = [];
	}

	connectedCallback() {
		super.connectedCallback();
		/**
		 * Event to start the list, looking for who logged in
		 */
		//this.addEventListener("start-list",function(e) {
   			var ceList = this;
   			this.domHost.getProductionList().then(function(response) {
				ceList.setProductionList(response.data);
			}).catch(function(response) {
				new Error("Error in getProductionList method:" + response);
			});


   			// this.dispatchEvent(new CustomEvent('getProductionList'));
   		//});
	}

	/**
	 * Private method to verify that it is a valid text and returns it of a
	 * valid size
	 *
	 * @param txt
	 */
	_formatText(txt){
		var sizetxt = 50;
		if(txt == "null" || txt === "")
			txt = this.localize('defaultTxt');
		else
        if(txt.length > sizetxt)
            txt = txt.substring(0, txt.indexOf(" ", sizetxt)) + "...";

        return txt;
	}

	/**
	 * Public method to set production object list
	 *
	 * @param production
	 *            object list
	 */
	setProductionList(productionList){
		this.arrProduction = productionList;
	}

	/**
	 * Private method to set production object
	 *
	 * @param event
	 */
	_setProduction(event){
		if(event.model.item.url == "")
			this.dispatchEvent(new CustomEvent('setProductionInForm', {detail: event.model.item}));
	}
}

	/**
	 * To trigger the event that ce-list initialization
	 */
	window.onload = function(){
		console.log('windon');
		var ceList;
		if(null == document.querySelector("ce-list")){
			ceList = document.querySelector("ce-manager").shadowRoot.querySelector("ce-list");
		}else{
			ceList = document.querySelector("ce-list");
		}
		ceList.dispatchEvent(new CustomEvent('start-list'));
	};
window.customElements.define(CooperativeEditorList.is, CooperativeEditorList);
