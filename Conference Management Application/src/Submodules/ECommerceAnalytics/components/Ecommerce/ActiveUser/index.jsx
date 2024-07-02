import React from "react";
import { Tabs } from "antd";

import ActiveUserByMonth from "./ActiveUserByMonth";
import ActiveUserByUsers from "./ActiveUserbyUsers";
import HeaderContainer from "../Common/HeaderContainer";

const { TabPane } = Tabs;

const ActiveUsersTab = ({ appdir, sourceHex }) => {

  return (
    <>
      <HeaderContainer 
        screen='active_user'
        title='Active Users'
      />
      <div style={{ marginTop: '1rem' }}>
        <Tabs type="card" destroyInactiveTabPane={true}>
          <TabPane tab="By Month" key="1">
            <ActiveUserByMonth appdir={appdir} />
          </TabPane>
          <TabPane tab="By Users" key="2">
            <ActiveUserByUsers appdir={appdir} sourceHex={sourceHex} />
          </TabPane>
        </Tabs>
      </div>
    </>
  );
};

export default ActiveUsersTab;