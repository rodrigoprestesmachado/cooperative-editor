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

	connectedCallback() {
		super.connectedCallback();

		 //########## Support for Firefox and Safari #1 ##############//

        var ceContainer = this;
        var soundChat = ceContainer.$.soundChat;
        var ceParticipants = ceContainer.$.ceParticipants;
        var ceConfiguration = ceContainer.$.ceConfiguration;
        var ceEditor = ceContainer.$.ceEditor;
        var ceRubric = ceEditor.$.ceRubric;

  	  // Calls Web Socket Wrapper
  	  var pathname = window.location.pathname;
  	  var hash = pathname.substr(pathname.lastIndexOf("/"));
  	  ceContainer.webSocket.open("ws://localhost:8080/CooperativeEditor/editorws"+hash);

  	  // Register onmessage function
  	  ceContainer.webSocket.registerOnMessage(function(event) {
  		  if(event.data === "isLoggedIn")
  			  window.location.href = "";
  		  soundChat.receiveMessage(event.data);
  		  ceParticipants.receiveMessage(event.data);
  		  ceEditor.receiveMessage(event.data);
  		  ceRubric.receiveMessage(event.data);
  	  });

  	  // Editor Container
  	  ceContainer.addEventListener("browse", function(e) {
  			ceContainer.webSocket.send("{'type':'BROWSE'}");
  	  });
  	  // Sound Chat
  	  soundChat.addEventListener("sendMessage", function(e) {
  		  ceContainer.webSocket.send("{'type':'SEND_MESSAGE','textMessage':'"+e.detail.message+"'}");
  	  });
  	  soundChat.addEventListener("typing", function(e) {
  		  ceContainer.webSocket.send("{'type':'TYPING'}");
  	  });
  	  soundChat.addEventListener("browse", function(e) {
  	      ceContainer.webSocket.send("{'type':'BROWSE'}");
  	  });
  	  // Rubric
  	  ceRubric.addEventListener("finishRubric", function(e) {
  		  ceContainer.webSocket.send("{'type':'FINISH_RUBRIC','rubricProductionConfiguration':{'id':'"+e.detail.idRPC+"'}}");
  	  });
  	  ceRubric.addEventListener("readRubricStatus", function(e) {
  	      ceContainer.webSocket.send("{'type':'READ_RUBRIC_STATUS'}");
  	  });
  	  ceRubric.addEventListener("browse", function(e) {
            ceContainer.webSocket.send("{'type':'BROWSE'}");
  	  });
  	  // Participants
  	  ceParticipants.addEventListener("readParticipantsStatus", function(e) {
  	      ceContainer.webSocket.send("{'type':'READ_PARTICITANTS_STATUS'}");
  	  });
  	  ceParticipants.addEventListener("browse", function(e) {
  	      ceContainer.webSocket.send("{'type':'BROWSE'}");
  	  });
  	  ceParticipants.addEventListener("requestParticipation", function(e) {
  	      ceContainer.webSocket.send("{'type':'REQUEST_PARTICIPATION'}");
  	  });
  	  // Configuration
  	  ceConfiguration.addEventListener("browse", function(e) {
  	      ceContainer.webSocket.send("{'type':'BROWSE'}");
  	  });
  	  // Editor
  	  ceEditor.addEventListener("finishParticipation", function(e) {
  	      ceContainer.webSocket.send("{'type':'FINISH_PARTICIPATION','content':"+e.detail+"}");
  	  });
  	  ceEditor.addEventListener("browse", function(e) {
  	      ceContainer.webSocket.send("{'type':'BROWSE'}");
  	  });

		document.onkeyup = function(e) {
			var key = e.which || e.keyCode;
			if (e.shiftKey && e.altKey){
				switch(key) {
					case 37:
						soundChat.setFocus();
						break;
			        case 38:
			        	ceParticipants.readComponentStatus();
			            break;
			        case 40:
			        	ceRubric.readComponentStatus();
			        	break;
			        case 49: case 50: case 51: case 52: case 53: case 54: case 55: case 56: case 57:
			        	key = key-48;
			        	soundChat.readLatestMessages(key);
			        	break;
				}
			}
		}
  	//########## Finish Support for Firefox and Safari #1 ##############//
	}

	//########## Support for Firefox and Safari #1 ##############//
	logout() {
		return this.loginDocument.getLogout();
	}
	//########## Finish Support for Firefox and Safari #1 ##############//

	_helpOpen(){
		var content =
			this.localize('shortcut') + "<br/>" +
			this.localize('shortcut2') + "<br/>" +
			this.localize('shortcut3') + "<br/>" +
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

	_browse(){
		this.dispatchEvent(new CustomEvent('browse'));
	}

}

window.customElements.define(CooperativeEditorContainer.is, CooperativeEditorContainer);