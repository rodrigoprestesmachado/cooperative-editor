/**
 * Copyright 2017, Rodrigo Prestes Machado
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 		http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * 
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class SoundChat extends CooperativeEditorSound {
	
	static get is() {
		return 'sound-chat'; 
	}
	
	constructor() {
   		super();
		
   		this.is = 'sound-chat';
   		this.messages = '';
   	}
		
   	ready(){
   		super.ready();
   		
   		this.inputName = null;
   		this.messages = [];
   		this.isTyping = false;
		
   		// Labels from configuration interface. Note: it came from the original
   		// Sound Chat
   		this.labelSystemStatus = "on";
   		this.labelConnectStatus = "on";
   		this.labelMessageStatus = "on";
   		this.labelTypingStatus = "on";
   		
   	}
   	
   	/**
   	 * This method allows to add an input Name (from the old login windows) in 
   	 * the Sound Chat
   	 * 
   	 * @param String: The name of the connect user
   	 */
   	_setInputName(name){
   		// It cThe login variable can be set to true
   		this.inputName = name;
   	}
   	
   	
	/**
    * Sends the message typing to the server. With this message the server can 
    * broadcast a message to to inform that someone is typing
    */
   typingEvent(event){
	   if (event.keyCode === 13){
		   this.sendMessageAction();
		   this.$.inputMessage.value = "";
   		}
   		else{
   			this.dispatchEvent(new CustomEvent('typing'));
   		}
   }
       
   /**
    * Enable login with the user press enter/return button in login name field
    */
   enterEvent(event){
	   if (event.keyCode === 13){
		   this.$.windowLogin.opened = false;
   		}
   }
    
   /**
    * Method used to send a message to other users
 	*/
   sendMessageAction() {
	   if (this.$.inputMessage.value != ""){
		   var msg = this.escapeCharacters(this.$.inputMessage.value);
		   if (typeof msg != 'undefined'){
			   if (msg.indexOf("SET_SOUND_COLOR") !== -1)
    			   this.dispatchEvent(new CustomEvent('setSoundColor', {detail: {message: msg.substr(msg.length - 1)}}));
    		   else
    			   this.dispatchEvent(new CustomEvent('sendMessage', {detail: {message: msg}}));
    		   this.$.inputMessage.value = "";
		   }
	   }
   }
    
   /**
    * Escape special characters to keep the json message in the right format  
    */
   escapeCharacters(message){
	   if (typeof message != 'undefined'){
		   message = message.replace(/"/g,"\\\"");
    	   message = message.replace(/'/g,"\\\"");
	   }
	   return message;
   }
    
   /**
    * Executes the messages from the server
    */
   receiveMessage(strJson) {
   	try{
   		// Parses the JSON message from WS service
       	var data = JSON.parse(strJson);
    	
       	if (data.type === 'ACK_CONNECT'){
       		
       		// Add stored messages
       		if ((data.messages != "") && (this.messages.length == 0)){
       			for (var x in data.messages){
   					var message = data.messages[x];
   					this.push('messages', {"user": message.user, "message": message.textMessage, "time": message.time});
   				}
   	    	}
    		
       	}
       	else if (data.type === 'ACK_SEND_MESSAGE'){
       		
    		if (data.user != this.inputName ){
       			this.speechMessage.text = data.user;
       			this.playTTS("sendMessage", this.speechMessage);
       		}

       		this.push('messages', {"user": data.user, "message": data.message, "time": data.time});
       		this.playSound("sendMessage", data.soundColor);
       		
       		this.isTyping = false;
       	}
       	else if (data.type === 'ACK_TYPING'){
       		if (data.user != this.inputName ) {
       			this.isTyping = true;
       			this.updateScroll();
    			
       			if (this.countTypingMessages == 16){
       				this.playSound("typing", data.soundColor);
       				//this.playTTS("typing", this.speechMessage);
       			}
       			else if (this.countTypingMessages == 32)
       				this.playSound("typing", data.soundColor);
    			
       			if (this.countTypingMessages == 50){
       				this.speechMessage.text = data.user;
       				this.playSound("typing", data.soundColor);
       				this.countTypingMessages--;
       			}
       			else{
       				this.countTypingMessages--;
       				if (this.countTypingMessages == -1){
       					this.countTypingMessages = 50;
       				}
       			}
       		}
       	}
   	}
   	catch(err) {
   		this.speechMessage.text = super.localize("error");
   		speechSynthesis.speak(this.speechMessage);
   		//this.$.ackToast.open();
   	}
   }
    
   /**
     * This method updates the position of a new message on the page (scroll)
    */
   	updateScroll(){
   		if (this.$.content.scrollHeight > this.$.content.offsetHeight){
   			this.$.content.scrollTop = this.$.content.scrollHeight - this.$.content.offsetHeight;
    	}
   	}	
}

window.customElements.define(SoundChat.is, SoundChat);