/**
 * Copyright 2018, Instituto Federal do Rio Grande do Sul (IFRS)
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
var editorApp = angular.module("EditorApp", ["WebSocketsApp"]);

/**
 * This directive is used to listen the events from ce-list component
 */
editorApp.directive("shortcutsDirective",["$document", function($document) {
	return {
		link : {
			post : function(scope, element, attr) {

	//########## Finish Support for Firefox and Safari #1 ##############//

//				var ceContainer = document.querySelector("ce-container");
//				var soundChat = ceContainer.shadowRoot.querySelector("sound-chat");
//				var ceParticipants = ceContainer.shadowRoot.querySelector("ce-participants");
//				var ceEditor = ceContainer.shadowRoot.querySelector("ce-editor");
//				var ceRubric = ceEditor.shadowRoot.querySelector("ce-rubric");
//
//				document.onkeyup = function(e) {
//					var key = e.which || e.keyCode;
//					if (e.shiftKey && e.altKey && key === 38)
//						ceParticipants.readComponentStatus();
//					else if (e.shiftKey && e.altKey && key === 40)
//						ceRubric.readComponentStatus();
//					else if (e.shiftKey && e.altKey && key === 37)
//					    soundChat.setFocus();
//					else if (e.shiftKey && e.altKey &&
//					        (key === 49 || key === 50 ||
//					         key === 51 || key === 52 ||
//					         key === 53 || key === 54 ||
//					         key === 55 || key === 56
//					         || key === 57)){
//
//					    switch(key) {
//					        case 49:
//					            key = 1;
//					            break;
//					        case 50:
//					            key = 2;
//					            break;
//					        case 51:
//                                key = 3;
//                                break;
//					        case 52:
//                                key = 4;
//                                break;
//					        case 53:
//                                key = 5;
//                                break;
//					        case 54:
//                                key = 6;
//                                break;
//					        case 55:
//                                key = 7;
//                                break;
//					        case 56:
//                                key = 8;
//                                break;
//					        case 57:
//                                key = 9;
//                                break;
//					        default:
//					            key = 0;
//					    }
//					    soundChat.readLatestMessages(key);
//
//					}
//
//				}

			}
		}
	};
} ]);