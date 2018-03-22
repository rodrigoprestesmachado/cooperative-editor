/**
 * Copyright 2018, Rodrigo Prestes Machado and Lauro Correa Junior
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
var webSocketsApp = angular.module('WebSocketsApp', []);

/**
 * Web Socket Wrapper for document
 */
webSocketsApp.service('webSocketDocument', function() {
    var ws;
	this.open = function(url) {
		if (window.MozWebSocket)
			ws = new MozWebSocket(url);
		else
			ws = new WebSocket(url);
    };
    
    this.registerOnMessage = function(onMessageCallBack){
    	ws.onmessage = onMessageCallBack;
    };
    
    this.send = function(strJson) {
		ws.send(strJson);
    };
    
});

/**
 * This directive is used to listen the events from sound-chat and ce-participants components
 */
webSocketsApp.directive('webSocketsDirective', ['$document','webSocketDocument', function($document, webSocketDocument) {
  return {
	  link:{
		  post: function(scope, element, attr) {
			  
			  var ceContainer = document.querySelector("ce-container");
			  var soundChat = ceContainer.shadowRoot.querySelector("sound-chat");
			  var ceParticipants = ceContainer.shadowRoot.querySelector("ce-participants");
			  var ceEditor = ceContainer.shadowRoot.querySelector("ce-editor");
			  
			  var ceRubric = ceEditor.shadowRoot.querySelector("ce-rubric");
			  
			  // Calls Web Socket Wrapper
			  var pathname = window.location.pathname;
			  var hash = pathname.substr(pathname.lastIndexOf("/"));
			  webSocketDocument.open("ws://localhost:8080/CooperativeEditor/editorws"+hash);
			  
			  // Register onmessage function
			  webSocketDocument.registerOnMessage(function(event) {
				  soundChat.receiveMessage(event.data);
				  ceParticipants.receiveMessage(event.data);
				  ceEditor.receiveMessage(event.data);
				  ceRubric.receiveMessage(event.data);
			  });
			  
			  // Sending a message to others
			  soundChat.addEventListener("sendMessage", function(e) {
				  webSocketDocument.send("{'type':'SEND_MESSAGE','textMessage':'"+e.detail.message+"'}");
			  });
			  soundChat.addEventListener("typing", function(e) {
				  webSocketDocument.send("{'type':'TYPING'}");
			  });
			  soundChat.addEventListener("setSoundColor", function(e) {
				  webSocketDocument.send("{'type':'SET_SOUND_COLOR','textMessage':'"+e.detail.message+"'}");
			  });
			  
			  ceRubric.addEventListener("finishRubric", function(e) {				  
				  webSocketDocument.send("{'type':'FINISH_RUBRIC','rubricProductionConfiguration':{'id':'"+e.detail.idRPC+"'}}");
			  });
		  }   
	  } 
  };
}]);