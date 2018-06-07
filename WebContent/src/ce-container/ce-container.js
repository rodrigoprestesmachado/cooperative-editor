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
			/**
			* The URL of the websocket
			*/
			url:{
				type:String,
				value:'ws://localhost:8080/CooperativeEditor/editorws'
			},
			/**
			* Where messages from the components arrive to be sent by the websocket
			*/
			request:{
				type:Object,
				observer(text) { this.$.ws.send(text)},
				notify: true
			}
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
        var pathname = window.location.pathname;
        var hash = pathname.substr(pathname.lastIndexOf("/"));
        this.url += hash;
    }

	connectedCallback() {
		super.connectedCallback();

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
	}

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
		this.$.ws.send({type:'BROWSE'});
	}

}

window.customElements.define(CooperativeEditorContainer.is, CooperativeEditorContainer);