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
class CooperativeEditorConfiguration extends CooperativeEditorConfigurationLocalization {
	
	static get is() { 
		return 'ce-configuration';
	}
	
	created(){
		this.soundTurnOn = true;
		this.soundTurnOff = false;
		this.ttsSpeed=50;
		this.ttsVolume=50;
	}

	_soundSwitcher(){
		if (this.soundTurnOn){
			this.soundTurnOn = false;
			this.soundTurnOff = true;
		}
		else{
			this.soundTurnOn = true;
			this.soundTurnOff = false;
		}
		CooperativeEditorSound.soundTurnOn = this.soundTurnOn;
	}
	
	_changeTtsSpeed(){
	    this.ttsSpeed = (this.$.ttsSpeed.value * 100)/200
	    CooperativeEditorSound.ttsSpeed = this.$.ttsSpeed.value/100;
	}
	
	_changeTtsVolume(){
	    this.ttsVolume = (this.$.ttsVolume.value * 100)/200
	    CooperativeEditorSound.ttsVolume = this.$.ttsVolume.value/100;
	}
	
	_browse(){
		this.dispatchEvent(new CustomEvent('browse'));
	}
	
}
window.customElements.define(CooperativeEditorConfiguration.is, CooperativeEditorConfiguration);