import { useContext } from "react";
import DirectoryContext from "../DirectoryContext";
import MemberFilters from "./MemberFilters";
import CompanyFilters from "./CompanyFilters";
import FilterRegion from "../FilterRegion";

import "./index.css";
import OptionalFilter from "./OptionalFilter";

const FiltersSection = () => {
  const { editedDirectory, setEditedDirectory } = useContext(DirectoryContext);

  const options = [
    { key: 'yes', value: 'yes', text: 'Yes' },
    { key: 'no', value: 'no', text: 'No' }
  ];

  const onChange = ({ value }, key, fieldKey) => {
    setEditedDirectory((prev) => {
      if (fieldKey === "coreFilter") {
        return { ...prev, coreFilter: { ...prev.coreFilter, [key]: value === 'yes' ? true : false } }
      }
      else {
        return { ...prev, regionFilter: { ...prev.regionFilter, [key]: value === 'yes' ? true : false } }
      }
    })
  }

  const onChangeInput = ({ target: { value } }, key, fieldKey) => {
    setEditedDirectory((prev) => {
      if (fieldKey === "coreFilter") {
        return { ...prev, coreFilter: { ...prev.coreFilter, [key]: value } }
      }
      else { 
        return { ...prev, regionFilter: { ...prev.regionFilter, [key]: value } }
      }
    })
  }

  return (
    <>
      <form action="" className="directory-form">
        {editedDirectory.type === "member" &&<>
        <OptionalFilter/>
        <MemberFilters />
        </>
        }
        {editedDirectory.type === "company" && <CompanyFilters />}
      </form>
      <FilterRegion
        options={options}
        onChange={onChange}
        editedDirectory={editedDirectory}
        onChangeInput={onChangeInput}
      />
    </>
  );
};

export default FiltersSection;