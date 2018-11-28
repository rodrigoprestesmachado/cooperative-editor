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
			// Receive Message
			receiveMessage: {
				type: Object,
				observer: '_receiveMessage',
				notify: true
			},
			// Send message
			sendMessage: {
				type: Object,
				notify: true,
				readOnly: true
			},
			// General sound configurations
			soundOn:{
				type: Boolean,
	            notify: true,
	            reflectToAttribute: true
			},
			// Auditory icons and Earcon
			auditoryOn:{
				type: Boolean,
	            notify: true,
	            reflectToAttribute: true
			},
			// Auditory Effect
			auditoryEffectOn:{
				type: Boolean,
	            notify: true,
	            reflectToAttribute: true
			},
			// Auditory 3D
			auditorySpatialOn:{
				type: Boolean,
	            notify: true,
	            reflectToAttribute: true
			},
			// TTS configurations
			ttsOn:{
				type: Boolean,
	            notify: true,
	            reflectToAttribute: true
			},
			ttsSpeed:{
				type: Number,
	            notify: true,
	            reflectToAttribute: true
			},
			ttsVolume:{
				type: Number,
	            notify: true,
	            observer(n) { this.labelVolume = (n * 100)},
	            reflectToAttribute: true
			}
		};
	}
	
	connectedCallback(){
		super.connectedCallback();
		this.labelVolume = (this.ttsVolume * 100);
	}
	
	_soundSwitcher(){
		if (this.soundOn){
			this.soundOn = false;			
			this._turnAuditoryOff();
			this._turnAuditoryEffectOff();
	        this._turnAuditorySpatialOff();
	        this._turnTtsOff();	        
	        this.$.ttsSpeed.disabled = true;
	        this.$.ttsVolume.disabled = true;
	        
	    }
		else{
			this.soundOn = true;			
			this._turnAuditoryOn();
	        this._turnAuditoryEffectOn();
	        this._turnAuditorySpatialOn();
	        this._turnTtsOn();	        
	        this.$.ttsSpeed.disabled = false;
	        this.$.ttsVolume.disabled = false;
	        
	    }
	}
	
	_auditorySwitcher(){
	    if (this.auditoryOn){
         	this.auditoryOn = false;            
            this._turnAuditoryEffectOff();
	        this._turnAuditorySpatialOff();
	    }
        else{
        	this.auditoryOn = true;            
            this._turnAuditoryEffectOn();
            this._turnAuditorySpatialOn();
	     }
	}
	
	_auditoryEffectSwitcher(){
		if (this.auditoryEffectOn){
			this.auditoryEffectOn = false;
	    }
	    else {
	         this.auditoryEffectOn = true;
	    }
	}
	
	
	_auditorySpatialSwitcher(){
		if (this.auditorySpatialOn){
			this.auditorySpatialOn = false;
	    }
	    else {
	         this.auditorySpatialOn = true;
	    }
	}
	
	_ttsSwitcher(){
        if (this.ttsOn){
            this.ttsOn = false;            
            this.$.ttsSpeed.disabled = true;
	        this.$.ttsVolume.disabled = true;
        }
        else{
            this.ttsOn = true;            
            this.$.ttsSpeed.disabled = false;
	        this.$.ttsVolume.disabled = false;
            
        }
    }
	
	_turnAuditoryOn(){
		this.auditoryOn = true;
        this.$.auditoryButton.active = true;
        this.$.auditoryButton.disabled = false;
	}
	
	_turnAuditoryOff(){
		this.auditoryOn = false;
        this.$.auditoryButton.active = false;
        this.$.auditoryButton.disabled = true;
	}
	
	_turnAuditoryEffectOn(){
		this.auditoryEffectOn = true;
        this.$.auditoryEffectButton.active = true;
        this.$.auditoryEffectButton.disabled = false;
	}
	
	_turnAuditoryEffectOff(){
		this.auditoryEffectOn = false;
        this.$.auditoryEffectButton.active = false;
        this.$.auditoryEffectButton.disabled = true;
	}
	
	_turnAuditorySpatialOn(){
		this.auditorySpatialOn = true;
        this.$.auditorySpatialButton.active = true;
        this.$.auditorySpatialButton.disabled = false;
	}
	
	_turnAuditorySpatialOff(){
		this.auditorySpatialOn = false;
        this.$.auditorySpatialButton.active = false;
        this.$.auditorySpatialButton.disabled = true;
	}
	
	 _turnTtsOn(){
		 this.ttsOn = true;
         this.$.ttsButton.active = true;
         this.$.ttsButton.disabled = false;
	 }
	 
	 _turnTtsOff(){
		 this.ttsOn = false;
         this.$.ttsButton.active = false;
         this.$.ttsButton.disabled = true;
	 }
	 
	 _browse(){
		 this._setSendMessage({type:'BROWSE'});
	 }
	
}
window.customElements.define(CooperativeEditorConfiguration.is, CooperativeEditorConfiguration);