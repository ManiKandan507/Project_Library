import { useContext, useEffect, useState } from "react";
import MultiSelect from "../../components/MultiSelect";
import { useApi } from "../../hooks/useApi";

import DirectoryContext from "../DirectoryContext";

import OrderedMultiSelect from "../../components/OrderedMultiSelect";
import MemberRibbons from "./MemberRibbons";

const MemberFields = () => {
  const [loadingGroups, groupMap] = useApi("GROUPS");
  const [loadingCustomFields, customFields = []] = useApi("CUSTOM_FIELDS_DATA");

  const { editedDirectory, setEditedDirectory } = useContext(DirectoryContext);

  const customPopupField = editedDirectory.card.body.map((val) => {
    return val
  }).flat(1)
  
  useEffect(()=>{
    if(editedDirectory?.hide_config?.enabled === true){
      setEditedDirectory(dir => {
        return ({
          ...dir,
          hide_fields:['join_date']
        })
      });
    } else {
      let filteredDatas = editedDirectory?.hide_fields?.filter(data => data !== 'join_date'); 
      setEditedDirectory(dir => {
        return ({
          ...dir,
          hide_fields:filteredDatas
        })
      });
    }
  },[editedDirectory?.hide_config?.enabled])

  useEffect(()=>{
    const popUpField = editedDirectory?.card?.popup
    if(!popUpField?.length){
      setEditedDirectory(dir => {
        return {
          ...dir,
          card: { ...dir.card, popup: customPopupField },
        }
      })
    }
  },[])

  const optionMap = new Map([
    Array(2).fill("Prefix"),
    Array(2).fill("Firstname"),
    Array(2).fill("MiddleInitial"),
    Array(2).fill("Lastname"),
    Array(2).fill("Degrees"),
    Array(2).fill("Company"),
    Array(2).fill("City"),
    Array(2).fill("State"),
    Array(2).fill("Country"),
    Array(2).fill("Designation")
  ]);

  const customFieldsMap = new Map([...optionMap]);
  new Set([...customFields]).forEach((item) => {
    customFieldsMap.set(item.FieldContentType, item.Fieldlabel)
  });

  if (loadingGroups) return null;
  if (loadingCustomFields) return null;

  return (
    <>
      <div>
        <h5 className="form-header">Directory Name Format</h5>
        <p className="form-subtitle">
          Select the contact profile fields that form the name of the user.
        </p>
      </div>

      <div className="form-field">
        <OrderedMultiSelect
          optionMap={optionMap}
          selectedIds={editedDirectory.card.header}
          onChange={header =>
            setEditedDirectory(dir => ({
              ...dir,
              card: { ...dir.card, header },
            }))
          }
        />
      </div>

      <div>
        <h5 className="form-header">Additional Info on Member Card</h5>
        <p className="form-subtitle">
          Select other contact profile fields that appear below the name on the directory card.
        </p>
      </div>
      <div className="form-field">
        <ol
          style={{
            paddingLeft: "2em",
          }}
        >
          {editedDirectory.card.body.map((line, index) => (
            <li
              key={index}
              style={{ paddingLeft: "1em", marginBottom: "1.5em" }}
            >
              <div className="flex" style={{ alignItems: "flex-start" }}>
                <OrderedMultiSelect
                  optionMap={customFieldsMap}
                  selectedIds={line}
                  onChange={ids =>
                    setEditedDirectory(dir => {
                      const linesCpy = [...dir.card.body];
                      linesCpy[index] = ids;
                      return {
                        ...dir,
                        card: { ...dir.card, body: linesCpy },
                      };
                    })
                  }
                />
                <button
                  onClick={e => {
                    e.preventDefault(); // fix reload issue
                    setEditedDirectory(dir => ({
                      ...dir,
                      card: {
                        ...dir.card,
                        body: dir.card.body.filter(l => l !== line),
                      },
                    }));
                  }}
                  className="card-line-remove ml-auto"
                >
                  <i className="times icon" style={{ fontSize: ".75rem" }}></i>
                </button>
              </div>
            </li>
          ))}
        </ol>
        <button
          onClick={e => {
            e.preventDefault(); // fix reload issue
            setEditedDirectory(dir => ({
              ...dir,
              card: {
                ...dir.card,
                body: [...dir.card.body, []],
              },
            }));
          }}
          className="card-line-add"
        >
          Add Card Line +
        </button>
      </div>

      <div>
        <h5 className="form-header">Additional Fields in Pop Up</h5>
        <p className="form-subtitle">
          Select contact profile fields that appear after clicking on a user.
        </p>
      </div>
      <div className="form-field">
          <OrderedMultiSelect
            optionMap={customFieldsMap}
            selectedIds={editedDirectory.card.popup ? editedDirectory.card.popup : customPopupField }
            onChange={fields =>
              setEditedDirectory(dir => {
                return {
                  ...dir,
                  card: { ...dir.card, popup: fields },
                }
              })
            }
          />
      </div>

      <MemberRibbons />

      <div>
        <h5 className="form-header">Allow User Messaging</h5>
        <p className="form-subtitle m-0">
          Shows a form to send a message to member.
        </p>
      </div>
      <input
        type="checkbox"
        className=""
        checked={editedDirectory?.messaging_config?.enabled ?? false}
        onChange={e => {
          setEditedDirectory(dir => ({
            ...dir,
            messaging_config: {
              ...dir.messaging_config,
              enabled: e.target.checked,
            },
          }));
        }}
      />

      <div>
        <h5 className="form-header">Hide Joined Date</h5>
        <p className="form-subtitle m-0">
         Hide the joining date from the member details modal.
        </p>
      </div>
      <input
        type="checkbox"
        className=""
        checked={editedDirectory?.hide_config?.enabled ?? false}
        onChange={e => {
          setEditedDirectory(dir => {
            return ({
              ...dir,
              hide_config: {
                ...dir.hide_config,
                enabled: e.target.checked,
              },
            })
          });
        }}
      />

      <div>
        <h5 className="form-header">Show Fields</h5>
        <p className="form-subtitle">
          Display fields on the user details modal.
        </p>
      </div>
      <div className="form-field">
        <MultiSelect
          optionMap={[
            { id: "show_email", label: "Email" },
            { id: "show_phone", label: "Phone" },
          ]}
          selectedIds={
            editedDirectory?.contact_config
              ? Object.keys(editedDirectory?.contact_config).map(id =>
                editedDirectory?.contact_config[id] ? id : false
              )
              : []
          }
          onChange={ids => {
            const selections = {
              ...editedDirectory.contact_config,
              show_email: false,
              show_phone: false,
            };
            ids.forEach(element => {
              selections[element] = true;
            });

            setEditedDirectory(dir => ({
              ...dir,
              contact_config: {
                ...selections,
              },
            }));
          }}
        />
      </div>

      <div>
        <h5 className="form-header">Groups in Modal</h5>
        <p className="form-subtitle">
          Groups to show in the popup modal for each user.
        </p>
      </div>
      <div className="form-field">
        <MultiSelect
          optionMap={[...groupMap.entries()].map(([id, group]) => ({
            id,
            label: group.label,
          }))}
          selectedIds={editedDirectory.modalGroups}
          onChange={groupIds => {
            setEditedDirectory(dir => ({ ...dir, modalGroups: groupIds }));
          }}
        />
      </div>
    </>
  );
};

export default MemberFields;
