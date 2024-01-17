# AADL Date Picker UI Component

The date picker has 3 intended use cases:

  - Picking and validation of single dates
  - Picking and validation of date ranges
  - Displaying a static calander


## Usage

#### Include the script and stylesheet in the page head

```
<link rel="stylesheet" href="aadl-date-picker.css">
<script src="aadl-date-picker.js" async></script>
```
#### Or include script with import for module based applications

```
<script type="module">
     import "./aadl-date-picker.js"
</script>
```

#### Basic Date Picker
```

         <input id="myDate" name="first"/>
         <br>
         <div id="example" style="display:inline-block"></div>
         <script>

              var myDatePickerOptions = {
                  target: "#example",
                  dateTargets: ["#myDate"],
              }
                  
             
              if (typeof window["aadlDatePicker"] !== "undefined") {
                  window["aadlDatePicker"](myDatePickerOptions);
              } else {
                  document.aDDEventListener("aadlDatePicker-exists", function(){
                      window["aadlDatePicker"](myDatePickerOptions);
                  });
              }
  
        </script>
```



#### Date picker for range of 3-5 days
```

        <input id="begin-date" name="first"/> - 
        <input id="second-date" name="second"/>
        <br>
        <div id="someElementID"></div>
        <script>
              var myDatePickerOptions = {
                  name: "example1",
                  target: "#someElementID", //this is the element that the date picker is placed in.
                  dateTargets: ["#begin-date", "#second-date"],
                  selection:true,//toggle whether we want to run our click functions for selecting dates
                  show:false,//toggle whether to actually display the widget,
                  yearStart:1827,//for year selection its the earliest allowed year
                  dateFormat:"MM/DD/YYYY",
                  rules:{
                  	disallowedRanges:[
                  	    [{year:0, month: 0, day:0},{year:2024, month: 0, day:6}],
                  	    [{year:2024, month: 0, day:12}, {year:2023, month: 0, day:14}]
                  	],
                    maxRange:5,
                    minRange:3,
                    range:true,//whether to allow selection of a date range or single date only
                    timezone: "America/New_York"
                  },
                  state:{
                    viewMonths:[{year:2024, month:1}],
                    selections:[],
                    currentlySelecting: 0
                  }
              };
             
              if (typeof window["aadlDatePicker"] !== "undefined") {
                  window["aadlDatePicker"](myDatePickerOptions)
              } else {
                  document.aDDEventListener("aadlDatePicker-exists", function(){
                      window["aadlDatePicker"](myDatePickerOptions)
                  });
              }
      </script>
```

#### Static Calander

```

        <div id="example3" style="display:inline-block"></div>
        <script>
            var myWidgetSettings3 = {
                  target: "#example3",
                  selection:false,//don't trigger the default clicking behavior when clicking dates.
                  show:true,//show the component on load
                  yearStart:1827,//for year selection its the earliest allowed year
                  closable:false, //prevent user from closing the component
                  rules:{
                    range:false,//whether to allow selection of a date range or single date only
                    timezone: "America/New_York",
                    maxSelections:0 //No selections allowed
                  },
                  state:{
                    viewMonths:[{year:2024, month:2}], //show Feb 2024
                  }

              };
             
              if (typeof window["aadlDatePicker"] !== "undefined") {
                  window["aadlDatePicker"](myWidgetSettings3)
              } else {
                  document.aDDEventListener("aadlDatePicker-exists", function(){
                      window["aadlDatePicker"](myWidgetSettings3)
                  });
              }


              //listen for clicks on days
              document.aDDEventListener('aadlui-day-click',function(e){
                e = e || window.e;
                console.log(e);
                if (e.detail.target == "#example3") {

                    var attr = e.targetDay.getAttribute("data-aadlui-date");
                    alert("clicked on calander day: " + attr);
                }
              });

      </script>
```


## Notes on JavaScript Dates
JavaScript likes to count months starting from 0.  Anywhere in this component's setting where you may manually set a month, Months should be counted from 0. e.g. January = 0, Febuary = 1 ... December = 11

When inputing dates into this component we'll use object with the following format:
```
{
    year:2024,
    month:1,
    day:1
}
```

## options

| Option key | Type | Description | Required? | Default Value |
| -------- | ------- | ------- | ------- | ------- |
| `closable` | Bool | false prevents the component from being hiDDen.  Good when using as a calander | No | true |
| `closeOnUnfocus` | Bool | Whether the component should close when focus is no longer on either input element. | No | true |
| `dateFormat` | String | E.G. `MM/DD/YYYY`, `DD/MM/YYYY`, `MM-DD-YYYY`, | No | `"MM/DD/YYYY"` |
| `dateTargets` | String | Array of selectors for for input elements to bind selections to. | Yes | |
| `name` | Bool | A name for the component instance. | No |  |
| `openOnFocus` | Bool | Whether the component should render be shown when one of the inputs has focus. | No | true |
| `selection` | Bool | toggles whether the compoenent is used as a date selector, or just a calander.  Great for custom   implmentations. | No | True |
| `show` | Bool | Toggles whether the component should render. | No | false |
| `target` | String | Query selector for where the date picker component is rendered. | Yes | |
| `translations` | Object | Object keys define original text, values contain their translation. | No |  |
| `yearStart` | Int | Array of selectors for for input elements to bind selections to. | No | 1800 |




