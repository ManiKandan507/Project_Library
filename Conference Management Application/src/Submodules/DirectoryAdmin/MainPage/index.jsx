import { useState } from "react";
import { useHistory } from "react-router-dom";
import { useDispatch } from "react-redux";

import moment from "moment";
import { Icon } from "semantic-ui-react";
import { useApi } from "../hooks/useApi";
import "./index.css";

import { Modal, Select } from "semantic-ui-react";

import { requestAddDirectory } from "../store/actions/directory";
import { capitalize } from "../helpers";

const MainPage = () => {
  const [loading, directories] = useApi("DIRECTORIES");
  const history = useHistory();
  const dispatch = useDispatch();

  const [modalOpen, setModalOpen] = useState(false);
  const [newDirectoryType, setNewDirType] = useState("member");
  const [newDirectoryName, setNewDirName] = useState("");
  // const [newDirIsMini, setNewDirIsMini] = useState(false);

  const newDirectory = () => {
    dispatch(
      requestAddDirectory({
        type: newDirectoryType,
        name: newDirectoryName,
        // isMini: newDirIsMini,
      })
    );
    closeModal();
    // setNewDirIsMini(false);
  };

  const closeModal = () => {
    setModalOpen(false);
    setNewDirType("member");
    setNewDirName("");
  };

  const directoryOptions = [
    {
      key: "member",
      text: "Member",
      value: "member",
    },
    {
      key: "company",
      text: "Company",
      value: "company",
    },
  ];

  if (loading) return null;

  return (
    <main>
      <h2 className="header">Manage Directories</h2>
      <p className="subtitle">Listed below are all your active directories.</p>
      <hr
        style={{
          marginTop: "1.5em",
          marginBottom: "2em",
        }}
      />

      <div className="directories-list">
        {directories.map(directory => (
          <div
            onClick={() => history.push(`./directory/${directory.uuid}`)}
            key={directory.id}
            className="directory"
          >
            <h4
              className="pointer header"
              style={{ marginBottom: "0.25em", fontSize: "1.25rem" }}
            >
              {directory.name}
              <span
                className={`${
                  directory.type === "company"
                    ? "bg-primary"
                    : "bg-primary-dark"
                } fg-white font-bold`}
                style={{
                  padding: ".2em .5em",
                  fontSize: "1rem",
                  marginLeft: ".5em",
                  borderRadius: "var(--border-radius)",
                }}
              >
                {capitalize(directory.type)}
              </span>
            </h4>

            <div className="info" style={{ fontSize: "1rem" }}>
              <p className="m-0">Created on:</p>
              <p className="m-0">{moment(directory.dateAdded).format("lll")}</p>
              <p className="m-0">Last updated on:</p>
              <p className="m-0">
                {moment(directory.lastUpdated).format("lll")}
              </p>
            </div>
          </div>
        ))}

        <button
          onClick={() => setModalOpen(true)}
          className="directory-add flex items-center"
        >
          <Icon name="add" style={{ marginInline: "auto 1em" }} />
          <p className="mr-auto mb-0" style={{ fontSize: "1.25rem" }}>
            New Directory
          </p>
        </button>
      </div>

      <hr style={{ margin: "2em 0" }} />
      <div className="directories-list">
        <button
          onClick={() => history.push("./generate")}
          className="directory-add flex items-center"
        >
          <Icon name="folder" style={{ marginInline: "auto 1em" }} />
          <p className="mr-auto mb-0" style={{ fontSize: "1.25rem" }}>
            Group Directory
          </p>
        </button>
      </div>

      <Modal
        onClose={closeModal}
        open={modalOpen}
        size="small"
        style={{ maxHeight: "28rem", margin: "auto" }}
      >
        <Modal.Header style={{ fontSize: "1rem" }}>
          <div className="flex items-center">
            <h3 className="m-0 font-bold">New Directory</h3>
            <button
              className="ml-auto"
              onClick={closeModal}
              style={{ marginLeft: ".5em" }}
            >
              Cancel
            </button>
            <button
              onClick={newDirectory}
              className="primary"
              style={{ marginLeft: ".5em" }}
            >
              Done
            </button>
          </div>
        </Modal.Header>
        <Modal.Content style={{ fontSize: "1rem", padding: "2em 1.5em" }}>
          <section style={{ marginBottom: "1.5em" }}>
            <div>
              <div>
                <h4 className="form-header" style={{ fontSize: "larger" }}>
                  Type
                </h4>
                <p className="form-subtitle">The type of the directory.</p>
              </div>
              <Select
                className="form-field"
                value={newDirectoryType}
                style={{ fontSize: "1.3rem" }}
                placeholder="Select directory type"
                size="large"
                options={directoryOptions}
                onChange={(_, data) => setNewDirType(data.value)}
              />
            </div>
            {/* {newDirectoryType === "member" && (
              <div>
                <div>
                  <h3 className="form-header" style={{ fontSize: "1.5rem" }}>
                    Mini Directory
                  </h3>
                  <p className="form-subtitle" style={{ marginBottom: ".5em" }}>
                    Simplified member directory with one group
                  </p>
                </div>
                <input
                  type="checkbox"
                  className="m-0"
                  checked={newDirIsMini}
                  onChange={e => setNewDirIsMini(e.target.checked)}
                  style={{ width: "1.5em", height: "1.5em" }}
                />
              </div>
            )} */}
          </section>

          <div>
            <h4 className="form-header" style={{ fontSize: "larger" }}>
              Name
            </h4>
            <p className="form-subtitle">For internal use only.</p>
          </div>
          <input
            type="text"
            placeholder="Name"
            value={newDirectoryName}
            onChange={e => setNewDirName(e.target.value)}
          />
        </Modal.Content>
      </Modal>
    </main>
  );
};

export default MainPage;
