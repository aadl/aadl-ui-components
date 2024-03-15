/**
* AADL Modal Component
*
Copyright 2024 Ann Arbor District Library


This file is part of AADL UI Components.

AADL UI Components is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

AADL UI Components is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with AADL UI Components. If not, see <https://www.gnu.org/licenses/>. 

* 
*/
(function(){

	window.aadlModal = function(s){

		var app = {

			s:{
				modal_content_postfix: "-modal",
				modal_base_template_name: "modalBase",
			    defaultLazyContentTarget: ".aadl-modal-content-inner",
			    defaultLazyTitleTarget: ".aadl-modal-title",
			    defaultCloseButtonTarget: ".aadl-modal-content-close",
			    dataParamsAttribute:"data-aadl-modal-params",
			    customModalClass:"",
			    closeText:"&#x2715;",//alternate - &#10006;
                lazyLoad: true,
                content_url: null,
                url_params:[],
                contentMiddleware:null,
                displayOpen:"flex",
                modalSize:"",
                title:"",
                content_addtional_parameters:{},
                errorMessage: "<br><br>Oh no!<br><br>There was an error loading the modal content",
			},

			INIT:false,
			OPEN:false,

			init:async function(s){
				let _this = this;
                
                //load global settings (we may implement all modals the same way, in which case we can use globals instead of config for each setting)
                if (typeof window.aadlModalGlobals !== "undefined") {
                	for (key in window.aadlModalGlobals) {
					    if (key == "templates") {
						    for (name in window.aadlModalGlobals[key]) {
                                _this.templates[name] = window.aadlModalGlobals[key][name];
						    }
					    } else {
                            _this.s[key] = window.aadlModalGlobals[key];
					    }
				    }
                }
                
                //we seed in seddings from direct implementation
				for (key in s) {
					
					if (key == "templates") {
						for (name in s[key]) {
                            _this.templates[name] = s[key][name];
						}

					} else {
                        _this.s[key] = s[key];
					}
				}

				//lfinally we seed in settings that target this modal instance by name
                if (typeof window.aadlModalContext !== "undefined") {
                	if (typeof window.aadlModalContext[_this.s.target] == "object") {
                		//seed in settings
				        for (key in window.aadlModalContext[_this.s.target] ) {
				        	if (key == "templates") {
						        for (name in window.aadlModalContext[_this.s.target][key]) {
                                    _this.templates[name] = window.aadlModalContext[_this.s.target][key][name];
						        }

					        } else {
                                _this.s[key] =  window.aadlModalContext[_this.s.target][key];
					        }    
				        }
                	}
                }

				//flatten api scope
				for(let key in _this.api){
                    if (typeof _this.api[key] === 'function') {
                        _this.api[key] = _this.api[key].bind(_this);
                    }
                }
                
                var el = document.querySelector(_this.s.target);
                if (el.hasAttribute(_this.s.dataParamsAttribute)) {
                    var params = el.getAttribute(_this.s.dataParamsAttribute);
                    _this.s.url_params = params.split("|");;
                }
                
                
                //initialize our modal and add content if we're ready
				if (typeof _this.s.content === "string") {
                    //initialize with predefined content
                    _this.generateModal();
                    _this.INIT = true;
                    const event = new CustomEvent("aadl-modal-init-after", { detail: {
                	target:_this.s.target,
                	modal:_this.api
                } });
                document.dispatchEvent(event);

				} else if (typeof  _this.s.content_url === "string") {
                    // fetch content
                    if (_this.s.lazyLoad) {
                    	//we'll load the modal when we click the modal
                    	_this.generateModal(true);
                    } else {
                    	var content = await _this.fetchModalContent();
                        _this.generateModal();
                        _this.INIT = true;
                        const event = new CustomEvent("aadl-modal-init-after", { detail: {
                	        target:_this.s.target,
                	        modal:_this.api
                        } });
                        document.dispatchEvent(event);
                    }
				}

                //set our basic open and close event listeners
				_this.setListeners();
                
                //modal is created and can be opened/closed, but may not have content yet
				const event2 = new CustomEvent("aadl-modal-create-after", { detail: {
                	target:_this.s.target,
                	modal:_this.api
                } });
                document.dispatchEvent(event2);

                
				return _this.api;

			},

			api:{

				open:async function(){
					var _this = this;
					

                    var modal = document.querySelector(_this.s.target + _this.s.modal_content_postfix);
                    modal.style.display = _this.s.displayOpen;
                    _this.OPEN = true;

                    var closeButton = modal.querySelector(_this.s.defaultCloseButtonTarget).focus();

                    if (_this.INIT === false) {
						//do initialization lazy
                        var contentLoaded = await _this.lazyLoadContent();
						//ensure we only do this once
                        _this.INIT = true;
                        const event = new CustomEvent("aadl-modal-init-after", { detail: {
                	        target:_this.s.target,
                	        modal:_this.api
                        } });
                        document.dispatchEvent(event);
					}

                    const event = new CustomEvent("aadl-modal-open-after", { detail: {
                	  target:_this.s.target,
                	  modal:_this.api
                    } });
                    document.dispatchEvent(event);

				},
				close:function(){
                    var _this = this;
					var modal = document.querySelector(_this.s.target + _this.s.modal_content_postfix);
                    modal.style.display = "none";
                    _this.OPEN = false;
                    document.querySelector(_this.s.target).focus();

                    const event = new CustomEvent("aadl-modal-close-after", { detail: {
                	  target:_this.s.target,
                	  modal:_this.api
                    } });
                    document.dispatchEvent(event);
				},

				getModalElement:function(){
                    var _this = this;
					return document.querySelector(_this.s.target + _this.s.modal_content_postfix);

				},
				getModalTrigger:function(){
					var _this = this;
					return document.querySelector(_this.s.target);
				},

			},

			setListeners:function(){
				let _this = this;

				var modal = document.querySelector(_this.s.target + _this.s.modal_content_postfix);
				var button = document.querySelector(_this.s.target);
				button.addEventListener('click', function(e){
					_this.api.open();
				});
                
                var closebutton = modal.querySelector(_this.s.defaultCloseButtonTarget);
				closebutton.addEventListener('click', function(e){
					_this.api.close();
				});

				modal.addEventListener('click', function(e){
					e = e || window.e;
					if (e.target == modal) {
                        _this.api.close();
					}
				},false);

			},

			lazyLoadContent:async function(){
				var _this = this;
                var content = await _this.fetchModalContent();
                if (content == "error") {
                    _this.s.content = _this.s.errorMessage;
                }
                
                _this.insertContent();
                return true;
			},

			fetchModalContent:async function(){
				var _this = this;

                var content = await fetch(_this.prepareUrl(), _this.s.content_addtional_parameters).catch(error => {
                    return "error";
                });

                if (!content.ok) {
                    return "error";
                }

                content = await content.json();

                if (typeof _this.s.contentMiddleware == "function") {
                	content = _this.s.contentMiddleware(content);
                }
                
                if (typeof content == "string") {
                	_this.s.content = content;
                } else if (typeof content == "object") {
                	if(typeof content.content !== "undefined"){
                        _this.s.content = content.content;
                	}
                	if(typeof content.title !== "undefined"){
                        _this.s.title = content.title;
                	}
                }
                return content;
                
			},

			prepareUrl:function(){
				var _this = this;

                var url = _this.s.content_url.slice(0);
				

				for(var i = 0;i < _this.s.url_params.length;i++){
                    url = url.replaceAll("{{ "+i+" }}", _this.s.url_params[i]);
				}

				return url;

			},

			insertContent:function(){
				var _this = this;
				var modal = document.querySelector(_this.s.target + _this.s.modal_content_postfix);
				modal.querySelector(_this.s.defaultLazyContentTarget).innerHTML = _this.s.content;
				modal.querySelector(_this.s.defaultLazyTitleTarget).innerHTML = _this.s.title;
			},

			generateModal:function(lazy = false){
				var _this = this;
				var modalWrapper = _this.templates[_this.s.modal_base_template_name].slice(0);
				if (lazy) {
                    modalWrapper = modalWrapper.replace("{{ content }}", _this.templates.loader);
				} else {
                    modalWrapper = modalWrapper.replace("{{ content }}", _this.s.content);
				}

				modalWrapper = modalWrapper.replace("{{ closeText }}", _this.s.closeText);
				modalWrapper = modalWrapper.replace("{{ modalSize }}", _this.s.modalSize);
				modalWrapper = modalWrapper.replace("{{ title }}", _this.s.title);
				modalWrapper = modalWrapper.replace("{{ customModalClass }}", _this.s.customModalClass);

				var id = (_this.s.target + _this.s.modal_content_postfix).replace("#","");
				
				modalWrapper = modalWrapper.replace("{{ id }}", id);
				document.body.appendChild(document.createRange().createContextualFragment(modalWrapper));

			},

			templates:{
				"modalBase":`<div style="display:none" id="{{ id }}" class="aadl-modal-bg {{ customModalClass }}">
                    <div class="aadl-modal-content-outer {{ modalSize }}">
                      <div class="aadl-modal-header">
                          <div class="aadl-modal-title">{{ title }}</div>
                          <button class="aadl-modal-content-close">{{ closeText }}</button>
                      </div>
                      
                      <div class="aadl-modal-content-inner">
                          {{ content }}
                      </div>
                    </div>
				</div>`,
				"loader":`<div class="aadl-loader-wrap">
				      <div class="aadl-modal-loader">
                        <div class="aadl-modal-loader-inner"></div>
                      </div>
                    </div>`
			},


		};
		app.init(s);

	};

	/*
    * initialize all widget with .aadl-modal
    */
    var aadlModals = document.querySelectorAll(".aadl-modal");
    aadlModals.forEach(function(el){

        var conf = {
            target:"#"+el.id
        };
        window.aadlModal(conf);

    });

    const event = new CustomEvent("aadl-modal-exists");
    document.dispatchEvent(event);


})();