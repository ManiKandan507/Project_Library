import { useState, useContext } from "react";
import MultiSelect from "../../components/MultiSelect";
import { useApi } from "../../hooks/useApi";
import DirectoryContext from "../DirectoryContext";

import { Modal, Select } from "semantic-ui-react";
import { generateRandomColor } from "../../helpers";
import ConfirmDialog from "../../components/ConfirmDialog";

const MemberRibbons = () => {
  const [loadingGroups, groupMap] = useApi("GROUPS");
  const [ribbonIndex, setRibbonIndex] = useState(-1);
  const [confirm, setConfirm] = useState({});

  const { editedDirectory, setEditedDirectory } = useContext(DirectoryContext);

  if (loadingGroups) return null;

  return (
    <>
      {editedDirectory.ribbons && (
        <>
          <div>
            <h5 className="form-header">Ribbons</h5>
            <p className="form-subtitle">
              Secondary filters to organize the directory.
            </p>
          </div>
          <div className="form-field">
            <ul className="multi-select">
              {editedDirectory.ribbons.map((ribbon, index) => (
                <li
                  key={index}
                  onClick={() => setRibbonIndex(index)}
                  style={{
                    background: ribbon.color
                      ? "var(--clr-primary)"
                      : "lightgray",
                    color: ribbon.color ? "white" : "gray",
                  }}
                >
                  {ribbon.label}

                  <i
                    className="edit outline icon"
                    style={{ marginLeft: ".5em" }}
                  ></i>
                </li>
              ))}
              <p
                onClick={() => {
                  const newRibbon = {
                    label: "",
                    color: generateRandomColor(),
                    groupIds: [],
                  };
                  setRibbonIndex(editedDirectory.ribbons.length);
                  setEditedDirectory(dir => ({
                    ...dir,
                    ribbons: [...dir.ribbons, newRibbon],
                  }));
                }}
                className="add-ribbon"
              >
                Add Ribbon +
              </p>
            </ul>
          </div>
        </>
      )}

      <Modal
        onClose={() => setRibbonIndex(-1)}
        open={ribbonIndex > -1}
        size="small"
        style={{ maxHeight: "45rem", margin: "auto" }}
      >
        <Modal.Header style={{ fontSize: "1rem" }}>
          <div className="flex items-center">
            <h3 className="m-0">Edit Ribbon</h3>
            <button
              onClick={() => {
                setConfirm({
                  prompt: "Are you sure you want to remove this ribbon?",
                  onConfirm: () => {
                    const ribbonsCopy = [...editedDirectory.ribbons];
                    ribbonsCopy.splice(ribbonIndex, 1);
                    setEditedDirectory(dir => ({
                      ...dir,
                      ribbons: ribbonsCopy,
                    }));
                    setRibbonIndex(-1);
                    setConfirm({});
                  },
                });
              }}
              className="ml-auto"
            >
              <i className="trash icon"></i>
            </button>
            <button
              onClick={() => setRibbonIndex(-1)}
              className="primary"
              style={{ marginLeft: "1em" }}
            >
              Done
            </button>
          </div>
        </Modal.Header>

        <Modal.Content style={{ fontSize: "1rem" }}>
          <div>
            <h3 className="form-header" style={{ fontSize: "larger" }}>
              Name
            </h3>
            <p className="form-subtitle" style={{ marginBottom: "1em" }}>
              Give a suitable name for this ribbon.
            </p>
          </div>
          <input
            type="text"
            placeholder="Name"
            style={{ marginBottom: "1.7em" }}
            value={editedDirectory.ribbons[ribbonIndex]?.label}
            onChange={e => {
              const ribbonsCopy = [...editedDirectory.ribbons];
              ribbonsCopy[ribbonIndex].label = e.target.value;
              setEditedDirectory(dir => ({ ...dir, ribbons: ribbonsCopy }));
            }}
          />

          <div>
            <h5 className="form-header" style={{ fontSize: "larger" }}>
              Groups
            </h5>
            <p className="form-subtitle" style={{ marginBottom: "1em" }}>
              Choose the groups to be in this ribbon.
            </p>
          </div>
          <MultiSelect
            optionMap={[...groupMap.entries()].map(([id, group]) => ({
              id,
              label: group.label,
            }))}
            selectedIds={editedDirectory.ribbons[ribbonIndex]?.groupIds}
            onChange={groupIds => {
              const ribbonsCopy = [...editedDirectory.ribbons];
              ribbonsCopy[ribbonIndex].groupIds = groupIds;
              setEditedDirectory(dir => ({ ...dir, ribbons: ribbonsCopy }));
            }}
          />
        </Modal.Content>
      </Modal>

      {confirm.prompt && (
        <ConfirmDialog
          prompt={confirm.prompt}
          onConfirm={confirm.onConfirm}
          onCancel={() => setConfirm({ prompt: "" })}
        />
      )}
    </>
  );
};

export default MemberRibbons;
