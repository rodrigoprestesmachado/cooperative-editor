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
var webServiceFormApp = angular.module("WebServiceFormApp",  ["ngResource"]);

/**
 * WebServiceForm Wrapper for document
 */
webServiceFormApp.service("webServiceFormDocument", function($http) {
	var baseUrl = "/CooperativeEditor/webservice/form";

	return {
		// used to suggest Person
		// Parameters are the first characters of the name Person
		getPerson: function(text) {
			return $http.get(baseUrl + "/peoplesuggestion/" + text);
		},

		// used to suggest Rubric
		// Parameters are the first characters of the objective rubric
		getRubrics: function(text) {
			return $http.get(baseUrl + "/rubricsuggestion/" + text);
		},

		// used to return Rubric
		// Parameters are the id of the objective rubric
		getRubric: function(rubritId) {
			return $http.get(baseUrl + "/getrubric/" + rubritId);
		},

		getProduction: function(productionId) {
			return $http.get(baseUrl + "/getproduction/" + productionId);
		},

		disconnectRubric: function(rubricProductionConfigurationId) {
			return $http.delete(baseUrl + "/disconnectRubric/" + rubricProductionConfigurationId);
		},

		updateRubric: function(rubrit){
			$http.defaults.headers.post["Content-Type"] = "application/json";
			return $http.post( baseUrl + "/updateRubric/", rubrit);
		},

		deleteRubric: function(rubrictId) {
			return $http.delete(baseUrl + "/deleteRubric/" + rubrictId);
		},

		updateRubricProductionConfiguration: function(rubricProductionConfiguration){
			$http.defaults.headers.post["Content-Type"] = "application/json";
			return $http.post( baseUrl + "/rubricProductionConfiguration/", rubricProductionConfiguration);
		},

		disconnectUserProductionConfiguration: function(userProductionConfigurationId){
			return $http.delete(baseUrl + "/disconnectUserProductionConfiguration/"+userProductionConfigurationId);
		},

		updateUserProductionConfiguration: function(userProductionConfiguration){
			$http.defaults.headers.post["Content-Type"] = "application/json";
			return $http.post(baseUrl + "/userProductionConfiguration/", userProductionConfiguration);
		},

		partialSubmit: function(text){
			$http.defaults.headers.post["Content-Type"] = "application/json";
			return $http.post(baseUrl + "/partialSubmit", text);
		},
		saveRubric: function(text){
			$http.defaults.headers.post["Content-Type"] = "application/json";
			return $http.post(baseUrl + "/saveRubric", text);
		},
		saveProduction: function(text){
			$http.defaults.headers.post["Content-Type"] = "application/json";
			return $http.post(baseUrl + "/saveProduction", text);
		}
	}

});


/**
 * This directive is used to listen the events from ce-form component
 */
webServiceFormApp.directive("webServiceFormDirective",["$document","webServiceFormDocument",function($document, webServiceFormDocument) {
	return {
		link : {
			post : function(scope, element, attr) {

				element[0].webService = webServiceFormDocument;

				//var ceForm = element[0].$.ceForm;
				//var ceRubric = element[0].$.ceRubric;

//				ceForm.addEventListener("searchPeople",function(e) {
//					webServiceFormDocument.getPerson(e.detail.emailSuggestion).then(function(response) {
//						ceForm.suggestPeople(response.data);
//					}).catch(function(e) {
//						new Error("Error in searchPeople method: " + e);
//					});
//				});

//				ceForm.addEventListener("getProduction",function(e) {
//					webServiceFormDocument.getProduction(e.detail).then(function(response) {
//						ceForm.setProduction(response.data);
//					}).catch(function(e) {
//						new Error("Error in getProduction method: " + e);
//					});
//				});

//				ceRubric.addEventListener("searchRubric",function(e) {
//					webServiceFormDocument.getRubrics(e.detail.rubricSuggestion).then(function(response) {
//						ceRubric.suggestRubric(response.data);
//					}).catch(function(e) {
//						new Error("Error in searchRubric method: " + e);
//					});
//				});

				// Receives different types of information pertaining to
				// production, and updates or creates a new production
//				ceForm.addEventListener("partialSubmit",function(e) {
//					webServiceFormDocument.partialSubmit(e.detail).then(function(response) {
//						ceForm.setProduction(response.data);
//					}).catch(function(e) {
//						new Error("Error in partialSubmit method: " + e);
//					});
//				});

//				ceForm.addEventListener("disconnectUserProductionConfiguration",function(e) {
//					webServiceFormDocument.disconnectUserProductionConfiguration(e.detail).then(function(response) {
//					}).catch(function(e) {
//						new Error("Error in disconnectUserProductionConfiguration method: " + e);
//					});
//				});

				// dissociates the production line
//				ceForm.addEventListener("disconnectRubric",function(e) {
//					webServiceFormDocument.disconnectRubric(e.detail.configurationId).then(function(response) {
//						ceForm.rubricRemoved(response.data);
//					}).catch(function(e) {
//						new Error("Error in disconnectRubric method: " + e);
//					});
//				});

//				ceForm.addEventListener("rubricProductionConfiguration",function(e) {
//					webServiceFormDocument.updateRubricProductionConfiguration(e.detail.rPC).then(function(response) {
//						ceForm.setRubricProductionConfiguration(response.data);
//					}).catch(function(e) {
//						new Error("Error in rubricProductionConfiguration method: " + e);
//					});
//				});

//				ceForm.addEventListener("userProductionConfiguration",function(e) {
//					webServiceFormDocument.updateUserProductionConfiguration(e.detail.uPC).then(function(response) {
//						ceForm.setUserProductionConfiguration(response.data);
//					}).catch(function(e) {
//						new Error("Error in userProductionConfiguration method: " + e);
//					});
//				});

				// delete Rubric
//				ceRubric.addEventListener("deleteRubric",function(e) {
//					webServiceFormDocument.deleteRubric(e.detail.rubricId).then(function(response) {
//						ceForm.rubricRemoved(response.data);
//					}).catch(function(e) {
//						new Error("Error in deleteRubric method: " + e);
//					});
//				});

				// salve Rubric
//				ceRubric.addEventListener("saveRubric",function(e) {
//					webServiceFormDocument.saveRubric(e.detail).then(function(response) {
//						ceForm.newRubric(response.data);
//					}).catch(function(e) {
//						new Error("Error in deleteRubric method: " + e);
//					});
//				});

//				ceRubric.addEventListener("pullDescriptors",function(e) {
//					webServiceFormDocument.getRubric(e.detail.rubricId).then(function(response) {
//						ceRubric.setRubric(response.data);
//					}).catch(function(e) {
//						new Error("Error in pullDescriptors method: " + e);
//					});
//				});

//				ceForm.addEventListener("submit",function(e) {
//					webServiceFormDocument.saveProduction(e.detail).then(function(response) {
//						if(response.data.isProductionValid){
//							window.location.href =  "editor/"+response.data.url;
//						}
//					}).catch(function(e) {
//						new Error("Error in submit method: " + e);
//					});
//				});
			}
		}
	};
} ]);