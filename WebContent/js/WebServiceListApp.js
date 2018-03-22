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
var webServiceListApp = angular.module("WebServiceListApp",  ["ngResource"]);

/**
 * WebServiceList Wrapper for document
 */
webServiceListApp.service("webServiceListDocument", function($http) {
	var baseUrl = "/CooperativeEditor/webservice/list";
	
	return {			
		getProductionList: function() {
			return $http.get(baseUrl + "/productionList");
		}
	};
});

/**
 * This directive is used to listen the events from ce-list component
 */
webServiceListApp.directive("webServiceListDirective",["$document","webServiceListDocument",function($document, webServiceListDocument) {
	return {
		link : {			
			post : function(scope, element, attr) {
				
				var ceList;
				
				if(element[0].localName === "ce-list"){
					ceList = element[0];
				}else{
					ceList = element[0].shadowRoot.querySelector("ce-list");
				}
				
				ceList.addEventListener("getProductionList",function(e) {
					webServiceListDocument.getProductionList().then(function(response) {
						ceList.setProductionList(response.data);
					}).catch(function(response) {
						new Error("Error in getProductionList method:" + response);
					});
				});
			}
		}
	};
} ]);