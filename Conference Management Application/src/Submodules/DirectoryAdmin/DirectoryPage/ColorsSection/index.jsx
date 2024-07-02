import { useContext } from "react";
import ColorDisplay from "../../components/ColorDisplay";
import DirectoryContext from "../DirectoryContext";

import MemberColors from "./MemberColors";
import CompanyColors from "./CompanyColors";

import "./index.css";

const ColorsSection = () => {
  const { editedDirectory, setEditedDirectory } = useContext(DirectoryContext);

  return (
    <form action="" className="directory-form">
      <div>
        <h5 className="form-header">Site Theme</h5>
        <p className="form-subtitle">Colors for the directory site.</p>
      </div>

      <div className="group-colors form-field">
        <ColorDisplay
          label="Light"
          value={editedDirectory.themeColor.light}
          onChange={light =>
            setEditedDirectory(dir => ({
              ...dir,
              themeColor: { ...dir.themeColor, light },
            }))
          }
        />
        <ColorDisplay
          label="Primary"
          value={editedDirectory.themeColor.primary}
          onChange={primary =>
            setEditedDirectory(dir => ({
              ...dir,
              themeColor: { ...dir.themeColor, primary },
            }))
          }
        />
        <ColorDisplay
          label="Dark"
          value={editedDirectory.themeColor.dark}
          onChange={dark =>
            setEditedDirectory(dir => ({
              ...dir,
              themeColor: { ...dir.themeColor, dark },
            }))
          }
        />
      </div>

      {editedDirectory.type === "member" && <MemberColors />}
      {editedDirectory.type === "company" && <CompanyColors />}
    </form>
  );
};

export default ColorsSection;
