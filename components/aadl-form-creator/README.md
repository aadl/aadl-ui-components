# AADL Form Creator Component

Creates a form for creating form fields and saves the data to an existing form field :dizzy_face:

## Usage

### JS initialization

```
<textarea name="custom-fields"></textarea>
<div id="custom-fields" style="width:375px"></div>
```

```
    conf = {
        "target":"#custom-fields",
        "aggregate_field":"custom-fields",//name of a form field this data can be pushed to
    };

    data: {
        fields:{
            "fc-0":{
                "machine_name":"test-1",
                "label":"Test 1",
                "description":"asdfasdf asdffsdafdsafds",
                "type":"text",
                "required":false,
                "weight":100,
                "meta":{
                  "character_limit":12,
                  "regex_pattern":"^[0-z \-\_]+$",
                }
            },
            "fc-1":{
                "machine_name":"test-2-select",
                "label":"Test Select ",
                "description":"A select element",
                "type":"select",
                "required":true,
                "weight":100,
                "meta":{
                  "options":[
                    {
                      "value":"1234",
                      "label":"first option",
                      "weight":100
                    },
                    {
                      "value":"4567",
                      "label":"second option",
                      "weight":100
                    }
                  ]
                }
            },
            "fc-2":{
                "machine_name":"test-multi-select",
                "label":"Test Multi-Select",
                "description":"afd. fjfdskljf dfoiu",
                "type":"multiselect",
                "required":false,
                "weight":100,
                "meta":{
                  "options":[
                    {
                      "value":"1234",
                      "label":"second option",
                      "weight":200
                    },
                    {
                      "value":"4567",
                      "label":"first option",
                      "weight":100
                    }
                  ]
                }
            },
            "fc-3":{
                "machine_name":"test-file-field",
                "label":"Test Fiel Type Field",
                "description":"asdf lkjsdliuaerbkfad",
                "type":"file",
                "required":false,
                "weight":200,
                "meta":{
                  
                  "file_types":["jpg", "pdf"],
                  "file_size":64
                }
            },
            "fc-4":{
                "machine_name":"test-checkbox-field",
                "label":"Test Checkbox Field",
                "description":"lkjdslhdsaf dsbjsdf,bdsf",
                "type":"checkbox",
                "required":false,
                "weight":100,
                "checked":false,
                
            }
        }
    };
        

    if (typeof window.formCreator == "function") {
        window.formCreator(conf, data);
    } else {
        document.addEventListener("aadlComparison-exists", function(e){
            e = e || window.e;
            window.formCreator(conf, data);
        });
    }
```

### Inline HTML intialization



```
<textarea name="form-creator-2"></textarea>
<div class="aadl-fc-wrap" id="form-creator-2" data-aggregate-field="form-creator-2" data-init-key="fcData2"></div>
```

In this example, `data-init-key` will point to a JS object in the window scope with the existing form data if it exists:

```

window.fcData2 = {fields:{
      "fc-0":{
            "machine_name":"test-1",
            "label":"Test 1",
            "description":"asdfasdf asdffsdafdsafds",
            "type":"text",
            "required":false,
            "weight":100,
            "meta":{
                "character_limit":12,
                "regex_pattern":"^[0-z \-\_]+$",
            }
       },
    }}
```



## Custom Events

`aadl-form-creator-exists` - dispatched when the script is loaded.

## Examples

View [example.html](example.html) for several working examples


