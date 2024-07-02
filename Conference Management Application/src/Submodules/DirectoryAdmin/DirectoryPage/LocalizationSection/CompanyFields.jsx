import { useContext } from "react";
import DirectoryContext from "../DirectoryContext";
import { useApi } from "../../hooks/useApi";
import OrderedMultiSelect from "../../components/OrderedMultiSelect";
import MultiSelect from "../../components/MultiSelect";

const CompanyFields = () => {
  const { editedDirectory, setEditedDirectory } = useContext(DirectoryContext);
  const [loadingCustomFields, customFields] = useApi("CUSTOM_FIELDS");

  if (loadingCustomFields) return null;

  const customFieldTypeMap = new Map(
    customFields.map(field => [field.contentType, field.label])
  );

  return (
    <>
      <div>
        <h5 className="form-header">Custom Field Output</h5>
        <p className="form-subtitle">
          Select additional profile fields to display.
        </p>
      </div>

      <div className="form-field">
        <OrderedMultiSelect
          optionMap={customFieldTypeMap}
          selectedIds={editedDirectory.customFieldTypes}
          onChange={customFieldTypes =>
            setEditedDirectory(dir => ({
              ...dir,
              customFieldTypes,
            }))
          }
        />
      </div>

      <div>
        <h5 className="form-header">Show Fields</h5>
        <p className="form-subtitle">
          Display fields on the company details modal.
        </p>
      </div>
      <div className="form-field">
        <MultiSelect
          optionMap={[
            { id: "show_phone", label: "Phone" },
          ]}
          selectedIds={
            editedDirectory?.config
              ? Object.keys(editedDirectory?.config).map(id =>
                  editedDirectory?.config[id] ? id : false
                )
              : []
          }
          onChange={ids => {
            const selections = {
              ...editedDirectory.config,
              show_phone: false,
            };
            ids.forEach(element => {
              selections[element] = true;
            });

            setEditedDirectory(dir => ({
              ...dir,
              config: {
                ...selections,
              },
            }));
          }}
        />
      </div>
    </>
  );
};

export default CompanyFields;
