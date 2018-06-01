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
class CooperativeEditorContainer extends CooperativeEditorContainerLocalization {
	
	static get is() {
		return 'ce-container'; 
	}
	
	static get properties() {
		
		return {
			page: {
				type: String,
				reflectToAttribute: true,
				observer: '_pageChanged',
			},
			rootPattern: String,
			routeData: Object,
			subroute: String,
		};
	}
	
	static get observers() {
		return [
			'_routePageChanged(routeData.page)',
		];
	}
	
	constructor() {
		super();
		this.onkeyup = function (e){ return e.keyCode === 27 ? this.$.dialog.close():'';};
        // Get root pattern for app-route, for more info about `rootPath` see:
        // https://www.polymer-project.org/2.0/docs/upgrade#urls-in-templates
        this.rootPattern = (new URL(this.rootPath)).pathname;
        this.addEventListener("openDialog",function(e) {
			this._openDialog(e.detail);
		});  
    }
	
	connectedCallback(){
		super.connectedCallback();
		this._initSound();
	}
	
	_helpOpen(){
		var content = 
			this.localize('shortcut') + "<br/>" +
			this.localize('shortcut2') + "<br/>" +
			this.localize('shortcut3') + "<br/>" +
			this.localize('shortcut5') + "<br/>" +
			this.localize('shortcut4');
		this._openDialog(content);
	}
	
	_openDialog(content){
		this.$.dialog.lastElementChild.innerHTML = content;
		this.$.dialog.open();
	}
	
	_arrowBack(){
		var url = window.location.href;
		var base = url.substr(0,url.lastIndexOf("editor"));
		window.location.href = base;
	}
	
	_routePageChanged(page) {
		// Polymer 2.0 will call with `undefined` on initialization.
		// Ignore until we are properly called with a string.
		if (page === undefined) {
			return;
		}
		
		// If no page was found in the route data, page will be an empty string.
		//Deault to 'editor' in that case.
		this.page = page || 'editor';
		
		// Close a non-persistent drawer when the page & route are changed.
		if (!this.$.drawer.persistent) {
			this.$.drawer.close();
		}
	}
	
	_pageChanged(page) {
		// Load page import on demand. Show 404 page if fails
		var resolvedPageUrl = this.resolveUrl('../ce-'+ page +'/ce-' + page + '.html');
		Polymer.importHref(
			resolvedPageUrl,
			null,
			this._showPage404.bind(this),
            true);
	}
	
	_showPage404() {
		this.page = 'error';
	}
	
	_initSound(){
		this._initSoundDefaultValues();
		this._initSoundTypes();
		this._initSoundColor();
		this._initWebSpeech();
		this._initWebAudio();
		this._loadEffects();
	}
   	
   	_initSoundDefaultValues(){
   		// The sound on by default
   		this.soundOn = true;
        // Auditory Icons and Earcons
   		this.auditoryOn = true;
        // Auditory Icons and Earcons effects
   		this.auditoryEffectOn = false;
        // Spatial sound configuration 
   		this.auditorySpatialOn = false;
        
        // TTS configurations
   		this.ttsOn = true;
   		this.ttsSpeed = 1.6;
   		this.ttsVolume = 1;
   	}
   	
   	_initSoundTypes(){
   		// Sounds Types
   		this.soundConnect = 'connect';
   		this.soundMessage = 'sendMessage';
   		this.soundTyping = 'typing';
   		this.endParticipation = 'endParticipation';
   		this.startParticipation = 'startParticipation';
   		this.nextContribution = 'nextContribution';
   		this.acceptedRubric = 'acceptedRubric';
   	}
   	
   	_initSoundColor(){
   		// Sound Colors
   		this.delay = '';
   		this.wahwah = '';
   		this.moog = '';
   	}
   	
   	_initWebSpeech(){
   		// Text-To-Speech (TTS) Configuration
   		this.speechMessage = new SpeechSynthesisUtterance();
   		this.speechMessage.lang = this.getAccent(this.language);
   	}
   	
   	_initWebAudio(){
   		
   		// Web Audio API
   		this.audioCtx = null;
   		this.bufferConnect = null;
   		this.bufferSendMessage = null;
   		this.bufferTyping = null;
   		this.bufferEndParticipation = null;
   		this.bufferStartParticipation = null;
   		this.bufferNextContribution = null;
   		
   		// Web Audio API
   		this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
   		
   		var pathname = window.location.pathname;
		var path = pathname.substr(1,pathname.indexOf("/",1));
		var host = window.location.hostname;
		
		// Sound Chat sounds
   		var soundChatSoundsURL = "http://"+host+":8080/"+path+"src/sound-chat/sounds/";
   		this._loadAudioBuffer("connect", this.audioCtx, soundChatSoundsURL + "slow-spring-board.mp3");
   		this._loadAudioBuffer("send", this.audioCtx, soundChatSoundsURL + "intuition.mp3");
   		this._loadAudioBuffer("typing", this.audioCtx, soundChatSoundsURL + "direct-quieter-version.mp3");
   		
   		// Editor sounds
   		var editorSoundsURL = "http://"+host+":8080/"+path+"src/ce-editor/sounds/";
   		this._loadAudioBuffer("endParticipation", this.audioCtx, editorSoundsURL + "youve-been-informed.mp3");
   		this._loadAudioBuffer("startParticipation", this.audioCtx, editorSoundsURL + "quite-impressed.mp3");
   		this._loadAudioBuffer("nextContribution", this.audioCtx, editorSoundsURL + "knuckle.mp3");
   		this._loadAudioBuffer("acceptedRubric", this.audioCtx, editorSoundsURL + "appointed.mp3");
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
		else if(soundType === "nextContribution")
			bufferSource.buffer = self.bufferNextContribution;
		else if(soundType === "acceptedRubric")
			bufferSource.buffer = self.bufferAcceptedRubric;
		
		return bufferSource;
    }
   	
   	_loadAudioBuffer(bufferType, audioCtx, url) {
   		
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
   		   		else if (bufferType === "nextContribution")
		   			self.bufferNextContribution = decodedData;
   		   		else if (bufferType === "acceptedRubric")
   		   			self.bufferAcceptedRubric = decodedData;
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
    	
    		if (this.auditoryOn){
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
            else if (intention === "nextContribution")
                this.playSoundWithEffect(this.nextContribution, effect, position);
            else if (intention === "acceptedRubric")
                this.playSoundWithEffect(this.acceptedRubric, effect, position);   
        }
    }
    
    /**
     * Play the sound with with a effect: NOCOLOR, DELAY, WAHWAH and MOOG 
     */ 
    playSoundWithEffect(soundType, effect, position) {    		
    		this.audioCtx.resume();

    		var bufferSource = this._createSourceBuffer(soundType);
    		var stereoPanner = this._createStereoPanner(position);
    		
    		if (this.auditoryEffectOn){
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
     * Creates the spatial schema of the sound
     */
    _createStereoPanner(position){
    		var stereoPanner = this.audioCtx.createStereoPanner();
		if (this.auditorySpatialOn){
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
   	playTTS(ttsObject){
   		var wasSpoken = false;
   	    if (this.ttsOn){
   	        // Adjust speed and volume
   	        ttsObject.rate = this.ttsSpeed;
   	        ttsObject.volume = this.ttsVolume;
   	        
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
	
	_browse(){
		this.dispatchEvent(new CustomEvent('browse'));
	}
	
}

window.customElements.define(CooperativeEditorContainer.is, CooperativeEditorContainer);