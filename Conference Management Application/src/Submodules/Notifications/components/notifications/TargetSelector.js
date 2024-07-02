import React, { useEffect } from "react";
import "./Notification.css";

export default ({
  itineraries,
  groups,
  notificationTarget,
  setNotificationTargetValues,
  notificationTargetValues
}) => {
  //if (!itineraries) return null;
  useEffect(() => {}, [notificationTarget]);

  const options = Object.keys(notificationTarget=='app_users_by_group'?groups:itineraries).map((key) => (
    <option key={key} value={key} selected={notificationTargetValues.includes(key)?true:false}>{notificationTarget=='app_users_by_group'?groups[key]:itineraries[key]}</option>
  ));

  return (
    <div className="mt-10 mb-10">
        <select 
          className="form-control targetList"
          key={notificationTarget}
          id="sel1" multiple 
          onChange={e => setNotificationTargetValues([].slice.call(e.target.selectedOptions).map(item => item.value))}
        >
        {options}
        </select>
    </div>
  );
};
