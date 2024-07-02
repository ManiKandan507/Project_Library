import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import "antd/dist/antd.css";
import "./custom.css";
import { Row, Col } from "antd";
import HorizontalMenu from "./HorizontalMenu";
import CurrentMembers from "./CurrentMembers";
import RenewingMembers from "./RenewingMembers";
import NewMembers from "./NewMembers";
import ExpiredMembers from "./ExpiredMembers";
import Trend from "./Trend";
import Transition from "./Transition";
import SalesActivity from "./SalesActivity";
import LocationReport from "./LocationReport";

import { CURRENT_MEMBERS_SCREEN, EXPIRED_MEMBERS_SCREEN, NEW_MEMBERS_SCREEN, RENEWING_MEMBERS_SCREEN, SALES_ACTIVITY_SCREEN, TREND_SCREEN, LOCATION_REPORT_SCREEN, TRANSITION_SCREEN } from '../../../../Submodules/MembershipReporting/constants'

const ReportingPage = ({ staticConfig }) => {
  const activeReport = useSelector((state) => state.reporting.activeReport);
  const [activeReportRender, setActiveReportRender] = useState(
    <CurrentMembers
      sourceHex={staticConfig.source_hex}
      groupsid={staticConfig.groups_array}
      appdir={staticConfig.appdir}
      screen={CURRENT_MEMBERS_SCREEN}
    />
  );



  useEffect(() => {
    switch (activeReport) {
      case "currentmembers":
        setActiveReportRender(
          <CurrentMembers
            sourceHex={staticConfig.source_hex}
            groupsid={staticConfig.groups_array}
            appdir={staticConfig.appdir}
            screen={CURRENT_MEMBERS_SCREEN}
          />
        );
        break;
      case "expiredmembers":
        setActiveReportRender(
          <ExpiredMembers
            sourceHex={staticConfig.source_hex}
            groupsid={staticConfig.groups_array}
            appdir={staticConfig.appdir}
            screen={EXPIRED_MEMBERS_SCREEN}
          />
        );
        break;
      case "newmembers":
        setActiveReportRender(
          <NewMembers
            sourceHex={staticConfig.source_hex}
            groupsid={staticConfig.groups_array}
            appdir={staticConfig.appdir}
            screen={NEW_MEMBERS_SCREEN}
          />
        );
        break;
      case "renewingmembers":
        setActiveReportRender(
          <RenewingMembers
            sourceHex={staticConfig.source_hex}
            groupsid={staticConfig.groups_array}
            appdir={staticConfig.appdir}
            screen={RENEWING_MEMBERS_SCREEN}
          />
        );
        break;
      case "salesactivity":
        setActiveReportRender(
          <SalesActivity
            sourceHex={staticConfig.source_hex}
            groupsid={staticConfig.groups_array}
            appdir={staticConfig.appdir}
            screen={SALES_ACTIVITY_SCREEN}
          />
        );
        break;
      case "location":
        setActiveReportRender(
          <LocationReport
            sourceHex={staticConfig.source_hex}
            groupsid={staticConfig.groups_array}
            appdir={staticConfig.appdir}
            screen={LOCATION_REPORT_SCREEN}
          />
        );
        break;
      case "trend":
        setActiveReportRender(
          <Trend
            sourceHex={staticConfig.source_hex}
            groupsid={staticConfig.groups_array}
            appdir={staticConfig.appdir}
            screen={TREND_SCREEN}
          />
        );
        break;
        case "transition":
        setActiveReportRender(
          <Transition
            sourceHex={staticConfig.source_hex}
            groupsid={staticConfig.groups_array}
            appdir={staticConfig.appdir}
            screen={TRANSITION_SCREEN}
          />
        );
        break;
      default:
        setActiveReportRender(
          <CurrentMembers
            sourceHex={staticConfig.source_hex}
            groupsid={staticConfig.groups_array}
            appdir={staticConfig.appdir}
            screen={CURRENT_MEMBERS_SCREEN}
          />
        );
        break;
    }
  }, [activeReport, staticConfig.groups_array, staticConfig.source_hex]);

  return (
    <div className="container">
      <br />
      <Row>
        <Col span={24}>
          <HorizontalMenu />
        </Col>
        <Col span={24}>
          <div>{activeReportRender}</div>
        </Col>
      </Row>
    </div>
  );
};

export default ReportingPage;
