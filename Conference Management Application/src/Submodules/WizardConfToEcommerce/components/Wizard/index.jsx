import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import "antd/dist/antd.css";
import { Steps, Button } from "antd";
import "./custom.css";
import ExecuteMigration from "./ExecuteMigration";
import SelectConference from "./SelectConference";
import SelectSessionTypes from "./SelectSessionTypes";
import ConferencePricing from "./ConferencePricing";
import SessionPricing from "./SessionPricing";
import AbstractFields from "./AbstractFields";
import EvaluationCredits from "./EvaluationCredits";
import Review from "./Review";
import {
  requestClearExecuteMigrationState,
  requestStartMigration,
} from "../../appRedux/actions/Wizard";
import CreateCustomBundle from "./CreateCustomBundle";
const { Step } = Steps;

const WizardPage = ({ staticConfig }) => {
  const dispatch = useDispatch();
  const startMigrationFlag = useSelector(state => state.wizard.start_migration);
  const steps = [
    {
      title: "Event",
      description: "Select event for migration",
      content: (
        <SelectConference
          sourceHex={staticConfig.source_hex}
          appdir={staticConfig.appdir}
          uuid={staticConfig.uuid}
        />
      ),
    },
    {
      title: "Session Types",
      description: "Select sessions for migration",
      content: (
        <SelectSessionTypes
          sourceHex={staticConfig.source_hex}
          appdir={staticConfig.appdir}
          uuid={staticConfig.uuid}
        />
      ),
    },
    {
      title: "Custom Session Bundles",
      description: "Create custom session bundles",
      content: (
        <CreateCustomBundle
          sourceHex={staticConfig.source_hex}
          appdir={staticConfig.appdir}
          uuid={staticConfig.uuid}
        />
      ),
    },
    {
      title: "Event Pricing",
      description: "Set event pricing",
      content: (
        <ConferencePricing
          sourceHex={staticConfig.source_hex}
          appdir={staticConfig.appdir}
          uuid={staticConfig.uuid}
        />
      ),
    },
    {
      title: "Session Pricing",
      description: "Set session pricing",
      content: (
        <SessionPricing
          sourceHex={staticConfig.source_hex}
          appdir={staticConfig.appdir}
          uuid={staticConfig.uuid}
        />
      ),
    },
    {
      title: "Presentation Fields",
      description: "Select presentation fields to display",
      content: (
        <AbstractFields
          sourceHex={staticConfig.source_hex}
          appdir={staticConfig.appdir}
          uuid={staticConfig.uuid}
        />
      ),
    },
    {
      title: "Credits & Evaluations",
      description: "Configure credit & evaluation for sessions",
      content: (
        <EvaluationCredits
          sourceHex={staticConfig.source_hex}
          appdir={staticConfig.appdir}
          uuid={staticConfig.uuid}
        />
      ),
    },
    {
      title: "Review",
      description: "Review migration",
      content: (
        <Review
          sourceHex={staticConfig.source_hex}
          appdir={staticConfig.appdir}
          uuid={staticConfig.uuid}
        />
      ),
    },
  ];
  const current = useSelector(state => state.wizard.current_step);

  const startMigration = () => {
    dispatch(requestClearExecuteMigrationState());
    dispatch(requestStartMigration());
  };

  return (
    <div className="container" style={{ paddingBottom: "5%" }}>
      <br />
      <Steps current={current} progressDot>
        {steps.map(item => (
          <Step
            key={item.title}
            title={item.title}
            description={item.description}
          />
        ))}
      </Steps>
      <div className="steps-content">{steps[current].content}</div>
      <div className="steps-action">
        {current === steps.length - 1 && (
          <Button
            type="primary"
            style={{ float: "right", marginRight: "15%" }}
            onClick={startMigration}
          >
            Start Migration
          </Button>
        )}
      </div>
      {startMigrationFlag ? (
        <ExecuteMigration
          sourceHex={staticConfig.source_hex}
          appdir={staticConfig.appdir}
        />
      ) : (
        <></>
      )}
    </div>
  );
};

export default WizardPage;
