import { useContext, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import MultiSelect from "../../components/MultiSelect";
import { useApi } from "../../hooks/useApi";
import DirectoryContext from "../DirectoryContext";

import { generateRandomColor } from "../../helpers";
import { Select } from "semantic-ui-react";
import axios from "axios";

const CompanyFilters = () => {
  const appDir = useSelector(state => state.directory.APP_DIR);
  const [loadingMemberTypes, memberTypesMap] = useApi("MEMBER_TYPES");
  const [loadingTagCategories, tagCategoriesMap] = useApi("TAG_CATEGORIES");
  const [loadingCustomFields, customFields] = useApi("CUSTOM_FIELDS");
  const { editedDirectory, setEditedDirectory } = useContext(DirectoryContext);

  const [fieldValues, setFieldValues] = useState([]);

  useEffect(
    () =>
      (async () => {
        if (editedDirectory.customFieldIdAssert === -1) {
          setFieldValues([]);
          return;
        }
        const { data } = await axios(
          `${process.env.REACT_APP_API_URL}?appdir=${appDir}&module=directory&component=member_directory&function=company_custom_field_values&fieldId=${editedDirectory.customFieldIdAssert}`
        );
        setFieldValues(
          data.values.map(value => ({
            id: value.ValueID,
            label: value.Rowlabel,
          }))
        );
      })(),
    [editedDirectory.customFieldIdAssert]
  );

  if (loadingMemberTypes || loadingTagCategories || loadingCustomFields)
    return null;

  const fieldTypes = ["Dropdown", "Radio", "Check"]; // only show custom fields with these types

  const customFieldOptions = [
    { key: -1, text: "-- All Fields --", value: -1 },
    ...customFields
      .filter(field => fieldTypes.includes(field.type))
      .map(field => ({
        key: field.id,
        text: field.label,
        value: field.id,
      })),
  ];

  const customValueOptions = [
    { key: -1, text: "-- All Values --", value: -1 },
    ...fieldValues.map(value => ({
      key: value.id,
      text: value.label,
      value: value.id,
    })),
  ];

  return (
    <>
      {editedDirectory.memberTypes && (
        <>
          <div>
            <h5 className="form-header">Member Types</h5>
            <p className="form-subtitle">
              Select member types included in the directory.
            </p>
          </div>
          <div className="form-field">
            <MultiSelect
              optionMap={[...memberTypesMap.entries()].map(([id, label]) => ({
                id,
                label,
              }))}
              selectedIds={editedDirectory.memberTypes.map(type => type.id)}
              onChange={memberTypeIds => {
                const newMemberTypes = memberTypeIds.map(id => ({
                  id,
                  label: memberTypesMap.get(id),
                  color:
                    editedDirectory.memberTypes.find(type => type.id === id)
                      ?.color ?? generateRandomColor(),
                }));
                setEditedDirectory(dir => ({
                  ...dir,
                  memberTypes: newMemberTypes,
                }));
              }}
            />
          </div>
        </>
      )}
      {editedDirectory.tagCategoryIds && (
        <>
          <div>
            <h5 className="form-header">System Tag Categories</h5>
            <p className="form-subtitle">
            Select any system tag categories to use as filters. Create new tags as needed.
            </p>
          </div>
          <div className="form-field">
            <MultiSelect
              optionMap={[...tagCategoriesMap.entries()].map(([id, label]) => ({
                id,
                label,
              }))}
              selectedIds={editedDirectory.tagCategoryIds}
              onChange={tagCategoryIds => {
                setEditedDirectory(dir => ({
                  ...dir,
                  tagCategoryIds,
                }));
              }}
            />
          </div>
        </>
      )}

      <div>
        <h5 className="form-header">Optional Directory Visibility</h5>
        <p className="form-subtitle">
          Choose a company profile field that must be set in order to be
          included in the directory.
        </p>
      </div>
      <div className="flex form-field" style={{ gap: "2em" }}>
        <div>
          <h5
            className="form-header"
            style={{ marginBottom: ".5em", fontSize: "1em", marginLeft: "1em" }}
          >
            Field
          </h5>

          <Select
            value={editedDirectory.customFieldIdAssert}
            selection
            style={{ fontSize: "1.3rem" }}
            placeholder="Select custom field"
            size="large"
            options={customFieldOptions}
            scrolling
            onChange={(_, data) => {
              setEditedDirectory(dir => ({
                ...dir,
                customFieldIdAssert: data.value,
                customValueIdAssert: -1, // all values
              }));
            }}
          />
        </div>
        <div>
          <h5
            className="form-header"
            style={{ marginBottom: ".5em", fontSize: "1em", marginLeft: "1em" }}
          >
            Value
          </h5>

          <Select
            value={editedDirectory.customValueIdAssert}
            style={{ fontSize: "1.3rem" }}
            placeholder="Select field value"
            size="large"
            scrolling
            options={customValueOptions}
            onChange={(_, data) => {
              setEditedDirectory(dir => ({
                ...dir,
                customValueIdAssert: data.value,
              }));
            }}
          />
        </div>
      </div>
    </>
  );
};

export default CompanyFilters;
