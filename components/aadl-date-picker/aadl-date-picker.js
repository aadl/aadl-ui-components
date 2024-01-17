/**
* AADL Date Picker Component
*
Copyright 2024 Ann Arbor District Library


This file is part of AADL UI Components.

AADL UI Components is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

AADL UI Components is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with AADL UI Components. If not, see <https://www.gnu.org/licenses/>. 
*/

(function(){
	const widget_name = "aadlDatePicker";
	window[widget_name+"_repo"] = [];
	window[widget_name] = function(s){
		var app = {

			s:{
        widget_name: widget_name,
        dateTargets:[],
        show:false,//hide widget to start by default
        openOnFocus:true,//opens the widget when we focus on one of the input elements
        closeOnUnfocus:false,
        closable:true,//false prevents the widget from being hiDDen
        debug:false,
        state:{
          viewMonths:[], //{year:2023, month:7}, {year:2023, month:8}
          selections:[], // [{year:2023,month:4,day:7}]
          currentlySelecting: 0,
        },
        yearStart: 1800,
        selection:true,
        inputMasking:false,//use this to toggle a setting that adds smart inputs in place of existing select elements
        dateFormat:"MM-DD-YYYY", //accepts any arrangment of MM, DD, and YYYY.  does not yet support shortened outputs or full text outputs
        rules:{
            maxRange:36525,//~100 years
            minRange:2,
            range:false,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            disallowedRanges:[],
            selections:[],
        },
      },

			init:function(s){

				let _this = this;
        //var _self = this;
        var hasViewMonths = false;
				for(var key in s){
          if (key == "rules") {
            for (var ruleKey in s[key]) {
                _this.s[key][ruleKey] = s[key][ruleKey];
            }

          } else if (key == "state"){
            
            for (var stateKey in s[key]) {
                _this.s[key][stateKey] = s[key][stateKey];

                if (stateKey == "viewMonths") {
                    if (true) {
                      if (s[key][stateKey] !== []) {
                        hasViewMonths = true;
                      }
                    }
                }
            }
          }else {
              _this.s[key] = s[key];
          }
					
				}

        //get current time for defined timezone
        _this.s.now = _this.convertTZ(new Date(), _this.s.rules.timezone);

        if (!hasViewMonths) {
              _this.s["state"]["viewMonths"] = [{year:_this.s.now.getFullYear(), month:_this.s.now.getMonth()}];
        }
        
        Date.prototype.addDays = function(days) {
            var date = new Date(this.valueOf());
            date.setDate(date.getDate() + days);
            return date;
        } 

          /* compile our magics and flatten our scope */
          /*  - these allow us to use the parent scope in dev event in nested objects, but close everything off but the API at runtime */
          _this.setMagicHelper(_this);
          _this.compileMagics(_this);

          _this.view.render();// initial render of the component

                
          // make our widget instance available for later use.
          window[widget_name+"_repo"].push(this.api);


          /* we can listen for the creation of instances of this */
          let index = window[widget_name+"_repo"].length-1;
          const event = new CustomEvent(widget_name+"init", { detail: index });
          if (typeof _this.s.evt_elem !== "undefined") {
              _this.s.evt_elem.dispatchEvent(event);
          } else {
              document.dispatchEvent(event);
          }
                
          // we'll return this instance as well in case we're directly implementing it and need to work with it
				  return window[widget_name+"_repo"][index].api;

			},

      /* This processes a scoping abstraction that allows us to bind specific methods from the main object without exposing the entire object. */
      compileMagics:function(_this){
        // create API getter functions with closure access to top level properties
                for(let key in _this.api){
                    if (key.startsWith("__get")){
                        let string = key.split('__get')[1];
                        let propertyName = string.charAt(0).toLowerCase() + string.slice(1);
                        if (typeof _this[propertyName] === 'function') {
                        _this.api[key] = _this[propertyName].bind(_this);
                        } else {
                          _this.api[key] = _this[propertyName];
                        }
                    } else if (typeof _this.api[key] === 'function') {
                        _this.api[key] = _this.api[key].bind(_this);
                    }
                }

               // create API getter functions with closure access to top level properties
                for(let key in _this.view){
                    if (key.startsWith("__get")){
                        let string = key.split('__get')[1];
                        let propertyName = string.charAt(0).toLowerCase() + string.slice(1);
                        if (typeof _this[propertyName] === 'function') {
                          _this.view[key] = _this[propertyName].bind(_this);
                        }
                        else {
                          _this.view[key] = _this[propertyName];
                        }
                    } else if (typeof _this.view[key] === 'function') {
                        _this.view[key] = _this.view[key].bind(_this);
                    }
                }
                
                //flatten state validation scope
                for(let key in _this.stateValidation){
                    if (typeof _this.stateValidation[key] === 'function') {
                        _this.stateValidation[key] = _this.stateValidation[key].bind(_this);
                    }
                }

      },
      
      /* magic helpers */
      setMagicHelper:function(_this){
        _this.state = _this.s.state;
        _this.render = _this.view.render;
        _this.api.render = _this.view.render;
        _this.settings = _this.s;
        _this.checkIfDateIsAvailable = _this.stateValidation.checkIfDateIsAvailable;
      },

      

      /*
      *
      * Beginninng actual date picker logics
      *
      */

      /*
      * API  
      * - this gets returned to the initialization scope and set in the repo.
      *
      */
      api:{

        __getState:null,// double underscore getters __get can be used as magic methods to retreive top level properties at runtime.
        __getRender:function(){},
        __getCheckIfDateIsAvailable:function(){},
        
        getTarget(){
          var _this = this;
          return _this.s.target;
        },

        isDateSelected:function(year,month,day){
          var _this = this;
          
          if (_this.s.state.selections.length == 2) {
             //check range
             var myDate = new Date(year, month, day);

            var check1 = new Date(_this.s.state.selections[0].year, _this.s.state.selections[0].month, _this.s.state.selections[0].day);
            var check2 = new Date(_this.s.state.selections[1].year, _this.s.state.selections[1].month, _this.s.state.selections[1].day);

            if (myDate.getTime() == check1.getTime() || myDate.getTime() == check2.getTime()) {
                _this.debug("SAME!!!")
                return true;
            }
            
            var between = _this.getDatesBetween(check1, check2);
            for(var i = 0;i < between.length;i++){
                if (myDate.getTime() == between[i].getTime()) {

                  return true;

                }
            }   

          } else if (_this.s.state.selections.length == 1) {
            //check single date
            
            var myDate = new Date(year, month, day);

            var check = new Date(_this.s.state.selections[0].year, _this.s.state.selections[0].month, _this.s.state.selections[0].day);

            if (myDate.getTime() == check.getTime()) {
                return true;
            }
            return false;

          }

          return false;
          
        },
        
        getState:function(){
          var _this = this;
          return _this.s.state;
        },
        getSelectionIndex:function(){
          var _this = this;

          return _this.s.state.currentlySelecting;
           
        },

        setSelectionIndex:function(index){

          _this.s.state.currentlySelecting++;
          return _this.s.state.currentlySelecting;

        },

        getLastValidationError:function(){
          var _this = this;
          return _this.stateValidation.lastValidationError;
        },

        show:function(){
          var _this = this;
          _this.s.show = true;
          _this.view.render(false,true);
        },

        hide:function(){
          var _this = this;
          if (!_this.s.closable){
            return false;
          }
          _this.s.show = false;
          _this.view.render(false,false);
        },

        updateSelection(index, selection){

          var _this = this;
          var clonedState = _this.stateValidation.clone(); // we update a clone, then swap it in after validation
          clonedState.selections[index] = selection;

          if (!clonedState.selections[index]) {
              _this.debug("deleting");
             
              clonedState.selections.splice(index, 1);
          }

          if (_this.stateValidation.validate(clonedState)) {
            
            //do updates
            _this.s.state = clonedState;
            const event = new CustomEvent(_this.s.widget_name+"-selection-updated", { detail: _this.s.target });
            document.dispatchEvent(event);
           
            if (_this.s.state.currentlySelecting < _this.s.rules.maxSelections-1) {
              _this.s.state.currentlySelecting++;//normally we'd use the API, but in this scenario its faster to increment.
            } 
            
            _this.api.__getRender(false,false);


            
            return true;
          } else {
            //render with validation errors?

            _this.api.__getRender(_this.stateValidation.lastValidationError, false);
            _this.debug(_this.stateValidation.lastValidationError)
            return false;
          }

        },

        format:function(dateObj, format){
            // ex. MM-DD-YYYY            
            var dateString =  (' ' + format).slice(1);
            const regex = /MM/i;
            dateString =  dateString.replace(regex, ((dateObj.getMonth()+1)+"").padStart(2, '0'));

            const regex2 = /DD/i;
            dateString =  dateString.replace(regex2, (dateObj.getDate()+"").padStart(2, '0'));

            const regex3 = /YYYY/i;
            dateString =  dateString.replace(regex3, dateObj.getFullYear());

            return dateString;
        },

        setTemplate: function(key, template){
          var _this = this;
          _this.view.templates[key] = template;
        },

      },



      /*
      * stateValidation - handles logic for validating a proposed state object against the rules object.
      */
      stateValidation:{
        
        lastValidationError:"",

        clone:function(){//we'll make changes to a clone for validation before updating the actual state.
           var _this = this;
           var stateJson = JSON.stringify(_this.s.state); 
           var cloned = JSON.parse(stateJson);
           return cloned;

        },

        checkIfDateIsAvailable:function(year, month, day, debug = null){
              var _this = this;

              for (let  e = 0; e < _this.s.rules.disallowedRanges.length; e++) {
                var low = new Date(_this.s.rules.disallowedRanges[e][0].year, _this.s.rules.disallowedRanges[e][0].month, _this.s.rules.disallowedRanges[e][0].day);
                var high = new Date(_this.s.rules.disallowedRanges[e][1].year, _this.s.rules.disallowedRanges[e][1].month, _this.s.rules.disallowedRanges[e][1].day);
                var check = new Date(year, month, day);
                if (check >= low && check <= high) {
                  return false;
                }
              }

              return true;
        },

        validate:function(newState){
          var _this = this;

          _this.stateValidation.lastValidationError = "";//reset

          //check length of selections
          if (_this.s.rules.range) {

            if (newState.selections.length > 2) {
               _this.stateValidation.lastValidationError = "Range of 3 is not allowed";
               return false;
            }

            //check that multi selections are within max range
            if (newState.selections.length == 2) {
              
              if (typeof newState.selections[0] !== "object") {
                _this.stateValidation.lastValidationError = "First date in range not selected";
                  return false;
              }
              var date1 = new Date(newState.selections[0].year, newState.selections[0].month, newState.selections[0].day);
              var date2 = new Date(newState.selections[1].year, newState.selections[1].month, newState.selections[1].day);

              const diffTime = Math.abs(date2 - date1);
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

              if (diffDays > _this.s.rules.maxRange-1 && _this.s.rules.maxRange !== -1) {
                  _this.stateValidation.lastValidationError = "Date range too wide";
                  return false;
              }

              if (diffDays < _this.s.rules.minRange-1 && _this.s.rules.maxRange !== -1) {
                  _this.stateValidation.lastValidationError = "Date range not wide enough";
                  return false;
              }

              if (date1.getTime() >= date2.getTime()) {

                  _this.stateValidation.lastValidationError = "The second date cannot be before or the same as the first date";
                  return false;

              }

            }

          } else if (newState.selections.length > 1) {// if range is false but we've selected multiple dates
               _this.stateValidation.lastValidationError = "Selecting multiple dates is not allowed";
               return false;
          }

          
          //check that selections are real dates
          for (let  i = 0; i < newState.selections.length; i++) {
            var date = newState.selections[i].month.toString().padStart(2, '0') + "/" +
             newState.selections[i].day.toString().padStart(2, '0') + "/" + 
             newState.selections[i].year.toString().padStart(4, '0');
            if (!_this.dateExists(date)) {
              _this.stateValidation.lastValidationError = "Date Selection " + i + " is not a real date";
              return false;
            }
          }

          //check that selected dates are allowed
          for (let  i = 0; i < newState.selections.length; i++) {
              if(!_this.stateValidation.checkIfDateIsAvailable(newState.selections[i].year, newState.selections[i].month, newState.selections[i].day)){
                var check = new Date(newState.selections[i].year, newState.selections[i].month, newState.selections[i].day);
                _this.stateValidation.lastValidationError = _this.view._T("Selected date ")+ _this.view._T(check.getMonth()) + "/" +_this.view._T(check.getDate())+"/"+_this.view._T(check.getFullYear()) +_this.view._T(" is within a dissallowed range");
                return false;
              }
          }

          //check that dates between selections are allowed
          if (_this.s.rules.range) {

            if (newState.selections.length == 2) {
              _this.debug("HAS TWO SELECTIONS!!!!")
                var datesToCheck = _this.getDatesBetween(new Date(newState.selections[0].year, newState.selections[0].month, newState.selections[0].day), new Date(newState.selections[1].year, newState.selections[1].month, newState.selections[1].day));
                _this.debug(datesToCheck);
                for (let  i = 0; i < datesToCheck.length; i++) {
                    _this.debug(datesToCheck[i].getFullYear(), datesToCheck[i].getMonth(), datesToCheck[i].getDate());
                    if (!_this.stateValidation.checkIfDateIsAvailable(datesToCheck[i].getFullYear(), datesToCheck[i].getMonth(), datesToCheck[i].getDate())){
                      _this.debug("RANGE INVALID!!!!!");
                      _this.stateValidation.lastValidationError = "Invalid date within selected range";
                      return false;
                    }
                }
            }

          }

          _this.debug("The current state is valid!");
          return true;

        },


      },


      /*
      * view
      */
      view:{

        __getGetDaysInMonth:function(){},
        __getConvertTZ:function(){},
        __getSettings:function(){},

        weekdays:['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'],
        monthNames:['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'],
        monthNamesLong:["January","February","March","April","May","June","July",
            "August","September","October","November","December"],
        getYearsList:function(){

          var _this = this;
          var n = new Date();
          var arr = [];
          _this.debug(Number(n.getFullYear)+25)
          for(var i = _this.s.yearStart; i < n.getFullYear()+25; i ++){
            var isSelected = false;
            if (_this.s.state.viewMonths[0].year == i) {
                isSelected = true;
            }

            arr.push({
              year:i,
              isSelected:isSelected
            })
              
          }

          return arr;

        },

        getMonthsList:function(){
          var _this = this;
          var arr = [];
          for(var i = 0; i < _this.view.monthNames.length; i++){
            var isSelected = false;
            if (_this.s.state.viewMonths[0].month == i) {
                isSelected = true;
            }

            arr.push({
              month:i,
              monthName:_this.view.monthNames[i],
              monthNameLong: _this.view.monthNamesLong[i],
              isSelected:isSelected
            })

          }
          
          return arr;

        },

        getWeekDayFront:function(){
          var _this = this;
          var arr = [];
          for(let i = 0; i < _this.view.weekdays.length; i++){
            
            arr.push({
              weekdayfront:_this.view.weekdays[i]
            })

          }
          
          return arr;

        },

        getNextViewMonthYear:function(){
          var _this = this;
          var year = _this.s.state.viewMonths[0].year;
          var month = _this.s.state.viewMonths[0].month;

          if (month >= 11) {
              month = 0;
              year++;
          } else {
            month++;
          }

          return [month,year];


        },

        getPrevViewMonthYear(){
          var _this = this;

          var year = _this.s.state.viewMonths[0].year;
          var month = _this.s.state.viewMonths[0].month;

          if (month <= 0) {
              month = 11;
              year--;
          } else {
            month--;
          }

          return [month,year];

        },

        getDateAndYearFroMMonthChange:function(change, start = null){
          var _this = this;
          if(!start){
            start =_this.s.state.viewMonths[0].month;
          }
          var year = _this.s.state.viewMonths[0].year;
          var month = ((start+change)%12);
          if (start+change >= 12) {
              year++;
          } else if (start+change < 0) {
              year--;
          }

          return [month,year]

        },

        selectionBind:function(){

          var _this = this;

          for(var p = 0; p < _this.s.dateTargets.length;p++){
            
            if (typeof _this.s.state.selections[p] == "object"){
              var newDate = new Date(_this.s.state.selections[p].year, _this.s.state.selections[p].month, _this.s.state.selections[p].day);
              document.querySelector(_this.s.dateTargets[p]).value = _this.api.format(newDate, _this.s.dateFormat);
              //document.querySelector(_this.s.dateTargets[p]).value = newDate;
              _this.debug("FORMAT DATE: ", _this.api.format(newDate, "MM/DD/YYYY"))
              _this.debug("FORMAT DATE: ", _this.api.format(newDate, "MM - DD - YYYY"))
            }

            if (p == _this.s.state.currentlySelecting) {
              if (_this.s.show) {
                  document.querySelector(_this.s.dateTargets[p]).focus();
              }
            }
            
          }

        },

        closeWidgetListener:function(e){
          let _this = this;
          e = e || window.e;
          if (_this.s.show && _this.s.openOnFocus && !_this.s.closeOnUnfocus && _this.s.closable) {
            var wasTargets = false;
            for(let w = 0; w < _this.s.dateTargets.length;w++){
              if (document.querySelector(_this.s.dateTargets[w]) == e.target) {
                  wasTargets = true;
              }
            }
            if (!document.querySelector(_this.s.target).contains(e.target) && e.target !== document.querySelector(_this.s.target) && wasTargets === false && document.body.contains(e.target)){
              _this.api.hide();
              //return false;
            }
          }
        },
        
        dateFieldEnterListener:function(e){
          var _this = this;
          e = e || window.e;

          var code = (e.keyCode ? e.keyCode : e.which);
          if(code == 13) { //Enter keycode
              for(var p = 0; p < _this.s.dateTargets.length;p++){
                if (e.target == document.querySelector(_this.s.dateTargets[p])) {

                  if (document.querySelector(_this.s.dateTargets[p]).value == "") {
                      
                      _this.api.updateSelection(p, false);
                      return false;
                  }

                  var str = Date.parse(document.querySelector(_this.s.dateTargets[p]).value);
                  var myDate = new Date(str);

                  //do the thing
                  _this.api.updateSelection(p, {year:myDate.getFullYear(), month:myDate.getMonth(), day:myDate.getDate()})
        
                }
              }
          }

        },


        dateFieldFocusListener:function(e){
          var _this = this;
          e = e || window.e;
          for(var p = 0; p < _this.s.dateTargets.length;p++){

            if (e.target == document.querySelector(_this.s.dateTargets[p])) {
                
                _this.s.state.currentlySelecting = p;
                if (_this.s.openOnFocus && !_this.s.show) {

                  _this.api.show();

                }

            }

          }
          
        },


        render:function(withError = false, transition = true){
          var _this = this;

          const event = new CustomEvent(_this.s.widget_name+"-before-render",{ detail: {
                  target:_this.s.target
          } });

          document.dispatchEvent(event);

          if (withError) {
            _this.debug("WITH ERROR BEING CALLED");

            //event firing with an error message. Can be used to display validation errors outside of UI
            const errorEvent = new CustomEvent(_this.s.widget_name+"-before-render-error", {
                detail: {
                    errorMessage: withError,
                    target:_this.s.target
                },
            });
            document.dispatchEvent(errorEvent);

            withError = {
              errorMessage: withError
            };

          }

          // do rendering to view
          _this.debug("Doing render stuff");
          var html = _this.view.buildCurrentView(withError, transition);
          var elem = document.querySelector(_this.s.target);
          if (!elem) {
            const notarget = new CustomEvent(_this.s.widget_name+"-render-attempt-no-target", { detail: {
                  target:_this.s.target
                } });
            document.dispatchEvent(notarget);
            return false;
          }
          document.querySelector(_this.s.target).innerHTML = html;

          if (_this.s.inputMasking) {

              var inputView = [];
              for(var p = 0; p < _this.s.dateTargets.length;p++){
                var elem  = document.querySelector(_this.s.dateTargets[p]);
                inputView.push({id:elem.id});
                var html = _this.view.processTemplate(_this.view.templates.inputMask,{
                  inputMask:{id:elem.id,thisYear: new Date().getFullYear()}
                });

                //insert our masks below existing elements
                elem.parentNode.insertBefore(document.createRange().createContextualFragment(html), elem.nextSibling);

              }  
              
          }

          //attach listeners
          _this.view.attachListeners();
          //bind selections
          _this.view.selectionBind();

          const event2 = new CustomEvent(_this.s.widget_name+"-after-render", { detail: {
                  target:_this.s.target
                } });
          document.dispatchEvent(event2);
        },
        
        //this is our main view model for rendering days in a month
        getViewDateMatrix: function(){
          let _this = this;

          var finalViewList = [];
          var viewMonths = _this.view.__getSettings.state.viewMonths;
          for (var r = 0; r < viewMonths.length;r++) {
            
          var allDates = _this.view.__getGetDaysInMonth(viewMonths[r].month, viewMonths[r].year, _this.view.__getSettings.rules.timezone);
     
          //seed in availability data and format values for view
          var seeded = [];
          var padding = 0;
          for (var i = 0; i < allDates.length;i++) {
            var obj = {
              empty:false,
              year: allDates[i].getFullYear(),
              month: allDates[i].getMonth(),
              monthName: _this.view.monthNames[allDates[i].getMonth()],
              day: allDates[i].getDate(),
              dayOfWeekIndex: allDates[i].getDay(),
              dayOfWeek:_this.view.weekdays[ allDates[i].getDay()],
              dayOfWeekPrint:_this.view.weekdays[ allDates[i].getDay()],
              originalDate: allDates[i],
              stringDate:allDates[i].toString(),
              isAvailable: _this.stateValidation.checkIfDateIsAvailable(allDates[i].getFullYear(), allDates[i].getMonth(), allDates[i].getDate()),
              isSelected:_this.api.isDateSelected(allDates[i].getFullYear(), allDates[i].getMonth(), allDates[i].getDate())
            }
            
            if (i == 0) {
              padding = 0;
                for (let e = 0; e < obj.dayOfWeekIndex;e++) {
                  var emptyObj = {
                     empty:true,
                     isAvailable:false,
                     dayOfWeekIndex: e,
                     dayOfWeek:_this.view.weekdays[e],
                     monthName: _this.view.monthNames[allDates[i].getMonth()],
                     month: allDates[i].getMonth(),
                  }
                  padding++;
                  seeded.push(emptyObj);
                }
            }

            seeded.push(obj);
            
            if (i == allDates.length-1) {
                var nextDayOfWeek = obj.dayOfWeekIndex;
                var daysToPad = (seeded.length-1) + (7-(seeded.length-1) % 7);
                for (let e = allDates.length+padding; e < daysToPad;e++) {
                  nextDayOfWeek = nextDayOfWeek +1;
                  if (nextDayOfWeek >= 7) {
                      nextDayOfWeek = 0;
                  }
                  var emptyObj = {
                    empty:true,
                    isAvailable:false,
                    dayOfWeekIndex: nextDayOfWeek ,
                    dayOfWeek:_this.view.weekdays[nextDayOfWeek],
                    month: allDates[i].getMonth(),
                    monthName: _this.view.monthNames[allDates[i].getMonth()],

                  }
                  seeded.push(emptyObj);
                }
            }
          }

          //return seeded;
          finalViewList.push({
            year:viewMonths[r].year,
            month:viewMonths[r].month,
            monthName: _this.view.monthNames[viewMonths[r].month],
            days:seeded,
            weekdays:true,
            weekday:_this.view.getWeekDayFront()
          });

          }
          _this.debug(finalViewList)
          return finalViewList;
        },


        buildCurrentView:function(withError = false, transition = true){
          var _this = this;

          var monthViewMatrix = _this.view.getViewDateMatrix();
          
          return _this.view.processTemplate(_this.view.templates.outer,{
            show:_this.s.show,
            transition:transition,
            months:monthViewMatrix,
            withError:withError,
            legend:true,
            viewSelection:{
              monthsSelector: _this.view.getMonthsList(),
              yearsSelector: _this.view.getYearsList()
            },
            legend_not_available:"Not Available",
            legend_available:"Available",
            legend_selected:"Selected",


          });
        },

        listeners:[],

        attachListeners:function(){

          var _this = this;
           
          //unset listeners
          for(let w = 0; w < _this.view.listeners.length;w++){
              _this.view.listeners[w].elem.removeEventListener(_this.view.listeners[w].type,_this.view.listeners[w].listener);
          }

          for(let w = 0; w < _this.s.dateTargets.length;w++){
              var listener = document.querySelector(_this.s.dateTargets[w]).addEventListener('keyup', _this.view.dateFieldEnterListener);
              _this.view.listeners.push({
                elem:document.querySelector(_this.s.dateTargets[w]),
                listener:_this.view.dateFieldEnterListener,
                type:'keyup',
              })

              var listener2 = document.querySelector(_this.s.dateTargets[w]).addEventListener('focus', _this.view.dateFieldFocusListener);
              _this.view.listeners.push({
                elem:document.querySelector(_this.s.dateTargets[w]),
                listener:_this.view.dateFieldFocusListener,
                type:'focus',
              });
          }

          if (_this.s.openOnFocus) {
              window.addEventListener('click', _this.view.closeWidgetListener);
              _this.view.listeners.push({
                elem:window,
                listener:_this.view.closeWidgetListener,
                type:'click',
              });
          }

          document.querySelector(_this.s.target).addEventListener('keydown', function(e) {
            e == e || window.e;
              if (e.keyCode == 9 && _this.s.show && _this.s.closable) {
                
                _this.debug("tabbing while widget open, lets show the close button");
                var closeWidgetButton = document.querySelector(_this.s.target).querySelector(".aadlui-close-widget");
                closeWidgetButton.style.display = "block";

              }
            });


          var viewYearElement = document.querySelector(_this.s.target).querySelector(".aadlui-current-year select");
          _this.debug(viewYearElement)
          var viewMonthElement = document.querySelector(_this.s.target).querySelector(".aadlui-current-month select");

          viewYearElement.addEventListener('change',function(e){
            _this.s.state.viewMonths[0].year = parseInt(viewYearElement.value);
            for (var i = 1; i < _this.s.state.viewMonths.length; i++){
             _this.s.state.viewMonths[i].year = _this.view.getDateAndYearFroMMonthChange(i, parseInt(viewYearElement.value))[1];
             
            }
            _this.view.render();
          });

          viewMonthElement.addEventListener('change',function(e){
            _this.s.state.viewMonths[0].month = parseInt(viewMonthElement.value);
            for (var i = 1; i < _this.s.state.viewMonths.length; i++){
             _this.s.state.viewMonths[i].month = _this.view.getDateAndYearFroMMonthChange(i, parseInt(viewMonthElement.value))[0];
             _this.s.state.viewMonths[i].year = _this.view.getDateAndYearFroMMonthChange(i, parseInt(viewMonthElement.value))[1];
             
            }

            _this.view.render();
          });

          var previousViewMonth = document.querySelector(_this.s.target).querySelector(".aadlui-current-prev");
          previousViewMonth.addEventListener('click',function(e){
            var newViewMonths = _this.view.getPrevViewMonthYear();
            _this.s.state.viewMonths[0].month = newViewMonths[0];
            _this.s.state.viewMonths[0].year = newViewMonths[1];
            for (var i = 1; i < _this.s.state.viewMonths.length; i++){
             _this.s.state.viewMonths[i].month = _this.view.getDateAndYearFroMMonthChange(i)[0];
             _this.s.state.viewMonths[i].year = _this.view.getDateAndYearFroMMonthChange(i)[1];
            }

            _this.view.render();
          });

          var nextViewMonth = document.querySelector(_this.s.target).querySelector(".aadlui-current-next");
          nextViewMonth.addEventListener('click',function(e){
            var newViewMonths = _this.view.getNextViewMonthYear();
            _this.s.state.viewMonths[0].month = newViewMonths[0];
            _this.s.state.viewMonths[0].year = newViewMonths[1];
            for (var i = 1; i < _this.s.state.viewMonths.length; i++){
             _this.s.state.viewMonths[i].month = _this.view.getDateAndYearFroMMonthChange(i)[0];
             _this.s.state.viewMonths[i].year = _this.view.getDateAndYearFroMMonthChange(i)[1];
            }

            _this.view.render();
          });

          var closeWidgetButton = document.querySelector(_this.s.target).querySelector(".aadlui-close-widget");
          closeWidgetButton.addEventListener('click',function(e){
            _this.api.hide();
          });
          
          var months = document.querySelector(_this.s.target).querySelectorAll(".aadlui-month");
          for (let i = 0; i < months.length; i++) {
            months[i].addEventListener('click',function(e){
              e = e || window.e;
 
              var closest = e.target.closest(".aadlui-day");
              var target = closest;
              if (e.target.classList.contains("aadlui-day")){
                target = e.target; 
              } 
              if (target) {

                _this.debug("clicked a day", e);

                //do selection stuff if neccessary
                if (_this.s.selection) {
         
                    var uiDate = target.getAttribute("data-aadlui-date");
                    var uiDateObj = Date.parse(uiDate);
                    uiDateObj = new Date(uiDateObj);
                    var index  = _this.api.getSelectionIndex();

                    //if we're using the enter button, default to select the first date first always
                    if (e.detail === 0 && index !== 0 && typeof _this.s.state.selections[0] == "undefined") {
                      index = 0;
                    }
                    _this.api.updateSelection(index, {year:uiDateObj.getFullYear(),month:uiDateObj.getMonth(),day:uiDateObj.getDate()});
                    

                    //close the widget if we've filled out the fields
                    if (e.detail === 0 && (index == 1 || _this.s.range === false))  {
                        _this.api.hide();
                    }
  
                }

                //fire event
                const event = new CustomEvent("aadlDatePicker-day-click", { detail: {
                  targetDay:target,
                  target:_this.s.target,
                  originalEvent:e

                } });
                event.targetDay = target;
                event.originalEvent = e;

                document.dispatchEvent(event);
                  
              }

            });
          }

        },


        /* This is our main templating system. */
        // strings and numbers render into the view (absense of a val on the model will result in skipping in the template which results in a form conditional rendering
        //booleans map to a template if true.  works for conditionally rendering
        //arrays assume find a maching template and loop through the array and use each value as a template context.
        //objects find a matching templat and use the object value as the context
        //functions will bind the function to the current scope then be called and the result will be used in the template.  This is great for complex rendering not supported by any of the other methods
        processed: 0,
        processTemplate:function(template, context){
          var _this = this;
         
          let html = template;

          //find context keys in templates and replace with context vals.
          //if context val is an array, then iterate through call processTemplate using each val as a context and finding a template that matches the key
          for (let key in context) {
              
              if (!html.includes(`^^`+key+`/^^`)) {
               continue;
              }

              if (typeof context[key] == "string" || typeof context[key] == "number") {
                  //find and replace

                  html = html.replace(new RegExp("\\^\\^"+key+"/\\^\\^", "g"), _this.view._T(context[key]) );
              } else if (typeof context[key] == "boolean" && typeof _this.view.templates[key] == "string") {
                 
                      
                //booleans will grab the template of same name and process it within the current context.
                  if (context[key] === true){

                      var htmlObj = _this.view.processTemplate(_this.view.templates[key], context);
                      
                      html = html.replace(new RegExp("\\^\\^"+key+"/\\^\\^", "g"), htmlObj);
                  } else if (typeof _this.view.templates["!"+key] == "string" && context[key] === false) {

                   var htmlObj = _this.view.processTemplate(_this.view.templates["!"+key], context);
                   html = html.replace(new RegExp("\\^\\^"+key+"/\\^\\^", "g"), htmlObj);

                  }
              }
              else if (Array.isArray(context[key]) && typeof _this.view.templates[key] !== "undefined") {
                var htmlArr = "";
                for (let r = 0; r < context[key].length; r++) {
                    htmlArr += _this.view.processTemplate(_this.view.templates[key], context[key][r]);
                }
                html = html.replace(new RegExp("\\^\\^"+key+"/\\^\\^", "g"), htmlArr);
              }
              else if (typeof context[key] == "object" && typeof _this.view.templates[key] !== "undefined") {

                var htmlObj = _this.view.processTemplate(_this.view.templates[key], context[key]);
                html = html.replace(new RegExp("\\^\\^"+key+"/\\^\\^", "g"), htmlObj);

              } else if (typeof context[key] == "function") {
                    context[key].bind(context);
                    var out = context[key]();
                    html = html.replace(new RegExp("\\^\\^"+key+"/\\^\\^", "g"), _this.view._T(out));
              }
 
          }
          
          const regexp = new RegExp("\\^\\^(.*?)\\/\\^\\^", "g")
          const matches = [...html.matchAll(regexp)];
          for(let t = 0; t < matches.length;t++){
            html = html.replace(new RegExp("\\^\\^"+matches[t][1]+"\\/\\^\\^", "g"), "");
          }
          
          return html;

        },

        _T:function(str){
          var _this = this;
          if (typeof _this.s.translations !== "undefined") {
            if (typeof _this.s.translations[str] == "string") {
                return _this.s.translations[str];
            }
          }
          return str;
        },


        templates:{
          show:`  `,
          "!show":` style="display:none" `,
          outer:`<div class="aadlui-date-picker" ^^show/^^>
              ^^withError/^^
              ^^viewSelection/^^
              ^^legend/^^
              <div class="aadlui-months ^^transition/^^">^^months/^^</div>
          </div>`,
          viewSelection:`<div class="aadlui-date-navigation">
            <button class="aadlui-current-prev" aria-label="Previous Month in Date Picker">&#8249;</button>
            <div class="aadlui-current-year"><select name="currentYear" aria-label="Select Year being viewed for Date Picker">
                ^^yearsSelector/^^
            </select></div>
            <div class="aadlui-current-month"><select name="currentMonth" aria-label="Select Month being viewed for Date Picker">
                ^^monthsSelector/^^
            </select></div>
            <button class="aadlui-current-next" aria-label="Next Month in Date Picker">&#8250;</button>
            <button class="aadlui-close-widget" aria-label="Close Date Picker">x</button>
          </div>`,
          monthsSelector:`<option ^^isSelected/^^ value="^^month/^^">^^monthNameLong/^^</option>`,
          yearsSelector:`<option ^^isSelected/^^ value="^^year/^^">^^year/^^</option>`,
          isSelected:`selected="selected"`,
          selection:`<div><input /></div>`,
          months:`<div class="aadlui-month">
                  <h2>^^monthName/^^ ^^year/^^</h2>
                  ^^weekdays/^^
                  <div class="aadlui-days">^^days/^^ </div>
           </div>`,
          days:`<button  class="aadlui-day ^^isAvailable/^^ ^^isSelected/^^" style="^^empty/^^" data-aadlui-date='^^stringDate/^^' aria-label="^^day/^^ day of month ^^isAvailable/^^" >^^day/^^</button>`,
          weekdays:`<div class="weekday-top">
              ^^weekday/^^
          </div>`,
          weekday:`<span>^^weekdayfront/^^</span>`,
          isAvailable: `available`,
          "!isAvailable": `not-available`,//the ! is used for booleans in the context as an "else"
          empty:`background:#ffffff;border:0`,
          isSelected: `selected`,

          inputMask:`<div class="aadlui-input-mask" id="^^id/^^-input-mask">
              <input placeholder="MM" name="^^id/^^-input-mask-MM" type="text" minlength="1" maxlength="2" />-
              <input placeholder="DD" name="^^id/^^-input-mask-DD" type="text" minlength="1" maxlength="2" />-
              <input class= "input-mask-year" placeholder="YYYY" name="^^id/^^-input-mask-YYYY" value="^^thisYear/^^" type="text" minlength="4" maxlength="4"/>
          </div>`,

          withError:`<div class="aadlui-date-picker-error">^^errorMessage/^^</div>`,
          transition:``,
          "!transition":`notransition`,
          legend:`<div class="aadlui-date-picker-legend">
              <div class="legend-entry"><div class="not-available legend-square"></div> ^^legend_not_available/^^</div>
              <div class="legend-entry"><div class="available legend-square"></div> ^^legend_available/^^</div>
              <div class="legend-entry"><div class="selected legend-square"></div> ^^legend_selected/^^</div>
          </div>`,
        }


      },
      

      /*
      * utilz
      */

      debug:function(m){
        var _this = this;
        if (_this.s.debug) {
          console.log(...m);
        }
      },


      convertTZ: function(date, tzString) {
          return new Date((typeof date === "string" ? new Date(date) : date).toLocaleString("en-US", {timeZone: tzString}));   
      },
      getDaysInMonth: function(month, year, timezone) {
          let _this = this;

          var date = new Date(year, month, 1);
          var days = [];
          while (date.getMonth() === month) {
            days.push(_this.convertTZ(new Date(date), timezone));
            date.setDate(date.getDate() + 1);
          }

          return days;
      },

      getDatesBetween:function(startDate, stopDate) {
        var dateArray = new Array();
        var currentDate = startDate;
        while (currentDate <= stopDate) {
            dateArray.push(new Date (currentDate));
            currentDate = currentDate.addDays(1);
        }
        return dateArray;
      },
 
      dateExists:function(date){ // MM/DD/YYYY

        let dateformat = /^(0?[0-9]|1[0-2])[\/](0?[1-9]|[1-2][0-9]|3[01])[\/]\d{4}$/;

        // Matching the date through regular expression      
        if (date.match(dateformat)) {
            let operator = date.split('/');

            // Extract the string into month, date and year      
            let datepart = [];
            if (operator.length > 1) {
                datepart = date.split('/');
            }
            let month = parseInt(datepart[0]);
            let day = parseInt(datepart[1]);
            let year = parseInt(datepart[2]);

            // Create a list of days of a month      
            let ListofDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
            if (month == 0 || month > 1) {
                if (day > ListofDays[month]) {
                    //to check if the date is out of range     
                    return false;
                }
            } else if (month == 1) {
                let leapYear = false;
                if ((!(year % 4) && year % 100) || !(year % 400)) leapYear = true;
                if ((leapYear == false) && (day >= 29)) return false;
                else
                    if ((leapYear == true) && (day > 29)) {
                        _this.debug('Invalid date format!');
                        return false;
                    }
                }
        } else {
            _this.debug("Invalid date format!");
            return false;
        }
        return true;

      }

		};

		var app_created = Object.create(app);
		return app_created.init(s);
	};
    
    // we fire an event when this is loaded so that we don't rely strictly a proper dependency manager
    const event = new CustomEvent(widget_name+"-exists");
	  document.dispatchEvent(event);
	
})();