### rules
A sub object of the options/settings object with the following options:


| Option key | Type | Description | Required? | Default Value |
| -------- | ------- | ------- | ------- | ------- |
| `rules.disallowedRanges` | Array | An Array of Arrays, each of which have two objects with `year`, `month`, and `day` keys.  These objects define ranges that users will be dissallowed from selecting and will appear greyed out. | No | `[]` |
| `rules.maxRange` | Int | Defines the maximum number of days for the date range that can be selected. Must be greater than or equal to 2 for ranges. | No | 36525 |
| `rules.minRange` | Int | Defines the minimum number of days for the date range that can be selected. Must be greater than or equal to 2 for ranges. | No | 2 |
| `rules.range` | Bool | RUE sets up the component for selecting a date range.  FALSE sets up the component for selecting a single date. | No | false |
| `rules.selections` | Array | An Array defining objects with `year`, `month`, and `day` keys.  Defines pre-selected dates. | No | `[]` |
| `rules.timezone` | String | Tells the component which timezone to use for calculating dates. | No | Client timezone |





### state
A sub object of the options/settings object with the following options:
| Option key | Type | Description | Required? | Default Value |
| -------- | ------- | ------- | ------- | ------- |
| `state.currentlySelecting` | Int | `0` or `1` - The index for which input the Date Picker should start on.  Useful when preselecting the first date | No | 0 |
| `state.selections` | Array | An Array of arrays of objects defining already selected dates| No | [] |
| `state.viewMonths` | Array | An array of objects that define the years and month which the component should show by default. E.G. `[{year:2024, month:0}, {year:2024, month:1}]` would be JAnuary 2024 and Febuary 2024. | No | Current Month/Year |






## API
Each initialized datePicker component is returned with API with the following functions:

`show` Visibly renders the Date Picker component

`hide` Visibly hides the date picker component

`getTarget` returns the component's query selector target

`render()` renders the component.

`isDateSelected(year,month,day)` Checks whether a given date is selected oir within the selected range.

`setSelectionIndex(index)` Manually sets which input element in our list of input elements we are currently selecting a date for.

`getLastValidationError` Get the most recent error generated by the validation function

`updateSelection(index, selection)` Manually sets the date for a given input elemnt in our list.

`format(dateObj, format)` A utility function for outputing string representations by replacing YYYY, MM, DD

`setTemplate(key, template)` used for updating or aDDing html templates to the Date Picker.


## Custom Events

There are several custom events for hooking into the date picker

- `aadlDatePicker-day-click` - dispatched when a day is clicked/selected on the calander.
- `aadlDatePicker-before-render` - dispatched before the compoenent renders after each action.
- `aadlDatePicker-after-render` - dispatched after the compoenent renders after each action.
- `aadlDatePicker-before-render-error` - dispatched before the widget renders when rendering with a validation error.
- `aadlDatePicker--render-attempt-no-target` - dispatched when the target does not exist and rendering terminates.
- `aadlDatePicker-exists` - dispatched when the script is loaded.

## Custom Error Logging

There is a custom event fired before a validation error is rendered aadlDatePicker-before-render-error. If your application has a specific presentation for errors, this can be used to capture the error. Example:

```
document.aDDEventListener('aadlDatePicker-before-render-error',function(e){
    e = e || window.e;
    console.log("ERROR",e);
    if (e.detail.target == "#someElementID") {
        document.querySelector("#indy-error").innerHTML = e.detail.errorMessage;
        document.querySelector("#indy-error").style.display = "block";
    }
});
```

## Errors

    Range of 3 is not allowed
    First date in range not selected
    Date range too wide
    Date range not wide enough
    The second date cannot be before or the same as the first date
    Selecting multiple dates is not allowed
    Date Selection n is not a real date
    date is within a dissallowed range
    Invalid date within selected range

## Translations

You can translate any of the rendered text in the component. This is passed as an object to the config:

```
translations:{ 
    "AUG": "Août",
    "August": "Août",
    " is within a dissallowed range":"  is in a dissallowed range"
}
```
This can be used both for language translations as well as text customizations without editing the source. 


## Handling Frontend Rendered HTML

Your application may rely on frontend rendering that may remove and reintroduce the target elements and input elements.  In this the Date Picker object still exists and just needs to have its render function called again to reattach the listeners.  The following snippet would render for all existing Date Picker components.

```
for (index in window["aadlDatePicker_repo"]){
  window["aadlDatePicker_repo"][index].__getRender()
}
```


## Examples

View [example.html](example.html) for several working examples
