# AADL Image Comparison Component

Allows for the overlay and comparison of two images

## Usage

### Pure JS

```
var myComparisonOptions = {
        target:"#test-compare-3", //query selector for where we want the component to render
        ratio:"ratio-1-8",
        lazyLoad:true,
        images:[
            {
                src:"example-img-1.jpg",
                title:"Malletts Creek Branch: Front entrance, 2004",
                alt:"Malletts Creek Branch: Front entrance, 2004"
            },
            {
                src:"example-img-2.jpg",
                title:"Malletts Creek Exterior, 2006",
                alt:"Malletts Creek Exterior, 2006"
            }
        ],
    };
        

    if (typeof window.aadlComparison == "function") {
        window.aadlComparison(myComparisonOptions);
    } else {
        document.addEventListener("aadlComparison-exists", function(e){
            e = e || window.e;
            window.aadlComparison(myComparisonOptions);
        });
    }
```

### Inline HTML

We can add all our data as attributes and when the script loads in all divs with the `aadl-comparison` class will be initialized

```
<div class="aadl-comparison ratio-1-8"
 id="test-compare-2" 
 data-aadl-comparison-1-src="example-img-1.jpg"  
 data-aadl-comparison-1-title="Malletts Creek Branch: Front entrance, 2004" 
 data-aadl-comparison-1-alt="Malletts Creek Branch: Front entrance, 2004" 
 data-aadl-comparison-2-src="example-img-2.jpg" 
 data-aadl-comparison-2-title="Malletts Creek Exterior, 2006" 
 data-aadl-comparison-2-alt="Malletts Creek Exterior, 2006"
 data-aadl-comparison-lazy="true">
</div>
```

### Pre Rendered HTML
In some cases you may want to prerender the HTML for the widget server side or you you may need to change the markup from the default.  In this case you can apply the component logic to already rendered HTML, just give it the `aadl-comparison` class so the compoenent can be applied on load.

```
<div class="aadl-comparison ratio-1-8" id="test-compare">

    <img src="example-img-2.jpg" title="Malletts Creek Exterior, 2006" />
	       
    <div class="addl-comparison-compare-top">
        <img src="example-img-1.jpg" title="Malletts Creek Branch: Front entrance, 2004" />
    </div>

    <input type="range" min="0" max="100" value="50" class="aadl-comparison-range">
    <div class="slider-mask"></div>

</div>
```


## API

`render(s = {})` Allows us to re initialize our component.  Accepts the same settings as initial `aadlComparison` function, but will also reuse already intialize settings.

`getTarget()` returns the component's query selector target

## Custom Events

`aadlComparison-exists` - dispatched when the script is loaded.

## Examples

View [example.html](example.html) for several working examples


