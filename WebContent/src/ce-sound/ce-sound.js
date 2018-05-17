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
class CooperativeEditorSound extends CooperativeEditorSoundLocalization {
	
    static get is() {
    		return 'ce-sound'; 
	}
	
	constructor() {
   		super();
   		this.is = 'ce-sound';
   		
   		//  the sound on by default
        CooperativeEditorSound.soundOn = true;
        // Auditory Icons and Earcons
        CooperativeEditorSound.auditoryOn = true;
        // Auditory Icons and Earcons effects
        CooperativeEditorSound.auditoryEffectOn = false;
        // Spatial sound configuration 
        CooperativeEditorSound.auditorySpatialOn = false;
        
        // TTS configurations
        CooperativeEditorSound.ttsOn = true;
        CooperativeEditorSound.ttsSpeed = 1.6;
        CooperativeEditorSound.ttsVolume = 1;
        
        // Sounds Types
   		this.soundConnect = 'connect';
   		this.soundMessage = 'sendMessage';
   		this.soundTyping = 'typing';
   		this.endParticipation = 'endParticipation';
   		this.startParticipation = 'startParticipation';
   		
		// Web Audio API
   		this.audioCtx = null;
   		this.bufferConnect = null;
   		this.bufferSendMessage = null;
   		this.bufferTyping = null;
   		this.bufferEndParticipation = null;
   		this.bufferStartParticipation = null;
		
   		// Sound Colors
   		this.delay = '';
   		this.wahwah = '';
   		this.moog = '';
   		
   		// Text-To-Speech (TTS) Configuration
   		this.speechMessage = new SpeechSynthesisUtterance();
   		this.speechMessage.lang = this.getAccent(this.language);
   	}
	
	connectedCallback() {		      
		super.connectedCallback();
		const production = this;
	}
	
   	ready(){
   		super.ready();
   		
   		// Web Audio API
   		this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
   		
   		var pathname = window.location.pathname;
		var path = pathname.substr(1,pathname.indexOf("/",1));
		var host = window.location.hostname;
		
		// Sound Chat sounds
   		var soundChatSoundsURL = "http://"+host+":8080/"+path+"src/sound-chat/sounds/";
   		this.loadAudioBuffer("connect", this.audioCtx, soundChatSoundsURL + "connect.mp3");
   		this.loadAudioBuffer("send", this.audioCtx, soundChatSoundsURL + "send4.mp3");
   		this.loadAudioBuffer("typing", this.audioCtx, soundChatSoundsURL + "typing.mp3");
   		// Editor sounds
   		var editorSoundsURL = "http://"+host+":8080/"+path+"src/ce-editor/sounds/";
   		this.loadAudioBuffer("endParticipation", this.audioCtx, editorSoundsURL + "endParticipation.mp3");
   		this.loadAudioBuffer("startParticipation", this.audioCtx, editorSoundsURL + "startParticipation.mp3");
   		
   		this._loadEffects();	
   	}
   	
   	/**
   	 * Method used load all effects
   	 */
   	_loadEffects(){
   		// Sound Effects
   		var tuna = new Tuna(this.audioCtx);
   		this.delay = new tuna.Delay({
   		    feedback: 0.6,    //0 to 1+
   		    delayTime: 100,   //1 to 10000 milliseconds
   		    wetLevel: 0.8,    //0 to 1+
   		    dryLevel: 1,      //0 to 1+
   		    cutoff: 2000,     //cutoff frequency of the built in lowpass-filter. 20 to 22050
   		    bypass: 0
   		});
		
   		this.wahwah = new tuna.WahWah({
   		    automode: true,                //true/false
   		    baseFrequency: 0.5,            //0 to 1
   		    excursionOctaves: 2,           //1 to 6
   		    sweep: 0.2,                    //0 to 1
   		    resonance: 10,                 //1 to 100
   		    sensitivity: 0.8,              //-1 to 1
   		    bypass: 0
   		});
		
   		this.moog = new tuna.MoogFilter({
   		    cutoff: 0.4,    //0 to 1
   		    resonance: 3,   //0 to 4
   		    bufferSize: 4096  //256 to 16384
   		});
   	}
   	
   	loadAudioBuffer(bufferType, audioCtx, url) {
   		var request = new XMLHttpRequest(); 
   		request.open("GET", url, true); 
   		request.responseType = 'arraybuffer';
		
   		request.onload = function() {
   			var audioData = request.response;
   			audioCtx.decodeAudioData(audioData).then(function(decodedData) {
   				if (bufferType === "connect")
   					self.bufferConnect = decodedData;
   				else if (bufferType === "send")
   					self.bufferSendMessage = decodedData;
   		   		else if (bufferType === "typing")
					self.bufferTyping = decodedData;
   		   		else if (bufferType === "endParticipation")
   		   			self.bufferEndParticipation = decodedData;
   		   		else if (bufferType === "startParticipation")
   		   			self.bufferStartParticipation = decodedData;
   			},
   			function(e){ 
   				console.log("Decode audio data error:" + e.err); 
   			});
   		}
   		request.send();
   	}
   	
