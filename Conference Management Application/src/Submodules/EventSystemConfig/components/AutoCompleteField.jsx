import { Alert, Popover, Select, Tag } from "antd"
import { forwardRef, useEffect, useState } from "react";
 

function isValidEmail(email) {
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return regex.test(email);
}

const AutoCompleteField = forwardRef(({selected, setSelected, options, readOnly, requestAdditionalParams, inputRef}) => {
  const [currentSearch, setCurrentSearch] = useState("")

  const isEmail = isValidEmail(currentSearch) ? "" : "!"

  const renderOptions = currentSearch.length == 0 || options.includes(currentSearch) 
    ? options : [
      {
        helper: "(Email Address: )", 
        label: currentSearch, 
        value: `${isEmail}email:${currentSearch}` 
      }, 
      ...options
    ]

  const filteredOptions = renderOptions.filter((o) => !selected.map( s => s.value ).includes( o.value ))

  useEffect(() => {
    setSelected(selected)
  }, [])

  const paramsRender = (params, schema) => {
    if (!params) {
      return []
    }

    let content = Object.keys(params).map(k => {
      return `${schema[k].label} (${params[k].length} selected)`
    }).join("\n")
    return [
      content,
      "Additional Details"
    ]
  }

  const tagRender = (props) => {
    
    const {label, value, closable, onClose} = props
    const onPreventMouseDown = (event) => {
      event.preventDefault();
      event.stopPropagation();
    };

    const paramSchema = options.find(o => o.value == value).parameters
    const params = selected.find(o => o.value == value).parameters
    
    // console.log("paramschema: ", paramSchema)
    // console.log("params: ", params)
    const [content, title] = paramsRender(params, paramSchema)

    return <Tag
      color={value.substring(0, 3) == "!em" ? "red" : ""}
      onMouseDown={onPreventMouseDown}
      closable={closable}
      onClose={onClose}
      style={{ marginRight: 3, cursor: "default" }}
    >
      <Popover content={content} title={title}>
        {label}{params && "*"}
      </Popover>
    </Tag> 
  }

  const handleSelect = (option) => {
    let newSelected = options.find(o => o.value == option.value);
    if (newSelected?.parameters) {
      requestAdditionalParams(newSelected.value);
    } 
    setCurrentSearch("");
  }


  return <>
    <Select
      labelInValue
      mode="multiple"
      allowClear
      style={{ width: '100%', height:"min-content !important"}}
      placeholder=""
      tagRender={tagRender}
      onSelect={(_) => handleSelect(_)}
      onChange={(_) => setSelected(_)}
      onSearch={setCurrentSearch}
      options={filteredOptions}
      disabled={readOnly}
      value={selected}
      ref={inputRef}
    />
    {selected.map(o => o.value.substring(0, 3)).includes("!em") && <Alert type="error" message="An invalid entry has been detected. Please remove it before saving" />}
  </>
}) // (Forward Ref)

export default AutoCompleteField