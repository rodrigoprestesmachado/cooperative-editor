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
var loginApp = angular.module("LoginApp",  ["ngResource"]);

/**
 * Login Wrapper for document
 */
loginApp.service("loginDocument", function($http) {
	var baseUrl = "/CooperativeEditor/login";
	
	return {
		postLogin:function(text){
			return $http.post(baseUrl,text);
		},
		getLogout:function(){
			return $http.get(baseUrl);
		},
		putNewUser:function(user){
			return $http.put(baseUrl,user);
		}
	}

});


/**
 * This directive is used to listen the events from login component
 */
loginApp.directive('loginDirective',['$document','loginDocument',function($document, loginDocument) {
	return {
		link : {			
			post : function(scope, element, attr) {
				var ceLogin;
				if(element[0].localName === "ce-login"){
					ceLogin = element[0];
				}else{
					ceLogin = element[0].shadowRoot.querySelector("ce-login");
				}
				
				ceLogin.addEventListener("login",function(e) {
					loginDocument.postLogin(e.detail).then(function(response) {
						ceLogin.isLogin(response.data);
					}).catch(function(response) {
						new Error("Error in login method:" + response);
					});
				});
				
				ceLogin.addEventListener("logout",function() {
					loginDocument.getLogout().then(function() {
						ceLogin.isLogout();
					}).catch(function(response) {
						new Error("Error in logout method:" + response);
					});
				});
				
				ceLogin.addEventListener("newUser",function(e) {
					loginDocument.putNewUser(e.detail).then(function(response) {
						ceLogin.isUserValid(response.data);
					}).catch(function(response) {
						new Error("Error in newUser method:" + response);
					});
				});
			}
		}
	};
} ]);