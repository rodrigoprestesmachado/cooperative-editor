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
			this.dispatchEvent(new CustomEvent('production-selected', {detail: event.model.item}));
	}
}

window.customElements.define(CooperativeEditorList.is, CooperativeEditorList);
