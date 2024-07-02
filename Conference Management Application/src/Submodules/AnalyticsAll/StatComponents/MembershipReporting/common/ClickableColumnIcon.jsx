import React from "react";
import { ReactComponent as OpenInNewIcon } from "@/AnalyticsAll/NativeDashboards/MembershipReporting/assets/icons/OpenInNew.svg";

const clickableColumnHeader = (columnHeader, classname) =>{
    return <div>
        {columnHeader} <OpenInNewIcon className={`${classname} primary-color`} />
    </div>
}
export default clickableColumnHeader;