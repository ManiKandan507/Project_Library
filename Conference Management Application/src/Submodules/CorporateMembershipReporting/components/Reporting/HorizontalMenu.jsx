import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { Tabs } from "antd";
import { requestMenuChange, showModal } from "../../appRedux/actions/Reporting";
import { CURRENT_MEMBERS_SCREEN, EXPIRED_MEMBERS_SCREEN, NEW_MEMBERS_SCREEN, RENEWING_MEMBERS_SCREEN, SALES_ACTIVITY_SCREEN, LOCATION_REPORT_SCREEN, TREND_SCREEN } from "../../constants";

const { TabPane } = Tabs;
const tabItems = [
   { screen: CURRENT_MEMBERS_SCREEN, screenName: "Current Members", },
   { screen: EXPIRED_MEMBERS_SCREEN, screenName: "Expired Members", },
   { screen: NEW_MEMBERS_SCREEN, screenName: "New Members", },
   { screen: RENEWING_MEMBERS_SCREEN, screenName: "Renewing Members", },
   { screen: SALES_ACTIVITY_SCREEN, screenName: "Sales Activity", },
   { screen: LOCATION_REPORT_SCREEN, screenName: "Location", },
   { screen: TREND_SCREEN, screenName: "Trend", },
];

const HorizontalMenu = ({ activeReport }) => {
   const dispatch = useDispatch();
   const [activeTab, setActiveTab] = useState(activeReport);
   const tabChange = (screen) => {
      setActiveTab(screen);
      dispatch(requestMenuChange({ screen }));
      dispatch(showModal(false))
   };
   return (
      <Tabs defaultActiveKey={CURRENT_MEMBERS_SCREEN} onChange={tabChange} activeKey={activeTab}>
         {tabItems.map(tab => <TabPane tab={tab.screenName} key={tab.screen}></TabPane>)}
      </Tabs>
   )
}

export default HorizontalMenu