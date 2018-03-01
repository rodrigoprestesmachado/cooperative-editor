/**
 * @license
 * Copyright 2018, Rodrigo Prestes Machado and Lauro Correa Junior
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
   		
   		// Sounds Types
   		this.soundConnect = 'connect';
   		this.soundMessage = 'sendMessage';
   		this.soundTyping = 'typing';
		
   		// Web Audio API
   		this.audioCtx = null;
   		this.bufferConnect = null;
   		this.bufferSendMessage = null;
   		this.bufferTyping = null;
		
   		// Sound Colors
   		this.delay = '';
   		this.wahwah = '';
   		this.moog = '';
   		
   		// Text-To-Speech (TTS) Configuration
   		this.speechMessage = new SpeechSynthesisUtterance();
   		this.speechMessage.rate = 1.5;
   		this.speechMessage.volume = 1.1;
		
   		this.countTypingMessages = 50;
   	}
	
	connectedCallback() {		      
		super.connectedCallback();
		const production = this;
	}
	
   	ready(){
   		super.ready();
   		
   		// Web Audio API Load
   		this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
   		
   		var pathname = window.location.pathname;
		var path = pathname.substr(1,pathname.indexOf("/",1));
		var host = window.location.hostname;
		
   		var audioDataBaseURL = "http://"+host+":8080/"+path+"src/sound-chat/sounds/";
   		this.loadAudioBuffer("connect", this.audioCtx, audioDataBaseURL + "connect.mp3");
   		this.loadAudioBuffer("send", this.audioCtx, audioDataBaseURL + "send4.mp3");
   		this.loadAudioBuffer("typing", this.audioCtx, audioDataBaseURL + "typing.mp3");
   		
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
   		   		else (bufferType === "typing")
					self.bufferTyping = decodedData;
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
    playSound(intention, color){
	   if (this.canPlay(intention)){
		   if (intention === "connect")
			   this.playColorfulSound(this.soundConnect, color);
		   else if (intention === "sendMessage")
			   this.playColorfulSound(this.soundMessage, color);
		   else if (intention === "typing") 
			   this.playColorfulSound(this.soundTyping, color);
	   }
    }
     
    playColorfulSound(soundType, soundColor) {
 	   
 	   // Selects the right buffer
    		var bufferSource = this.audioCtx.createBufferSource();
    		if (soundType === "connect")
    			bufferSource.buffer = self.bufferConnect;
    		else if (soundType === "sendMessage")
    			bufferSource.buffer = self.bufferSendMessage;
    		else if(soundType === "typing")
    			bufferSource.buffer = self.bufferTyping;
 	
    		//Sound Graph
    		if (soundColor === "NOCOLOR"){
    			bufferSource.connect(this.audioCtx.destination);
    		}
    		else if (soundColor === "DELAY"){
    			bufferSource.connect(this.delay);
    			this.delay.connect(this.audioCtx.destination);
    		}
    		else if (soundColor === "WAHWAH"){
    			bufferSource.connect(this.wahwah);
    			this.wahwah.connect(this.audioCtx.destination);
    		}
    		else if (soundColor === "MOOG"){
    			var gain = this.audioCtx.createGain();
    			//gain.gain.value = 6;
    			bufferSource.connect(gain);
    			gain.connect(this.moog);
    			this.moog.connect(this.audioCtx.destination);
    		}
    		else
    			bufferSource.connect(this.audioCtx.destination);
 	
    		//Plays the sound
    		bufferSource.start();
 	}
    
   	/**
   	 * Method used to execute text to speech  
   	 **/
   	playTTS(intention, messageObject){
   		if (this.canPlay(intention))
			speechSynthesis.speak(messageObject);
    }
   	
   	/**
	 * Verify if the sound can be played
	 */
	canPlay (intention){
		// TODO Remove code
		if ((intention === "connect")) //&& (this.$.connectConfig.checked === true))
			return true;
		else if ((intention === "sendMessage")) //&& (this.$.messageConfig.checked === true))
			return true;
		else if ((intention === "typing")) //&& (this.$.typingConfig.checked === true))
			return true;
		else
			return false;
	}
	
}
window.customElements.define(CooperativeEditorSound.is, CooperativeEditorSound);