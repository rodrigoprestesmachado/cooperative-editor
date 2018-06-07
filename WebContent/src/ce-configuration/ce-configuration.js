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

	static get properties() {
		return {
			sendMessage: {
	            type: Object,
	            notify: true,
	            readOnly: true
	        }
		};
	}

	created(){
	    // General sound configurations
		this.soundOn = true;
		this.soundOff = false;

		// Auditory icons and Earcon
		this.auditoryOn = true;
		this.auditoryOff = false;
		// Auditory Effect
		this.auditoryEffectOn = false;
		this.auditoryEffectOff = true;
		// Auditory 3D
		this.auditorySpatialOn = false;
		this.auditorySpatialOff = true;

		// TTS configurations
		this.ttsOn = true;
        this.ttsOff = false;
        this.ttsSpeed=80;
        this.ttsVolume=100;
     }

	_soundSwitcher(){
		if (this.soundOn){
			this.soundOn = false;
			this.soundOff = true;

			this._turnAuditoryOff();
			this._turnAuditoryEffectOff();
	        this._turnAuditorySpatialOff();
	        this._turnTtsOff();

	        this.$.ttsSpeed.disabled = true;
	        this.$.ttsVolume.disabled = true;

	    }
		else{
			this.soundOn = true;
			this.soundOff = false;

			this._turnAuditoryOn();
	        this._turnAuditoryEffectOn();
	        this._turnAuditorySpatialOn();
	        this._turnTtsOn();

	        this.$.ttsSpeed.disabled = false;
	        this.$.ttsVolume.disabled = false;

	    }
		CooperativeEditorSound.soundOn = this.soundOn;
	}

	_auditorySwitcher(){
	    if (this.auditoryOn){
         	this.auditoryOn = false;
            this.auditoryOff = true;

            this._turnAuditoryEffectOff();
	        this._turnAuditorySpatialOff();
	    }
        else{
        	    this.auditoryOn = true;
            this.auditoryOff = false;

            this._turnAuditoryEffectOn();
            this._turnAuditorySpatialOn();
	     }
        CooperativeEditorSound.auditoryOn = this.auditoryOn;
	}

	_auditoryEffectSwitcher(){
		if (this.auditoryEffectOn){
			this.auditoryEffectOn = false;
	        this.auditoryEffectOff = true;
	    }
	    else {
	         this.auditoryEffectOn = true;
	         this.auditoryEffectOff = false;
	    }
		CooperativeEditorSound.auditoryEffectOn = this.auditoryEffectOn;
	}


	_auditorySpatialSwitcher(){
		if (this.auditorySpatialOn){
			this.auditorySpatialOn = false;
	        this.auditorySpatialOff = true;
	    }
	    else {
	         this.auditorySpatialOn = true;
	         this.auditorySpatialOff = false;
	    }
		CooperativeEditorSound.auditorySpatialOn = this.auditorySpatialOn;
	}

	_ttsSwitcher(){
        if (this.ttsOn){
            this.ttsOn = false;
            this.ttsOff = true;

            this.$.ttsSpeed.disabled = true;
	        this.$.ttsVolume.disabled = true;
        }
        else{
            this.ttsOn = true;
            this.ttsOff = false;

            this.$.ttsSpeed.disabled = false;
	        this.$.ttsVolume.disabled = false;

        }
        CooperativeEditorSound.ttsOn = this.ttsOn;
    }

	_changeTtsSpeed(){
	    this.ttsSpeed = this.$.ttsSpeed.value;
	    CooperativeEditorSound.ttsSpeed = (this.$.ttsSpeed.value * 2)/100;;
	}

	_changeTtsVolume(){
	    this.ttsVolume = this.$.ttsVolume.value;
	    CooperativeEditorSound.ttsVolume = (this.$.ttsVolume.value * 1)/100;
	}

	_browse(){
		 this._setSendMessage({type:'BROWSE'});
		//this.dispatchEvent(new CustomEvent('browse'));
	}

	_turnAuditoryOn(){
		this.auditoryOn = true;
        this.auditoryOff = false;
        this.$.auditoryButton.active = true;
        this.$.auditoryButton.disabled = false;
        CooperativeEditorSound.auditoryOn = true;
	}

	_turnAuditoryOff(){
		this.auditoryOn = false;
        this.auditoryOff = true;
        this.$.auditoryButton.active = false;
        this.$.auditoryButton.disabled = true;
        CooperativeEditorSound.auditoryOn = false;
	}

	_turnAuditoryEffectOn(){
		this.auditoryEffectOn = true;
        this.auditoryEffectOff = false;
        this.$.auditoryEffectButton.active = true;
        this.$.auditoryEffectButton.disabled = false;
        CooperativeEditorSound.auditoryEffectOn = true;
	}

	_turnAuditoryEffectOff(){
		this.auditoryEffectOn = false;
        this.auditoryEffectOff = true;
        this.$.auditoryEffectButton.active = false;
        this.$.auditoryEffectButton.disabled = true;
        CooperativeEditorSound.auditoryEffectOn = false;
	}

	_turnAuditorySpatialOn(){
		this.auditorySpatialOn = true;
        this.auditorySpatialOff = false;
        this.$.auditorySpatialButton.active = true;
        this.$.auditorySpatialButton.disabled = false;
        CooperativeEditorSound.auditorySpatialOn = true;
	}

	_turnAuditorySpatialOff(){
		this.auditorySpatialOn = false;
        this.auditorySpatialOff = true;
        this.$.auditorySpatialButton.active = false;
        this.$.auditorySpatialButton.disabled = true;
        CooperativeEditorSound.auditorySpatialOn = false;
	}

	 _turnTtsOn(){
		 this.ttsOn = true;
         this.ttsOff = false;
         this.$.ttsButton.active = true;
         this.$.ttsButton.disabled = false;
         CooperativeEditorSound.ttsOn = true;
	 }

	 _turnTtsOff(){
		 this.ttsOn = false;
         this.ttsOff = true;
         this.$.ttsButton.active = false;
         this.$.ttsButton.disabled = true;
         CooperativeEditorSound.ttsOn = false;
	 }

}
window.customElements.define(CooperativeEditorConfiguration.is, CooperativeEditorConfiguration);