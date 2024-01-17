/**
* AADL Image Comparison Component
*
Copyright 2024 Ann Arbor District Library


This file is part of AADL UI Components.

AADL UI Components is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

AADL UI Components is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with AADL UI Components. If not, see <https://www.gnu.org/licenses/>. 

* 
*/
(function(){
    if (typeof window["aadlComparison_repo"] == "undefined") {
       window["aadlComparison_repo"] = [];
    }
	window.aadlComparison = function(s = {}){
         var app = {

         	s:{
                lazyLoad: false,
                lazyAttribute: ""
         	},

            render:function(s = {}){
                var _this = this;
                _this.init(s = {})
            },

            getTarget:function(){
                var _this = this;
                return _this.s.target;
            },

            api:{},

         	init:function(s = {}){
         		let _this = this;
                
                //setup our API
                _this.api.render = _this.render.bind(_this);
                _this.api.getTarget = _this.getTarget.bind(_this);

                //injest settings
                for (var key in s) {
                    _this.s[key] = s[key];
                }
                if (typeof _this.s["target"] == "undefined") {
                	console.log("comparisonUI initialized without target");
                    return _this;
                }

                var el = document.querySelector(_this.s.target);

                if (!el) {
                    console.log("comparisonUI initialized with invalid target");
                    return _this;
                }

                if (el.hasAttribute("data-aadl-comparison-1-src") && el.hasAttribute("data-aadl-comparison-2-src")) {
                    _this.s.images = [];
                    _this.s.images[0] = {
                        src:el.getAttribute("data-aadl-comparison-1-src"),
                        alt:el.getAttribute("data-aadl-comparison-1-alt") || "",
                        title:el.getAttribute("data-aadl-comparison-1-title") || ""
                    }
                    _this.s.images[1] = {
                        src:el.getAttribute("data-aadl-comparison-2-src"),
                        alt:el.getAttribute("data-aadl-comparison-2-alt") || "",
                        title:el.getAttribute("data-aadl-comparison-2-title") || ""
                    }
                }

                if (el.hasAttribute("data-aadl-comparison-lazy")) {
                    if ( el.getAttribute("data-aadl-comparison-lazy") == "true") {
                       _this.s.lazyLoad = true;
                    }
                    else {
                        _this.s.lazyLoad = false;
                    }
                }

                if (_this.s.lazyLoad) {
                    _this.s.lazyAttribute = `loading="lazy"`;
                }

                if (typeof _this.s.ratio !== "undefined") {
                    el.classList.add(_this.s.ratio);
                }

                //generateUI
                if (typeof _this.s.images !== "undefined") {
                  if (_this.s.images.length == 2) {
                      document.querySelector(_this.s.target).innerHTML = _this.createHTML();
                  }
                }

                _this.setup();

                window["aadlComparison_repo"].push(_this.api);
                let index = window["aadlComparison_repo"].length-1;

                return window["aadlComparison_repo"][index];

         	},


            createHTML:function(){
                var _this = this;

                var html = `<img src="`+_this.s.images[1].src+`" alt="`+_this.s.images[1].alt+`" title="`+_this.s.images[1].title+`" `+_this.s.lazyAttribute+` />
                    <div class="addl-comparison-compare-top">
                        <img src="`+_this.s.images[0].src+`" alt="`+_this.s.images[0].alt+`" title="`+_this.s.images[0].title+`" `+_this.s.lazyAttribute+`  />
                    </div>
                    <input type="range" min="0" max="100" value="50" class="aadl-comparison-range">
                    <div class="slider-mask"></div>`;

                return html;
            },


            rangeInput:function(e){
                var _this = this;
                e = e || window.e;

                var val = e.target.value;
                
                var elem = document.querySelector(_this.s.target);
                var comparison = elem.querySelector(".addl-comparison-compare-top");
                var mask = elem.querySelector(".slider-mask");

                var percent = (val);

                comparison.style.width = percent+"%";
                mask.style.left = percent+"%";


            },


            //destroy old listeners and apply new ones.  Its important that we save our listeners
         	setup:function(){
         		let _this = this;
                _this.removeListeners();

                var func = _this.rangeInput.bind(_this);

                //set dimensions
                var elem = document.querySelector(_this.s.target);

                var width = elem.offsetWidth;

                var imgs = elem.querySelectorAll("img");
                for(var i = 0; i < imgs.length; i++){
                    imgs[i].style.width = width + "px";
                };

                _this.UIWIDTH = width;


                //do listeners
                var range = elem.querySelector(".aadl-comparison-range");
                range.value = 50;

                range.addEventListener("input", func, false);
                _this.indexListener(range, "input", func, false);

         	},
         	indexListener:function(elem, type, callback, bubble = false){
         		var _this = this;
         		_this._listeners.push({
         			elem:elem,
         			type:type,
         			callback:callback,
         			bubble:bubble
         		});
         	},
         	removeListeners:function(){
         		var _this = this;
         		for (let i = _this._listeners.length-1; i >= 0;i--){
         			_this._listeners[i].elem.removeEventListener(_this._listeners[i].type, _this._listeners[i].callback, _this._listeners[i].bubble);
         			_this._listeners.pop();
         		}
         	},

         	_listeners:[],

         };

         return app.init(s);
	};

    /*
    * initialize all widget with .aadl-comparison
    */
    var comparisonWidgets = document.querySelectorAll(".aadl-comparison");
    comparisonWidgets.forEach(function(el){

        var conf = {
            target:"#"+el.id
        };
        window.aadlComparison(conf);

    });

    const event = new CustomEvent("aadlComparison-exists");
    document.dispatchEvent(event);

})();