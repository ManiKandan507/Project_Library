import { useContext } from "react";
import ColorDisplay from "../../components/ColorDisplay";
import DirectoryContext from "../DirectoryContext";
// import { useApi } from "../../hooks/useApi";

const MemberColors = () => {
  const { editedDirectory, setEditedDirectory } = useContext(DirectoryContext);
  // const [loadingGroups, groupMap] = useApi("GROUPS");

  // if (loadingGroups) return null;

  return (
    <>
      {/* <div>
        <h5 className="form-header">Groups</h5>
        <p className="form-subtitle">Colors for each group.</p>
      </div>
      <div className="group-colors form-field" style={{ gap: "2em" }}>
        {editedDirectory.groups.map((group, index) => (
          <ColorDisplay
            key={group.id}
            label={groupMap.get(group.id).label}
            value={group.color}
            onChange={color => {
              const groupsCopy = [...editedDirectory.groups];
              groupsCopy[index].color = color;
              setEditedDirectory(dir => ({ ...dir, groups: groupsCopy }));
            }}
          />
        ))}
      </div> */}
      {/* <div>
        <h5 className="form-header">Ribbons</h5>
        <p className="form-subtitle">Colors for each ribbon.</p>
      </div>
      <div className="group-colors form-field" style={{ gap: "2em" }}>
        {editedDirectory.ribbons.map((ribbon, index) => (
          <ColorDisplay
            key={index}
            label={ribbon.label}
            value={ribbon.color}
            onChange={color => {
              const ribbonsCopy = [...editedDirectory.ribbons];
              ribbonsCopy[index].color = color;
              setEditedDirectory(dir => ({ ...dir, ribbons: ribbonsCopy }));
            }}
          />
        ))}
      </div> */}
    </>
  );
};

export default MemberColors;
