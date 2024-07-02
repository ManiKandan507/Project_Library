import { useContext } from "react";
import MultiSelect from "../../components/MultiSelect";
import { useApi } from "../../hooks/useApi";
import DirectoryContext from "../DirectoryContext";

import { generateRandomColor } from "../../helpers";

const MemberGeneral = () => {
  const [loadingGroups, groupMap] = useApi("GROUPS");

  const { editedDirectory, setEditedDirectory } = useContext(DirectoryContext);

  if (loadingGroups) return null;

  let groupIdList = editedDirectory?.groups.length ? editedDirectory?.groups : editedDirectory?.GroupIDLists;

  return (
    <>
      {editedDirectory.groups && (
        <>
          <div>
            <h5 className="form-header">Groups to Include</h5>
            <p className="form-subtitle">
              This defines what contacts get included n the directory
            </p>
          </div>
          <div className="form-field">
            <MultiSelect
              optionMap={[...groupMap.entries()].map(([id, group]) => ({
                id,
                label: group.label,
              }))}
              selectedIds={groupIdList?.map(group => group.id)}
              onChange={groupIds => {
                const newGroups = groupIds.map(id => {
                  return ({
                  id,
                  label: groupMap.get(id).label,
                  color:
                    groupIdList.find(group => group.id === id)
                      ?.color ?? generateRandomColor(),
                })});
                setEditedDirectory(dir => ({ ...dir, groups: newGroups }));
              }}
            />
          </div>
        </>
      )}
    </>
  );
};

export default MemberGeneral;
