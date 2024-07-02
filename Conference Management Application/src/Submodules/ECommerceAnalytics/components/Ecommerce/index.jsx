import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Row, Col } from "antd";
import "antd/dist/antd.css";

import "./custom.css";
import SideTabMenu from "./SideTabMenu";
import DefaultHome from "./DefaultHome/index";
import Bandwidth from "./Bandwidth";
import ProductDetails from "./ProductDetails";
import FileDetailsTab from "./FileDetailsTab";
import ActiveUsersTab from "./ActiveUser/index";

import { HOME_SCREEN, BANDWIDTH_SCREEN, USER_SCREEN, FILE_SCREEN, PRODUCT_SCREEN, DEFAULT_PRIMARY_COLOR } from '../../constants'

const ReportingPage = ({ staticConfig }) => {
  const activeReport = useSelector((state) => state.reporting.activeReport);
  const [activeReportRender, setActiveReportRender] = useState(
    <DefaultHome
      sourceHex={staticConfig.source_hex}
      groupsid={staticConfig.groups_array}
      appdir={staticConfig.appdir}
      screen={HOME_SCREEN}
      primary_color={staticConfig.primary_color}
    />
  );

  useEffect(() => {
    const element = document.documentElement;
    if (element) {
      let primary_color = staticConfig.primary_color || DEFAULT_PRIMARY_COLOR;
      element.style.setProperty('--primary_color', primary_color); 
    }
  }, [staticConfig])

  useEffect(() => {
    switch (activeReport) {
      case "home":
        setActiveReportRender(
          <DefaultHome
            sourceHex={staticConfig.source_hex}
            appdir={staticConfig.appdir}
            screen={HOME_SCREEN}
            primary_color={staticConfig.primary_color}
          />
        );
        break;
      case "bandwidth":
        setActiveReportRender(
          <Bandwidth
            sourceHex={staticConfig.source_hex}
            appdir={staticConfig.appdir}
            screen={BANDWIDTH_SCREEN}
          />
        );
        break;
      case "user":
        setActiveReportRender(
          <ActiveUsersTab
            sourceHex={staticConfig.source_hex}
            appdir={staticConfig.appdir}
            screen={USER_SCREEN}
          />
        );
        break;
      case "file":
        setActiveReportRender(
          <FileDetailsTab
            sourceHex={staticConfig.source_hex}
            appdir={staticConfig.appdir}
            screen={FILE_SCREEN}
            primary_color={staticConfig.primary_color}
          />
        );
        break;
      case "product":
        setActiveReportRender(
          <ProductDetails
            sourceHex={staticConfig.source_hex}
            appdir={staticConfig.appdir}
            screen={PRODUCT_SCREEN}
          />
        );
        break;
      default:
        setActiveReportRender(
          <DefaultHome
            sourceHex={staticConfig.source_hex}
            appdir={staticConfig.appdir}
            screen={HOME_SCREEN}
            primary_color={staticConfig.primary_color}
          />
        );
        break;
    }
  }, [activeReport, staticConfig.groups_array, staticConfig.source_hex]);

  return (
    <div className="container" style={{ padding: '2rem' }}>
      <br />
      <div>
        <SideTabMenu />
      </div>
      <div>
        <div>{activeReportRender}</div>
      </div>
    </div>
  );
};

export default ReportingPage;
