import { useContext } from "react";
import { useApi } from "../../hooks/useApi";

import DirectoryContext from "../DirectoryContext";
import MultiSelect from "../../components/MultiSelect";

import "./index.css";

const TogglesSection = () => {
  const { editedDirectory, setEditedDirectory } = useContext(DirectoryContext);
  const [loadingGroups, groupMap] = useApi("GROUPS");

  if (loadingGroups) return null;

  return (
    <form action="" className="toggles-form">
      <input
        type="checkbox"
        className=""
        checked={editedDirectory.validExpiryRequired}
        onChange={e =>
          setEditedDirectory(dir => ({
            ...dir,
            validExpiryRequired: e.target.checked,
          }))
        }
      />
      <div>
        <h5 className="form-header">Only Display Current Members</h5>
        <p className="form-subtitle m-0">
          Members who are expired will not display.
        </p>
      </div>

      {editedDirectory.type === "company" && (
        <>
          <input
            type="checkbox"
            checked={editedDirectory.showMemberType}
            onChange={e =>
              setEditedDirectory(dir => ({
                ...dir,
                showMemberType: e.target.checked,
              }))
            }
          />
          <div>
            <h5 className="form-header">Display Member Type</h5>
            <p className="form-subtitle m-0">
              This will display member levels within the directory.
            </p>
          </div>
        </>
      )}

      {editedDirectory.type === "company" && (
        <>
          <input
            type="checkbox"
            checked={editedDirectory.showMedia}
            onChange={e =>
              setEditedDirectory(dir => ({
                ...dir,
                showMedia: e.target.checked,
              }))
            }
          />
          <div>
            <h5 className="form-header">Show Company Resources</h5>
            <p className="form-subtitle m-0">
              Choose to display a company's media resources.
            </p>
          </div>
        </>
      )}

      {editedDirectory.type === "member" && (
        <>
          <input
            type="checkbox"
            checked={editedDirectory.publicAccess}
            onChange={e =>
              setEditedDirectory(dir => ({
                ...dir,
                publicAccess: e.target.checked,
              }))
            }
          />
          <div>
            <h5 className="form-header">Public Directory</h5>
            <p className="form-subtitle m-0">
              If selected, no login will be required to view directory.
            </p>
          </div>

          {!editedDirectory.publicAccess && (
            <div style={{ gridColumn: "4 / 5" }}>
              <div style={{ marginBottom: ".5em" }}>
                <h5 className="form-header">Private Groups with Access</h5>
                <p className="form-subtitle">
                  Groups allowed to access the directory.
                </p>
              </div>
              <MultiSelect
                optionMap={[...groupMap.entries()].map(([id, group]) => ({
                  id,
                  label: group.label,
                }))}
                selectedIds={editedDirectory.publicAccessGroupIds}
                onChange={groupIds => {
                  setEditedDirectory(dir => ({
                    ...dir,
                    publicAccessGroupIds: groupIds,
                  }));
                }}
              />
            </div>
          )}
        </>
      )}
      <>
      <input
            type="checkbox"
            checked={editedDirectory.horizontalCarousel}
            onChange={e =>
              setEditedDirectory(dir => ({
                ...dir,
                horizontalCarousel: e.target.checked,
              }))
            }
          />
          <div>
            <h5 className="form-header">Horizontal Carousel</h5>
            <p className="form-subtitle m-0">
              Mini view with scrolling - no filtering.
            </p>
          </div>
      </>
    </form>
  );
};

export default TogglesSection;