   	/**
     * Method used to play a sound depending on the sound control options set by
     * users.
     *  
     * @param String audio : The audio that the system wants to play. It's related
     *    with the audios loaded on the system
     * @param String intention : Verify the action (intention) the system wants
     *    to play    
     */
    playSound(intention, effect, position){       
        if (CooperativeEditorSound.auditoryOn){
            if (intention === "connect")
                this.playSoundWithEffect(this.soundConnect, effect, position);
            else if (intention === "sendMessage")
                this.playSoundWithEffect(this.soundMessage, effect, position);
            else if (intention === "typing") 
                this.playSoundWithEffect(this.soundTyping, effect, position);
            else if (intention === "endParticipation") 
                this.playSoundWithEffect(this.endParticipation, effect, position);
            else if (intention === "startParticipation") 
                this.playSoundWithEffect(this.startParticipation, effect, position);
        }
    }
    
    /**
     * Play the sound with with a effect: NOCOLOR, DELAY, WAHWAH and MOOG 
     */ 
    playSoundWithEffect(soundType, effect, position) {    		
    		this.audioCtx.resume();

    		var bufferSource = this._createSourceBuffer(soundType);
    		var stereoPanner = this._createStereoPanner(position);
    		
    		if (CooperativeEditorSound.auditoryEffectOn){
    			//Sound Graph
    			if (effect === "NOCOLOR"){
    				bufferSource.connect(stereoPanner);
    				stereoPanner.connect(this.audioCtx.destination);
    			}
    			else if (effect === "DELAY"){
    				bufferSource.connect(stereoPanner);
    				stereoPanner.connect(this.delay);
    				this.delay.connect(this.audioCtx.destination);
    			}
    			else if (effect === "WAHWAH"){
    				bufferSource.connect(stereoPanner);
    				stereoPanner.connect(this.wahwah);
    				this.wahwah.connect(this.audioCtx.destination);
    			}
    			else if (effect === "MOOG"){
    				var gain = this.audioCtx.createGain();
    				gain.gain.value = 6;
    				
    				bufferSource.connect(stereoPanner);
    				stereoPanner.connect(gain);
    				gain.connect(this.moog);
    				this.moog.connect(this.audioCtx.destination);
    			}
    			else
    				bufferSource.connect(stereoPanner);
    				stereoPanner.connect(this.audioCtx.destination);
    		}
    		else{
    			bufferSource.connect(stereoPanner);
    			stereoPanner.connect(this.audioCtx.destination);
    		}
    			
    		//Plays the sound
    		bufferSource.start();
 	}
    
    /**
     * Creates the source buffer
     */
    _createSourceBuffer(soundType){
    	 	// Selects the right buffer
		var bufferSource = this.audioCtx.createBufferSource();
		if (soundType === "connect")
			bufferSource.buffer = self.bufferConnect;
		else if (soundType === "sendMessage")
			bufferSource.buffer = self.bufferSendMessage;
		else if(soundType === "typing")
			bufferSource.buffer = self.bufferTyping;
		else if(soundType === "endParticipation")
			bufferSource.buffer = self.bufferEndParticipation;
		else if(soundType === "startParticipation")
			bufferSource.buffer = self.bufferStartParticipation;
		return bufferSource;
    }
    
    /**
     * Creates the spatial schema of the sound
     */
    _createStereoPanner(position){
    		var stereoPanner = this.audioCtx.createStereoPanner();
		if (CooperativeEditorSound.auditorySpatialOn){
			var positionValue = (position === "LEFT") ? 1 : -1;
    		stereoPanner.pan.setTargetAtTime(positionValue, this.audioCtx.currentTime, 0);
		}
		else
			stereoPanner.pan.setTargetAtTime(0, this.audioCtx.currentTime, 0);
    		return stereoPanner;
    }
    
   	/**
   	 * Method used to execute text-to-speech  
   	 **/
   	playTTS(intention, ttsObject){
   	    var wasSpoken = false;
   	    if (CooperativeEditorSound.ttsOn){
   	        // Adjust speed and volume
   	        ttsObject.rate = CooperativeEditorSound.ttsSpeed;
   	        ttsObject.volume = CooperativeEditorSound.ttsVolume;
   	        
            speechSynthesis.speak(ttsObject);
            wasSpoken = true;
   	    }
   	 	return wasSpoken;	
    }
   	
   	/**
	 * Get the default accent to TTS
	 */
	getAccent(language){
		var accent;
		if (language === 'pt')
			accent = 'pt-BR';
   		else if  (language === 'en')
   			accent = 'en-US';
		else
			accent = language;
		return accent;
	}
	
}
window.customElements.define(CooperativeEditorSound.is, CooperativeEditorSound);