import { useContext, useEffect } from "react";
import { useApi } from "../../hooks/useApi";
import DirectoryContext from "../DirectoryContext";
import { Dropdown, Select } from "semantic-ui-react";
import _groupBy from 'lodash/groupBy';
const { v4: uuidv4 } = require("uuid");

const OptionalFilter = () => {
  const { editedDirectory, setEditedDirectory } = useContext(DirectoryContext);
  const [loadingCustomFields, customFieldData] = useApi("CUSTOM_FIELDS_DATA");// field data

  useEffect(() => {
    if(editedDirectory.optional_directory_visibility_local.length > 0){
      let updatedDirectory = editedDirectory.optional_directory_visibility_local.map((value) => {
        return{
          ...value,
          id: uuidv4()
        }
      })
      setEditedDirectory(dir => ({
        ...dir,
        optional_directory_visibility_local:[
            ...updatedDirectory
        ]
      }))
    }
  },[customFieldData])

  if (loadingCustomFields)
  return null;

  const renderField = (field, index) => {
    let options = customFieldData.map((option, index) => {
      return { key: index, value: option.FieldContentType, text: option.Fieldlabel }
    })
    // remove duplicte option bsed FieldContentType
    options = options.filter((value, index, self) =>
      index === self.findIndex((t) => (
        t.value === value.value
      ))
    )
    return <div>
      <h5
        className="form-header"
        style={{ marginBottom: ".5em", fontSize: "1em", marginLeft: "1em" }}
      >
        Field
      </h5>
        <Select
          options={options}
          selection
          value={field?.field_content_type}
          className="select_ellip"
          style={{ fontSize: "1.3rem", width: '100px' }}
          placeholder="Select custom field"
          size="large"
          scrolling
          onChange={(_, data) => {
            let updatedDirectory = editedDirectory.optional_directory_visibility_local.map((val) => {
              if(val.id === field.id){
                  val.field_content_type = data.value
              } 
              return val;
            })
            setEditedDirectory(dir => ({
              ...dir,
              optional_directory_visibility_local:[
                  ...updatedDirectory
              ]
            }))
          }}
        />
    </div>
  }

  const renderValue = (field) => {

    if(!field.field_content_type){
      return null
    }

    let options = _groupBy(customFieldData, 'FieldContentType')

    let isValueExist;

    options = options[field.field_content_type].map((value, index) => {
      if(value?.ValueID){
        isValueExist = true
        return(
          {key: index, value: value.ValueID, text: value.rowvalue}
        )
      }else{
        isValueExist = false
        return(
          {key: '', value: '', text: ''}
        ) 
      }
    })
    
    return (
    <>
    {isValueExist === true && <div>
      <h5
        className="form-header"
        style={{ marginBottom: ".5em", fontSize: "1em", marginLeft: "1em" }}
      >
        Value
      </h5>
      <Dropdown
        selection
        style={{ fontSize: "1.3rem" }}
        value={field?.values}
        placeholder="Select field value"
        scrolling
        multiple
        options={options}
        onChange={(_,data) =>{
          let updatedDirectory = editedDirectory.optional_directory_visibility_local.map((val) => {
            if(val.id === field.id){
                val.values = data.value
            } 
            return val;
          })
          setEditedDirectory(dir => ({
            ...dir,
            optional_directory_visibility_local:[
                ...updatedDirectory
            ]
          }))
        }}
      />
    </div>}
    </>
    )
  }

  const renderClose = (field) => {
    return <button
        onClick={e => {
          e.preventDefault();
          setEditedDirectory(dir => ({
            ...dir,
            optional_directory_visibility_local: dir.optional_directory_visibility_local.filter(({id}) => id !== field.id)
          }));
        }}
        className="card-line-remove ml-auto"
      >
        <i className="times icon" style={{ fontSize: ".75rem" }}></i>
      </button>
  }


  const addNewFieldSection = () => {
      setEditedDirectory(dir => ({
        ...dir,
        optional_directory_visibility_local: 
            [
              ...dir.optional_directory_visibility_local,
              { id: uuidv4(), field_content_type: "", values: [] }
            ] 
      }));
  }

  const renderAddNewField = () => {
    return <button onClick={e => {
          e.preventDefault();
          addNewFieldSection();
        }} className="card-line-add">
        Add New field  +
      </button>
  }

  return (
    <>
      <div>
        <h5 className="form-header">Optional Directory Visibility</h5>
        <p className="form-subtitle">
          Choose a profile field that must be set in order to be
          included in the directory.
        </p>
      </div>
      <div className="form-field">
        {editedDirectory.optional_directory_visibility_local.map((field, index) => {
          return <div style={{ marginBottom: "1.5em" }} key={index}>
            <div className="flex dropdown-width" style={{ alignItems: "flex-start" }}>
              <div className="flex form-field" style={{ gap: "3em" }}>
                {renderField(field, index)}
                {renderValue(field, index)}
              </div>
                {renderClose(field, index)}
            </div>
          </div>
        })}
        {renderAddNewField()}
      </div>
    </>
  );
};
export default OptionalFilter;
