import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Tabs } from "antd";
import _map from 'lodash/map';

import { requestMenuChange } from "../../appRedux/actions/Reporting";
import { tabItems } from "./Utils";

const SideTabMenu = ({ primary_color }) => {
   const dispatch = useDispatch();
   const { TabPane } = Tabs;
   const activeReport = useSelector((state) => state.reporting.activeReport);

   const tabChange = (screen) => {
      dispatch(
         requestMenuChange({
            screen,
         })
      );
   };

   return (
      <div className="sideBarTabs">
         <Tabs
            defaultActiveKey="home"
            onChange={tabChange}
            activeKey={activeReport}
            size="small"
         >
            {_map(tabItems, (tab) => {
               console.log("tab",tab);
               const {IconMenu} = tab
            return (
               <TabPane
                  tab={<><IconMenu width="1rem" /><span className="tab-head">{tab.screenName}</span></>}
                  key={tab.screen}
               >
               </TabPane>
            )})}
         </Tabs>
      </div>
   )
}

export default SideTabMenu;