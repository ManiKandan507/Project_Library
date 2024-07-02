import React from "react";
import { useDispatch } from "react-redux";
import { Tabs } from "antd";

import { requestMenuChange, showModal } from "../../appRedux/actions/Reporting";

const HorizontalMenu = () => {
   const dispatch = useDispatch();
   const { TabPane } = Tabs;

   const tabItems = [
      {
         screen: "currentmembers",
         screenName: "Current Members",
      },
      {
         screen: "expiredmembers",
         screenName: "Expired Members",
      },
      {
         screen: "newmembers",
         screenName: "New Members",
      },
      {
         screen: "renewingmembers",
         screenName: "Renewing Members",
      },
      {
         screen: "transition",
         screenName: "Transition",
      },
      {
         screen: "salesactivity",
         screenName: "Sales Activity",
      },
      {
         screen: "location",
         screenName: "Location",
      },
      // {
      //    screen: "trend",
      //    screenName: "Trend",
      // },
      
   ]
   const tabChange = (screen) => {
      dispatch(
         requestMenuChange({
            screen,
         })
      );
      dispatch(showModal(false))
   };
   return (
      <Tabs defaultActiveKey="currentmembers" onChange={tabChange}>
         {tabItems.map(tab => {
            return (<TabPane tab={tab.screenName} key={tab.screen}></TabPane>)
         })}
      </Tabs>
   )
}

export default HorizontalMenu