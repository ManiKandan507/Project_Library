import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Card, Menu } from "antd";
import { ReactComponent as CurrentMembers } from "../../assets/icons/CurrentMembers.svg";
import { ReactComponent as ExpiredMembers } from "../../assets/icons/ExpiredMembers.svg";
import { ReactComponent as NewMembers } from "../../assets/icons/NewMembers.svg";
import { ReactComponent as RenewingMembers } from "../../assets/icons/NewMembers.svg";
import { ReactComponent as SalesActivity } from "../../assets/icons/SalesActivity.svg";
import { ReactComponent as Location } from "../../assets/icons/Location.svg";
import { ReactComponent as Trend } from "../../assets/icons/Trend.svg";

import { requestMenuChange } from "../../appRedux/actions/Reporting";
import { CURRENT_MEMBERS, CURRENT_MEMBERS_SCREEN, EXPIRED_MEMBERS_SCREEN, NEW_MEMBERS_SCREEN, RENEWING_MEMBERS_SCREEN, SALES_ACTIVITY_SCREEN, TREND_SCREEN } from '../../../../Submodules/MembershipReporting/constants'
import { showModal } from '../../appRedux/actions/Reporting'

// import { Menu, Card } from "antd";
import "./custom.css";

const LeftMenu = () => {
  const dispatch = useDispatch();

  const menuItems = [
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
      screen: "salesactivity",
      screenName: "Sales Activity",
    },
    {
      screen: "location",
      screenName: "Location",
    },
    {
      screen: "trend",
      screenName: "Trend",
    },
  ];

  const menuChange = (screen) => {
    dispatch(
      requestMenuChange({
        screen,
      })
    );
    dispatch(showModal(false))
  };

  return (
    <div className="left-menu-div">
      <Card className="card">
        <Menu
          mode={"inline"}
          style={{ borderRight: "none", marginLeft: "0px" }}
          defaultSelectedKeys={[CURRENT_MEMBERS]}
        >
          {menuItems.map((menu) => {
            return (
              <Menu.Item
                key={menu.screenName}
                onClick={() => menuChange(menu.screen)}
                style={{ listStyle: "none", padding: "0" }}
              >
                <div className="">
                  <div
                    className=""
                    style={{
                      color: "black",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    {menu.screen === "CurrentMembers" && (
                      <CurrentMembers screen={CURRENT_MEMBERS_SCREEN} className="left-menu-icon" />
                    )}
                    {menu.screen === "ExpiredMembers" && (
                      <ExpiredMembers screen={EXPIRED_MEMBERS_SCREEN} className="left-menu-icon" />
                    )}
                    {menu.screen === "NewMembers" && (
                      <NewMembers screen={NEW_MEMBERS_SCREEN} className="left-menu-icon" />
                    )}
                    {menu.screen === "RenewingMembers" && (
                      <RenewingMembers screen={RENEWING_MEMBERS_SCREEN} className="left-menu-icon" />
                    )}
                    {menu.screen === "SalesActivity" && (
                      <SalesActivity screen={SALES_ACTIVITY_SCREEN} className="left-menu-icon" />
                    )}
                    {menu.screen === "Location" && (
                      <Location className="left-menu-icon" />
                    )}
                    {menu.screen === "Trend" && (
                      <Trend screen={TREND_SCREEN} className="left-menu-icon" />
                    )}
                    <span
                      style={{
                        marginLeft: "10%",
                        fontSize: "1.5rem",
                      }}
                    >
                      {menu.screenName}
                    </span>
                  </div>
                </div>
              </Menu.Item>
            );
          })}
        </Menu>
      </Card>
    </div>
  );
};

export default LeftMenu;
