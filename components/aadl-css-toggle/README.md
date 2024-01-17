# AADL Pure CSS Dropdown Toggle Component


## Usage

#### Include the CSS file

```
<link rel="stylesheet" type="text/css" href="aadl-css-toggle.css">
```

#### Add your Markup

```
<div class="aadl-toggle">
    <input class="aadl-toggle-check" type="checkbox" tabindex="0" aria-label="toggle menu with space bar">
    <div class="aadl-toggle-text">
    	<span class="">

           <!-- Title / DROPDOWN TEXT HERE -->
           <!-- Title / DROPDOWN TEXT HERE -->
           <!-- Title / DROPDOWN TEXT HERE -->

    	</span>
    	<div class="aadl-toggle-arrow">
    		<span class="aadl-toggle-arrow-top"></span>
    		<span class="aadl-toggle-arrow-bottom"></span>
    	</div>
    </div>
	
    <div class="aadl-toggle-content">
        <div class="aadl-toggle-content-inner">
        
            <!-- CONTENT GOES HERE -->
            <!-- CONTENT GOES HERE -->
            <!-- CONTENT GOES HERE -->

        </div>
    </div>
</div>
```


### Only Toggle on Mobile

 - We can have seperate titles for mobile as well by using the `mobile-only` and `desktop-only` classes

```
<div class="aadl-toggle">

	<input class="aadl-toggle-check" type="checkbox" tabindex="0"  aria-label="toggle menu">
    <div class="aadl-toggle-text">
    	<span class="mobile-only">Show Menu</span>
    	<span class="desktop-only">Menu</span>
    	<div class="aadl-toggle-arrow mobile-only">
    		<span class="aadl-toggle-arrow-top"></span>
    		<span class="aadl-toggle-arrow-bottom"></span>
    	</div>
    </div>
	
    <div class="aadl-toggle-content no-desktop-toggle">
        <div class="aadl-toggle-content-inner">

            <!-- CONTENT GOES HERE -->
            <!-- CONTENT GOES HERE -->
            <!-- CONTENT GOES HERE -->

        </div>
    </div>
</div>
```


## Examples

View [example.html](example.html) for several working examples
