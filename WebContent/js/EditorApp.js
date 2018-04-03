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
var editorApp = angular.module("EditorApp", ["WebSocketsApp","LoginApp"]);

/**
 * This directive is used to listen the events from ce-list component
 */
editorApp.directive("shortcutsDirective",["$document", function($document) {
	return {
		link : {			
			post : function(scope, element, attr) {
				
				var ceContainer = document.querySelector("ce-container");
				var ceParticipants = ceContainer.shadowRoot.querySelector("ce-participants");
				var ceEditor = ceContainer.shadowRoot.querySelector("ce-editor");
				var ceRubric = ceEditor.shadowRoot.querySelector("ce-rubric");
				
				document.onkeyup = function(e) {
					var key = e.which || e.keyCode;
					if (e.shiftKey && key === 38)
						ceParticipants.readComponentStatus();
					else if (e.shiftKey && key === 40)
						ceRubric.readComponentStatus();
				}
				
			}
		}
	};
} ]);