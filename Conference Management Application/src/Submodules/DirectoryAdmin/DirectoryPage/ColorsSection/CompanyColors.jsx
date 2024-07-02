import { useContext } from "react";
import ColorDisplay from "../../components/ColorDisplay";
import { useApi } from "../../hooks/useApi";
import DirectoryContext from "../DirectoryContext";

const CompanyColors = () => {
  const [loadingMemberTypes, memberTypesMap] = useApi("MEMBER_TYPES");
  const { editedDirectory, setEditedDirectory } = useContext(DirectoryContext);

  if (loadingMemberTypes) return null;

  return (
    <>
      <div>
        <h5 className="form-header">Member Types</h5>
        <p className="form-subtitle">Colors for each member type.</p>
      </div>
      <div className="group-colors form-field">
        {editedDirectory.memberTypes.map((memberType, index) => (
          <ColorDisplay
            key={memberType.id}
            label={memberTypesMap.get(memberType.id)}
            value={memberType.color}
            onChange={color => {
              const memberTypesCopy = [...editedDirectory.memberTypes];
              memberTypesCopy[index].color = color;
              setEditedDirectory(dir => ({
                ...dir,
                memberTypes: memberTypesCopy,
              }));
            }}
          />
        ))}
      </div>
    </>
  );
};

export default CompanyColors;
