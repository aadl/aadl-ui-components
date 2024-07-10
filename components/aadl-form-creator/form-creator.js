/**
* AADL Form Creator Component
*
Copyright 2024 Ann Arbor District Library


This file is part of AADL UI Components.

AADL UI Components is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

AADL UI Components is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with AADL UI Components. If not, see <https://www.gnu.org/licenses/>. 

* 
*/
(function(){

  window.formCreator = function(s, data = null){
	var app = {

		FIELD_PREFIX: "aadl-fc-",

		data:{},

		s:{
          key_prefix: "fc-",
          title:"Custom Fields",
          file_types:["pdf", "jpeg", "jpg", "png", "gif", "webp", "doc", "docx", "csv", "xls"]
		},

		init:function(s, data = null){
			let _this = this;
            for(key in s){
                _this.s[key] = s[key];
            }

            if (typeof _this.s.aggregate_field == "undefined") {
              console.log("No Aggregate field defined for form creator");
              return _this;
            }

			if (data !== null) {
                _this.data = data;
			} else if (data == null) {
                tx = document.querySelector("textarea[name='"+_this.s.aggregate_field+"']");
                if (_this.isJsonString(tx.value)) {
                    _this.data = JSON.parse(tx.defaultValue);
                } else {
                    _this.data = {fields:{}};
                }
            }

            _this.FIELD_PREFIX =  _this.FIELD_PREFIX + _this.s.aggregate_field + "-";//we prefix our prefix with the aggregate field name to ensure scoping for each instance of form-creator

            if (typeof _this.s.target == "undefined") {
              console.log("No target defined for field creator");
              return _this;
            }
           
            //initialize
            _this.sortDataByWeights();//sort fields and options by weight on render
            _this.render();


			
        },


        getFieldCount(){
        	var _this = this;
        	var count = -1;
        	var num = -1;
        	for(key in _this.data.fields){
        		var num = key.replace(_this.s.key_prefix, '');
                var num = parseInt(num);
                if(num > count){
                    count = num;
                }
        	}
            return count;
        },


        getDataAsJSON:function(){
            var _this = this;
        	return JSON.stringify(_this.data);
        },

        render:function(){
        	let _this = this;



        	var el = document.querySelector(_this.s.target);

        	var html = `<div class="aadl-fc aadl-fc-`+_this.FIELD_PREFIX+`"><div class="aadl-fc-header"><h2>`+_this.s.title+`</h2><button class="add-field-`+_this.FIELD_PREFIX+` aadl-fc-button aadl-fc-add-field-button">Add Field</button></div>`;
        	for (key in _this.data.fields) {

        		html += _this.createFieldHTML(key, _this.data.fields[key]);

        	}

        	html+= `</div>`;

        	//console.log(html);

        	el.innerHTML = html;

            for (key in _this.data.fields) {

            	_this.setFieldJS(key, _this.data.fields[key]);
            
            }

            document.querySelector(_this.s.target+` .add-field-`+_this.FIELD_PREFIX).addEventListener('click',function(){
            	_this.addNewField();
            });


            _this.sendToAggregate();//lets ensure we're up to date

        },

        sendToAggregate:function(){
        	var _this = this;
        	var json = _this.getDataAsJSON();
        	document.querySelector("textarea[name='"+_this.s.aggregate_field+"']").value = json;

        },



        addNewField:function(){
            let _this = this;

            count = _this.getFieldCount();
            count++;
            _this.data.fields[_this.s.key_prefix+count] = {
	            "machine_name":"",
	            "label":"",
	            "description":"",
	            "type":"text",
	            "required":false,
	            "weight":100,
	            "meta":{
	              "character_limit":255,
	              "regex_pattern":"",
	            }
	        }
	        _this.render();

        },


        createField:function(id, field){

        	var _this = this;
        	_this.createFieldHTML(id, field);
            _this.setFieldJS(id, field);

            return id;

        },

        createFieldHTML:function(id, field){
        	var _this = this;
        	var html = `<div class="aadl-fc-field-wrapper `+_this.FIELD_PREFIX+id+`" id="`+_this.FIELD_PREFIX+id+`"><span class="aadl-fc-id">id: `+id+`</span>`;
        	html += `<div class="aadl-fc-field"><label for="`+_this.FIELD_PREFIX+id+`-machine_name">Machine Name</label><input name="`+_this.FIELD_PREFIX+id+`-machine_name" type="text" value="`+field.machine_name+`"></div>`;
        	html += `<div class="aadl-fc-field"><label for="`+_this.FIELD_PREFIX+id+`-label">Label</label><input name="`+_this.FIELD_PREFIX+id+`-label" type="text" value="`+field.label+`"></div>`;
        	html += `<div class="aadl-fc-field"><label for="`+_this.FIELD_PREFIX+id+`-description">Description</label><input name="`+_this.FIELD_PREFIX+id+`-description" type="text" value="`+field.description+`"></div>`;

        	html += `<div class="aadl-fc-field"><label for="`+_this.FIELD_PREFIX+id+`-type">Type</label><select name="`+_this.FIELD_PREFIX+id+`-type">
                <option value="text" `+_this.getSelected(field.type, "text")+`>Text</option>
                <option value="textarea" `+_this.getSelected(field.type, "textarea")+`>Text Area</option>
                <option value="select" `+_this.getSelected(field.type, "select")+`>Select</option>
                <option value="checkbox" `+_this.getSelected(field.type, "checkbox")+`>Checkbox</option>
                <option value="multiselect" `+_this.getSelected(field.type, "multiselect")+`>Multi-Select</option>
                <option value="file" `+_this.getSelected(field.type, "file")+`>File</option>
        	</select></div>`;

            html += `<div class="aadl-fc-field"><label for="`+_this.FIELD_PREFIX+id+`-weight">Weight</label><input name="`+_this.FIELD_PREFIX+id+`-weight" type="text" value="`+field.weight+`"></div>`;
            html += `<div class="aadl-fc-field"><label for="`+_this.FIELD_PREFIX+id+`-required">Required</label><input name="`+_this.FIELD_PREFIX+id+`-required" type="checkbox" `+_this.getChecked(field.required)+`></div>`;
            
            if (field.type == "select" || field.type == "multiselect") {

            	html += `<div id="`+_this.FIELD_PREFIX+id+`-options" class="select-el-options">{{options}}</div><div class="select-el-options-actions"><button id="`+_this.FIELD_PREFIX+id+`-add-options">Add Option</button></div>`;
            	var options = "";
                if (typeof field.meta !== "undefined") {
                	if (typeof field.meta.options !== "undefined") {
                      for (var i = 0;i<field.meta.options.length;i++){
                      	html += `<div class="custom-field-optons-option"><span class="option-counter">Option: `+(i+1)+`</span>`;
                        html += `<div class="aadl-fc-field"><label for="`+_this.FIELD_PREFIX+id+`-options-`+i+`-label">Label</label><input name="`+_this.FIELD_PREFIX+id+`-options-`+i+`-label" type="text" value="`+field.meta.options[i].label+`"></div>`;
                        html += `<div class="aadl-fc-field"><label for="`+_this.FIELD_PREFIX+id+`-options-`+i+`-value">Value</label><input name="`+_this.FIELD_PREFIX+id+`-options-`+i+`-value" type="text" value="`+field.meta.options[i].value+`"></div>`;
                        html += `<div class="aadl-fc-field"><label for="`+_this.FIELD_PREFIX+id+`-options-`+i+`-weight">Sort Weight</label><input name="`+_this.FIELD_PREFIX+id+`-options-`+i+`-weight" type="text" value="`+field.meta.options[i].weight+`"></div>`;
                        html += `<button id="`+_this.FIELD_PREFIX+id+`-options-`+i+`-delete" class="delete-option">Delete Option</button>`;
                        html += `</div>`

                      }
                	}
                }
                html = html.replace("{{options}}",options);


            }

            if (field.type == "file") {
        	  html += `<div class="aadl-fc-field"><label for="`+_this.FIELD_PREFIX+id+`-file-types">File Types</label><select name="`+_this.FIELD_PREFIX+id+`-file-types" multiple>`;
                  for (var u = 0; u < _this.s.file_types.length;u++) {
                    html += `<option value="`+_this.s.file_types[u]+`" `+_this.getSelected(field.meta.file_types, _this.s.file_types[u])+`>`+_this.s.file_types[u]+`</option>`;
                  }
        	  html += `</select></div>`;
        	  html += `<div class="aadl-fc-field"><label for="`+_this.FIELD_PREFIX+id+`-file-size">File Size</label><input name="`+_this.FIELD_PREFIX+id+`-file-size" type="text" value="`+field.meta.file_size+`"></div>`;


            }

            if (field.type == "text" || field.type == "textarea") {

        	  html += `<div class="aadl-fc-field"><label for="`+_this.FIELD_PREFIX+id+`-regex-pattern">Regex Pattern</label><input name="`+_this.FIELD_PREFIX+id+`-regex-pattern" type="text" value="`+field.meta.regex_pattern+`"></div>`;
        	  html += `<div class="aadl-fc-field"><label for="`+_this.FIELD_PREFIX+id+`-character-limit">Character Limit</label><input name="`+_this.FIELD_PREFIX+id+`-character-limit" type="text" value="`+field.meta.character_limit+`"></div>`;

            }

             
            html += `<div><button class="delete-field-`+_this.FIELD_PREFIX+id+` aadl-fc-button aadl-fc-delete-field-button">&#x1F5D1;Delete Field</button></div></div>`;

        	return html;

        },




        setFieldJS:function(id, field){
        	var _this = this;

        	_this.addInputListeners(document.querySelector("input[name='"+_this.FIELD_PREFIX+id+"-machine_name']"),id);
        	_this.addInputListeners(document.querySelector("input[name='"+_this.FIELD_PREFIX+id+"-label']"),id);
        	_this.addInputListeners(document.querySelector("input[name='"+_this.FIELD_PREFIX+id+"-description']"),id);
            _this.addInputListeners(document.querySelector("input[name='"+_this.FIELD_PREFIX+id+"-weight']"),id);
            _this.addInputListeners(document.querySelector("input[name='"+_this.FIELD_PREFIX+id+"-required']"),id);

            if (field.type == "select" || field.type == "multiselect") {

            	if (typeof field.meta !== "undefined") {
                	if (typeof field.meta.options !== "undefined") {
                      for (let i = 0;i<field.meta.options.length;i++){
                      	//html += `<div class="custom-field-optons-option">`;
                        //html += `<label for="`+_this.FIELD_PREFIX+id+`-options-`+i+`-label">Label</label><input name="`+_this.FIELD_PREFIX+id+`-options-`+i+`-label" type="text" value="`+field.meta.options[i].label+`">`;
                        _this.addInputListeners(document.querySelector("input[name='"+_this.FIELD_PREFIX+id+"-options-"+i+"-label']"),id);
                        //html += `<label for="`+_this.FIELD_PREFIX+id+`-options-`+i+`-value">Value</label><input name="`+_this.FIELD_PREFIX+id+`-options-`+i+`-value" type="text" value="`+field.meta.options[i].value+`">`;
                        _this.addInputListeners(document.querySelector("input[name='"+_this.FIELD_PREFIX+id+"-options-"+i+"-value']"),id);
                        //html += `<label for="`+_this.FIELD_PREFIX+id+`-options-`+i+`-weight">Sort Weight</label><input name="`+_this.FIELD_PREFIX+id+`-options-`+i+`-weight" type="text" value="`+field.meta.options[i].weight+`">`;
                        _this.addInputListeners(document.querySelector("input[name='"+_this.FIELD_PREFIX+id+"-options-"+i+"-weight']"),id);
                       // html += `</div>`

                        //_this.FIELD_PREFIX+id+`-options-`+i+`-delete

                        _this.addDeleteOptionListener(document.querySelector("#"+_this.FIELD_PREFIX+id+`-options-`+i+`-delete`),id, i);

                      }
                	}
                    _this.addAddOptionListener(document.querySelector("#"+_this.FIELD_PREFIX+id+`-add-options`), id);
                }

            }

            if (field.type == "file") {

            	_this.addInputListeners(document.querySelector("select[name='"+_this.FIELD_PREFIX+id+"-file-types']"),id);
                _this.addInputListeners(document.querySelector("input[name='"+_this.FIELD_PREFIX+id+"-file-size']"),id);


            }

            if (field.type == "text" || field.type == "textarea") {

            	_this.addInputListeners(document.querySelector("input[name='"+_this.FIELD_PREFIX+id+"-regex-pattern']"),id);
                _this.addInputListeners(document.querySelector("input[name='"+_this.FIELD_PREFIX+id+"-character-limit']"),id);

            }

            _this.addSelectTypeListener(document.querySelector("select[name='"+_this.FIELD_PREFIX+id+"-type']"),id);

        	_this.addInputListeners(document.querySelector("select[name='"+_this.FIELD_PREFIX+id+"-type']"),id);

        	_this.addDeleteFieldListener(document.querySelector(`.delete-field-`+_this.FIELD_PREFIX+id), id);


        },

        updateModel:function(ui, id){
        	let _this = this;

        	_this.data.fields[id].machine_name = document.querySelector("input[name='"+_this.FIELD_PREFIX+id+"-machine_name']").value;
        	_this.data.fields[id].label = document.querySelector("input[name='"+_this.FIELD_PREFIX+id+"-label']").value;
        	_this.data.fields[id].description = document.querySelector("input[name='"+_this.FIELD_PREFIX+id+"-description']").value;
        	_this.data.fields[id].required = document.querySelector("input[name='"+_this.FIELD_PREFIX+id+"-required']").checked;
        	_this.data.fields[id].weight = parseInt(document.querySelector("input[name='"+_this.FIELD_PREFIX+id+"-weight']").value);

        	if (_this.data.fields[id].type == "select" || _this.data.fields[id].type == "multiselect") {

        		if (typeof _this.data.fields[id].meta !== "undefined") {
                	if (typeof _this.data.fields[id].meta.options !== "undefined") {
                      for (var i = 0;i<_this.data.fields[id].meta.options.length;i++){
                            _this.data.fields[id].meta.options[i].value = document.querySelector("input[name='"+_this.FIELD_PREFIX+id+"-options-"+i+"-value']").value;
                            _this.data.fields[id].meta.options[i].label = document.querySelector("input[name='"+_this.FIELD_PREFIX+id+"-options-"+i+"-label']").value;
                      	    _this.data.fields[id].meta.options[i].weight = parseInt(document.querySelector("input[name='"+_this.FIELD_PREFIX+id+"-options-"+i+"-weight']").value);


                      }
                    }
                }
        	}

        	if (_this.data.fields[id].type == "file") {

        		_this.data.fields[id].meta.file_size = parseInt(document.querySelector("input[name='"+_this.FIELD_PREFIX+id+"-file-size']").value);
        		_this.data.fields[id].meta.file_types = document.querySelector("select[name='"+_this.FIELD_PREFIX+id+"-file-types']").value;


        	}

        	if (_this.data.fields[id].type == "text" || _this.data.fields[id].type == "textarea") {
                _this.data.fields[id].meta.regex_pattern = document.querySelector("input[name='"+_this.FIELD_PREFIX+id+"-regex-pattern']").value;
                _this.data.fields[id].meta.character_limit = parseInt(document.querySelector("input[name='"+_this.FIELD_PREFIX+id+"-character-limit']").value);

        	}
            
            //this must be done last to prevent tripping up  when changing types
        	_this.data.fields[id].type = document.querySelector("select[name='"+_this.FIELD_PREFIX+id+"-type']").value;


        	console.log(_this.data);
        	_this.sendToAggregate();

        },


        addDeleteFieldListener:function(ui,id){
        	let _this = this;

        	let deleteFieldHandler = function(e){

        		if (confirm("Delete " + id + "?")) {

        			console.log(e);
        		
                   delete _this.data.fields[id]
	               _this.render();

        		}

        		
        			
        	}

        	ui.addEventListener("click", deleteFieldHandler);

        },


        addAddOptionListener:function(ui,id){
        	let _this = this;

        	let addOptionHandler = function(e){

        		console.log(e);

        		
        			if (typeof _this.data.fields[id].meta.options == "undefined") {
                        _this.data.fields[id].meta.options = [{
	                      "value":"",
	                      "label":"",
	                      "weight":100
	                    }];
	                    _this.render();
        			} else {

        				 _this.data.fields[id].meta.options.push({
	                      "value":"",
	                      "label":"",
	                      "weight":100
	                    });

        				_this.render();

        			}
                    
        		

        	}

        	ui.addEventListener("click", addOptionHandler);

        },

        addDeleteOptionListener: function(ui,id, index){
        	let _this = this;

        	let deleteOptionHandler = function(e){

        		if (confirm("Delete option?")) {

        		console.log(e);

        		
        			if (typeof _this.data.fields[id].meta.options == "undefined") {
                        _this.data.fields[id].meta.options = [{
	                      "value":"",
	                      "label":"",
	                      "weight":100
	                    }];
	                    _this.render();
        			} else if (_this.data.fields[id].meta.options.length > 1) {

        				_this.data.fields[id].meta.options.splice(index, 1);
        				_this.render();

        			} else {
        				//show some sort of feedback for select elements requiring at least one option

        			}
                    
        		}

        	}

        	ui.addEventListener("click", deleteOptionHandler);

        },


        addSelectTypeListener:function(ui, id){
        	let _this = this;

        	let selectTypeHandler = function(e){

        		

        		var value = e.target.value;

        		if (value == "select" || value == "multiselect") {
        			if (typeof _this.data.fields[id].meta == "undefined") {
                        _this.data.fields[id].meta = {};
        			}
        			if (typeof _this.data.fields[id].meta.options == "undefined") {
                        _this.data.fields[id].meta.options = [{
	                      "value":"",
	                      "label":"",
	                      "weight":100
	                    }];
	                    
        			}
                    
        		} else if (value == "text" || value == "textarea") {

        			if (typeof _this.data.fields[id].meta == "undefined") {
                        _this.data.fields[id].meta = {};
        			}

        			if (typeof _this.data.fields[id].meta.character_length == "undefined") {
                        _this.data.fields[id].meta.character_length = 10;
        			}

        			if (typeof _this.data.fields[id].meta.regex_pattern == "undefined") {
                        _this.data.fields[id].meta.regex_pattern = "";
        			}

        		} else if (value == "file") {

        			if (typeof _this.data.fields[id].meta == "undefined") {
                        _this.data.fields[id].meta = {};
        			}

        			if (typeof _this.data.fields[id].meta.file_types == "undefined") {
                        _this.data.fields[id].meta.file_types = [];
        			}

        			if (typeof _this.data.fields[id].meta.file_size == "undefined") {
                        _this.data.fields[id].meta.file_size = 128;
        			}

        		}

        		_this.render();

        	

        	}

        	ui.addEventListener("change", selectTypeHandler);

        },

        addInputListeners:function(ui, id){
        	let _this = this;


        	let inputHandler = function(e){

                var value = e.target.value;

                if (e.target.type == "checkbox") {

                        
                    if (e.target.checked) {
                            value = true;
                        } else {
                            value = false;
                        }
                    }

                
                

                    _this.updateModel(e.target, id);
               // },100);
                

            }

        	ui.addEventListener('input', inputHandler);
            ui.addEventListener('propertychange', inputHandler); 
            ui.addEventListener('keydown', inputHandler);
            ui.addEventListener('paste', inputHandler); 
            ui.addEventListener('input', inputHandler); 
            ui.addEventListener('change', inputHandler);

        },

        getSelected: function (val, match) {



        	if (val == match){
                return "selected";
        	} else if (val.constructor === Array) {

        		for (var e= 0; e < val.length;e++) {

        			if (val[e] == match) {
                        return "selected";
        			}

        		}

        	} else {
        		return "";
        	}

        },

        getChecked: function (val) {



        	if (val == true){
                return "checked";
        	} else {
        		return "unchecked";
        	}

        },
        
        //might be a bit of a controversial function, but it should at least be run on init... maybe on render will be a setting
        sortDataByWeights:function(){
        	var _this = this;

        	var sortWeight = function(a, b) {
        	  if (parseInt(a.weight) < parseInt(b.weight)){ return -1;}
        	  if (parseInt(a.weight) > parseInt(b.weight)) return 1;
        	  return 0;
      	    }
            
            var arr = [];

      	    for(key in _this.data.fields){
                arr.push({key:key, weight:_this.data.fields[key].weight});
      	    }


            arr.sort(sortWeight);
            var obj = {};
            for(var i = 0; i < arr.length;i++){
              obj[arr[i].key] = _this.data.fields[arr[i].key];
            }
            _this.data.fields = obj;

        	//_this.data.fields.sort(sortWeight);
        	for (let key in _this.data.fields) {
        		if (typeof _this.data.fields[key].meta !== "undefined") {
        			if (typeof _this.data.fields[key].meta.options !== "undefined") {
        				if (_this.data.fields[key].meta.options.constructor === Array) {
        					_this.data.fields[key].meta.options = _this.data.fields[key].meta.options.sort(sortWeight);
        				}
        			}
        		}
        	}
        },

        isJsonString:function(str) {
          try {
            JSON.parse(str);
          } catch (e) {
            return false;
          }
            return true;
        }




	}

	return app.init(s, data);
  }

  var aadlFormCreators = document.querySelectorAll(".aadl-fc-wrap");
  aadlFormCreators.forEach(function(el){

        var conf = {
            target:"#"+el.id,
            aggregate_field:el.getAttribute("data-aggregate-field")
        };

        var data = null;

        if (typeof window[el.getAttribute("data-init-key")] !== "undefined") {
          data = window[el.getAttribute("data-init-key")]
        }

        console.log(conf);

        window.formCreator(conf,data);

  });

  const event = new CustomEvent("aadl-form-creator-exists");
  document.dispatchEvent(event);

})()