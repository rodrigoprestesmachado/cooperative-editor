/**
 * @license
 * Copyright 2017, Instituto Federal do Rio Grande do Sul (IFRS)
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
	 * @param String:
	 *            The name of the connect user
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
	   if (this.$.inputMessage.value !== ""){
		   var msg = this.escapeCharacters(this.$.inputMessage.value);
		   if (typeof msg !== 'undefined'){ 
			   this.dispatchEvent(new CustomEvent('sendMessage', {detail: {message: msg}}));
    		   this.$.inputMessage.value = "";
		   }
	   }
   }
    
   /**
	 * Escape special characters to keep the json message in the right format
	 */
   escapeCharacters(message){
	   if (typeof message !== 'undefined'){
		   message = message.replace(/"/g,"\\\"");
    	   message = message.replace(/'/g,"\\\"");
	   }
	   return message;
   }
    
   /**
    * Handle the messages from the server
    */
   receiveMessage(strJson) {
	   try{
		   // Parses the JSON message from WS service
		   var json = JSON.parse(strJson);
		   if (json.type === 'ACK_CONNECT')
			   this._ackConnectHandler(json);
		   else if (json.type === 'ACK_SEND_MESSAGE')
			   this._ackSendMessageHandler(json);
		   else if (json.type === 'ACK_TYPING')
			   this._ackTypingHandler(json);
	   } 
	   catch(err) {
		   this.speechMessage.text = super.localize("error");
		   speechSynthesis.speak(this.speechMessage);
	   }
   }
   
   /**
    * Private method to handle the ACK_CONNECT message from server
    * 
    * @param The JSON message
    */
   _ackConnectHandler(json){
	   // Add stored messages
	   if ((json.messages !== "") && (this.messages.length === 0)){
		   for (var x in json.messages){
			   var message = json.messages[x];
			   this.push('messages', {"user": message.user, "message": message.textMessage, "time": message.time});
		   }
	   } 
   }
   
   /**
    * Private method to handle the ACK_SEND_MESSAGE message from server
    * 
    * @param The JSON message
    */
   _ackSendMessageHandler(json){
	   if (json.user !== this.inputName ){
  			this.speechMessage.text = json.user;
  			this.playTTS("sendMessage", this.speechMessage);
  		}

  		this.push('messages', {"user": json.user, "message": json.message, "time": json.time});
  		this.playSound("sendMessage", json.soundColor);
  		
  		this.isTyping = false;
   }
   
   /**
    * Private method to handle the ACK_TYPING message from server
    * 
    * @param The JSON message
    */
   _ackTypingHandler(json){
	   if (json.user !== this.inputName ) {
  			this.isTyping = true;
  			this.updateScroll();
			
  			if (this.countTypingMessages === 16){
  				this.playSound("typing", json.soundColor);
  				// this.playTTS("typing", this.speechMessage);
  			}
  			else if (this.countTypingMessages === 32)
  				this.playSound("typing", json.soundColor);
			
  			if (this.countTypingMessages === 50){
  				this.speechMessage.text = json.user;
  				this.playSound("typing", json.soundColor);
  				this.countTypingMessages--;
  			}
  			else{
  				this.countTypingMessages--;
  				if (this.countTypingMessages === -1)
  					this.countTypingMessages = 50;
  			}
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