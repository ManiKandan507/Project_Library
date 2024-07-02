import { useContext } from "react";
import DirectoryContext from "../DirectoryContext";

import MemberFields from "./MemberFields";
import CompanyFields from "./CompanyFields";

const LocalizationSection = () => {
  const { editedDirectory } = useContext(DirectoryContext);

  return (
    <form action="" className="directory-form">
      {editedDirectory.type === "member" && <MemberFields />}
      {editedDirectory.type === "company" && <CompanyFields />}
    </form>
  );
};

export default LocalizationSection;
