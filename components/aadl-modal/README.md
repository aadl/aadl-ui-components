# AADL Modal Component

Provides highly configurable modal functionaility

### Setup

Ensure the CSS is added to the head
`<link rel="stylesheet" href="aadl-modal.css">`

Ideally JS is added at the end of the body tag
`<script src="./aadl-modal.js"></script>`

### Usage

### Example 1  - Basic Initialization
```
<button id="mytestModal" class="aadl-modal">Open me</button>
<script>
if (typeof window.aadlModalContext == "undefined") {
    window.aadlModalContext = {};
}
window.aadlModalContext["#mytestModal"] = {
    content:`Some content`,
    title:"Some Title Text",
    modalSize: "aadl-modal-md",
    
}
</script>
```

### Example 2  - Pure JS Initialization

```
<button id="mytestModal" class="aadl-modal">Open me</button>
<script>
var button = docuemnt.createElement("button");
button.id = mytestModal;
document.body.appendChild(button);
window.aadlModal({
    target:"#mytestModal",
    content:`Some content`,
    title:"Some Title Text",
    modalSize: "aadl-modal-md",
    
});
</script>
```


### Advanced Configuration

Configuration can also be set at the global scope that will be applied to all modals on the page unless overridden.  This is the ideal approach if all your modals share the same or similar implementation
```
window.aadlModalGlobals = {
    title:"Some title"
    lazyLoad:true,

}
```

### Utilizing Remote Content
Content can be loaded via fetch API

`content_url` - the url used to fetch content.  Params should follow the pattern `{{ 0 }}` , `{{ 1 }}`, `{{ 2 }}`, etc...

`url_params` - an array of parameters to replace in the url.  this can be added with a pipe `|` seperated list in the html attribute `data-aadl-modal-params` to allow for params individualized per modal button, while using the same content_url which may be configured globally

`contentMiddleware` - a function that receives the parsed json of the fetch response, and should return an object with content and/or title keys `{content: "your content", title: "your title"}`

`lazyLoad` - whether to laod content on modal open (`true`) or modal init (`false`). defaults to `true`

**Here is a functioning example**
```

<button id="mytestmodalurlparams" class="aadl-modal" data-aadl-modal-params="2024|4">View magnitude 4</button>
<script>
if (typeof window.aadlModalContext == "undefined") {
    window.aadlModalContext = {};
}
window.aadlModalContext["#mytestmodalurlparams"] = {
    title:"Recent Earthquakes",
    content_url:"https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime={{ 0 }}-"+(new Date().getMonth()).toString().padStart(2,"0")+"-"+(new Date().getDate()-2).toString().padStart(2,"0")+"&endtime={{ 0 }}-"+(new Date().getMonth()).toString().padStart(2,"0")+"-"+(new Date().getDate()).toString().padStart(2,"0")+"&minmagnitude={{ 1 }}",
    contentMiddleware:function(data){

        var resp = {};
        resp.content = "<ul>";

        for(ev in data['features']){
            resp.content += `<li>`+data['features'][ev]["properties"].title+`</li>`;
        }
        resp.content += "</ul>";

        return resp;
    
    },
}
```


### Options

| Option key | Type | Description | Required? | Default Value |
| -------- | ------- | ------- | ------- | ------- |
| `modal_content_postfix` | String | Defines the ID for the actual modal | No | `-modal` |
| `modal_base_template_name` | String | Defines the key int he templates object used for modal rendering | No | `modalBase` |
| `defaultLazyContentTarget` | String | Defines a target for where content is injected to the modal | No | `.aadl-modal-content-inner` |
| `defaultLazyTitleTarget` | String | Defines a target for where the title is injected to the modal | No | `.aadl-modal-title` |
| `defaultCloseButtonTarget` | String | Defines a target for where the close event listener is attached | No | `.aadl-modal-content-close` |
| `closeText` | String | Defines the content fo the close button | No | `&#x2715;` |
| `customModalClass` | String | Defines a custom class to assign to the modal | No | `""` |
| `lazyLoad` | Bool | `true` = load content when modal is opened, `false` = laod content during initialization | No | `""` |
| `displayOpen` | String | defines the css display setting for when the modal is opened | No | `flex` |
| `modalSize` | String | defines a class used to adjust modal sizing `.aadl-modal-sm`,`aadl-modal-md`,`aadl-modal-lg`,`aadl-modal-xl`,`aadl-modal-2xl` | No | `""` |
| `modalSize` | String | defines a class used to adjust modal sizing `.aadl-modal-sm`,`aadl-modal-md`,`aadl-modal-lg`,`aadl-modal-xl`,`aadl-modal-2xl` | No | `""` |
| `title` | String | defines the content of the modal title area | No | `""` |
| `content` | String | Defines the content of the modal content area | No | `""` |
| `errorMessage` | String | Defines the messag shown in the content area when there is an error loading content | No | `<br><br>Oh no!<br><br>There was an error loading the modal content` |
| `content_url` | String | Defines a string used for fetching content | No | `""` |
| `dataParamsAttribute` | String | Defiens the attribute used on a modal button to define url parameters (feeds to `url_params`) | No | `data-aadl-modal-params` |
| `url_params` | String | Defines url parameters to apply to the content_url | No | `[]` |
| `contentMiddleware` | function | a function that receives the fetched json object and returns an object for rendering modal content and/or title `{content: "your content", title: "your title"}`  | No | `null` |
| `content_addtional_parameters` | object | passed directly to parameter 2 of fetch | No | `{}` |



## Examples

View [example.html](example.html) for several working examples
