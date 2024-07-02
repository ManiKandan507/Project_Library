import { useContext } from "react";
import DirectoryContext from "../DirectoryContext";

import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import MemberGeneral from "./MemberGeneral";

const GeneralSection = () => {
  const { editedDirectory, setEditedDirectory } = useContext(DirectoryContext);

  return (
    <form action="" className="directory-form">
      <div>
        <h5 className="form-header">Name</h5>
        <p className="form-subtitle">For internal use only.</p>
      </div>
      <input
        className="form-field"
        type="text"
        placeholder="Name"
        value={editedDirectory.name ?? ""}
        onChange={e =>
          setEditedDirectory(dir => ({ ...dir, name: e.target.value }))
        }
      />

      <div>
        <h5 className="form-header">Description</h5>
        <p className="form-subtitle">
          Will appear only in X-CD hosted version.
        </p>
      </div>

      <div className="form-field">
        <ReactQuill
          placeholder="Description"
          // className="form-field"
          theme="snow"
          modules={{
            clipboard: {
              matchVisual: false,
            },
          }}
          value={editedDirectory.description}
          onChange={value =>
            setEditedDirectory(dir => ({ ...dir, description: value }))
          }
        />
      </div>

      {editedDirectory.type === "member" && <MemberGeneral />}
    </form>
  );
};

export default GeneralSection;
