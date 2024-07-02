import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Button,
  Card,
  Tag,
  Tooltip,
  Table,
  Alert,
  Descriptions,
  Popconfirm,
} from "antd";
import { requestSetStep } from "../../appRedux/actions/Wizard";
import "./custom.css";
import { isEmpty } from "lodash";
const _ = require("lodash");
const Review = props => {
  const dispatch = useDispatch();
  const setStep = (step = 0) => {
    dispatch(requestSetStep(step));
  };
  const [showPopConfirm, setShowPopConfirm] = useState(false);
  const wizardState = useSelector(state => state.wizard);
  const [conferencePricingTableData] = useState(() => {
    let data = [];

    wizardState.config.conference_pricing.forEach(pricing => {
      if (pricing.scope == "public") {
        data.push({
          groupNames: ["Default Price"],
          type: "public",
          price: parseInt(pricing.price),
          price_label: pricing.price_label ?? "",
        });
      }
      if (pricing.scope == "group") {
        data.push({
          groupNames: pricing.groups.map(group => group.GroupName),
          type: "group",
          price: parseInt(pricing.price),
          price_label: pricing.price_label ?? "",
        });
      }
      if (pricing.scope == "attendee") {
        data.push({
          groupNames: pricing.attendees.map(attendee => attendee.Rowlabel),
          type: "group",
          price: parseInt(pricing.price),
          price_label: pricing.price_label ?? "",
        });
      }
    });
    return data;
  });
  const [sessionPricingTableData] = useState(() => {
    let data = [];

    wizardState.config.session_pricing.forEach(pricing => {
      if (pricing.scope == "public") {
        if (pricing.sessions && !isEmpty(pricing.sessions)) {
          let tempSessionNames = [];
          pricing.sessions.forEach(session => {
            if (session.hasOwnProperty("bundle_name")) {
              if (!tempSessionNames.includes(session.bundle_name)) {
                tempSessionNames.push(session.bundle_name);
              }
            } else {
              tempSessionNames.push(session.SessionName);
            }
          });

          data.push({
            type: "public",
            sessionNames: tempSessionNames,
            groupNames: ["Default Price"],
            sessionPrice: parseInt(pricing.session_price),
            abstractPrice: parseInt(pricing.abstract_price),
            price_label: pricing.price_label ?? "",
          });
        } else {
          data.push({
            type: "public",
            sessionNames: ["Default Price"],
            groupNames: ["Default Price"],
            sessionPrice: parseInt(pricing.session_price),
            abstractPrice: parseInt(pricing.abstract_price),
            price_label: pricing.price_label ?? "",
          });
        }
      }
      if (pricing.scope == "group") {
        let tempSessionNames = [];
        pricing.sessions.forEach(session => {
          if (session.hasOwnProperty("bundle_name")) {
            if (!tempSessionNames.includes(session.bundle_name)) {
              tempSessionNames.push(session.bundle_name);
            }
          } else {
            tempSessionNames.push(session.SessionName);
          }
        });

        data.push({
          type: "group",
          sessionNames: tempSessionNames,
          groupNames: pricing.groups.map(group => group.GroupName),
          sessionPrice: parseInt(pricing.session_price),
          abstractPrice: parseInt(pricing.abstract_price),
          price_label: pricing.price_label ?? "",
        });
      }
      if (pricing.scope == "attendee") {
        let tempSessionNames = [];
        pricing.sessions.forEach(session => {
          if (session.hasOwnProperty("bundle_name")) {
            if (!tempSessionNames.includes(session.bundle_name)) {
              tempSessionNames.push(session.bundle_name);
            }
          } else {
            tempSessionNames.push(session.SessionName);
          }
        });

        data.push({
          type: "attendee",
          sessionNames: tempSessionNames,
          groupNames: pricing.attendees.map(attendee => attendee.Rowlabel),
          sessionPrice: parseInt(pricing.session_price),
          abstractPrice: parseInt(pricing.abstract_price),
          price_label: pricing.price_label ?? "",
        });
      }
    });
    return data;
  });
  const [abstractFieldTableData] = useState(() => {
    let data = [];

    wizardState.config.abstract_fields.forEach(field => {
      let fieldName = "";
      wizardState.abstract_fields.abstract_fields.every(abstract_field => {
        if (field.fieldid == abstract_field.FieldID) {
          fieldName = abstract_field.Fieldlabel;
        }
        return true;
      });

      data.push({
        fieldName: fieldName,
        displayLabel: field.displayLabel ? "Yes" : "No",
      });
    });
    return data;
  });
  const [sessionsListTableData] = useState(() => {
    let data = [];

    wizardState.config.session_list.forEach(session => {
      data.push({
        sessionType:
          session.SessionType != "" ? session.SessionType : "Unknown",
        sessionName: session.SessionName,
      });
    });

    return data;
  });

  const [customBundleTableData] = useState(() => {
    let tempTableData = [];
    if (wizardState.config.custom_bundles.length > 0) {
      wizardState.config.custom_bundles.forEach(bundle => {
        const maxTableKey = _.max(tempTableData.map(rec => parseInt(rec.key)));

        tempTableData.push({
          ...bundle,
          key: _.isNumber(maxTableKey) ? maxTableKey + 1 : 0,
        });
      });
    }

    return tempTableData;
  });

  const [evaluationCreditsTableData] = useState(() => {
    let data = [];

    wizardState.config.evaluations.forEach(evalu => {
      let tempSessionName = "";
      wizardState.config.session_list.forEach(session => {
        if (session.SessionID == evalu.SessionID) {
          tempSessionName = session.SessionName;
        }
      });
      data.push({
        session_name: tempSessionName,
        include_evaluation: evalu.includeEvaluation ? "Yes" : "No",
        include_credits: evalu.includeCredit ? "Yes" : "No",
      });
    });
    return data;
  });
  const headerMessage = (
    <p>
      Please review all of your selections before performing the event
      migration. <br />
      If you would like to change anything, click the Edit button on the right
      side of the step.
    </p>
  );

  const conferencePricingColumns = [
    {
      title: "Access Groups",
      dataIndex: "groupNames",
      key: "groupNames",
      render: (groupNames, record, index) => {
        let result = [];
        groupNames?.forEach(groupName => {
          if (record.type === "attendee") {
            result.push(
              <Tag color="red" key={groupName}>
                {groupName}
              </Tag>
            );
          } else {
            result.push(
              <Tag color="geekblue" key={groupName}>
                {groupName}
              </Tag>
            );
          }
        });
        return (
          <Tooltip placement="topLeft" title={groupNames?.toString()}>
            {result}
          </Tooltip>
        );
      },
      ellipsis: {
        showTitle: false,
      },
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      render: (price, record) => {
        if (price > 0) {
          if (!_.isEmpty(record.price_label)) {
            return (
              <p>
                <strong>{record.price_label}</strong>: ${price}
              </p>
            );
          }
          return `$${price}`;
        }
        if (price == -1) {
          if (!_.isEmpty(record.price_label)) {
            return (
              <p>
                <strong>{record.price_label}</strong>: Not for Sale
              </p>
            );
          }
          return "Not for Sale";
        }
        if (price == 0) {
          if (!_.isEmpty(record.price_label)) {
            return (
              <p>
                <strong>{record.price_label}</strong>: Free/Open Access
              </p>
            );
          }
          return "Free/Open Access";
        }
      },
    },
  ];
  const sessionPricingColumns = [
    {
      title: "Access Groups",
      dataIndex: "groupNames",
      key: "groupNames",
      render: (groupNames, record, index) => {
        let result = [];
        groupNames?.forEach(groupName => {
          if (record.type === "attendee") {
            result.push(
              <Tag color="red" key={groupName}>
                {groupName}
              </Tag>
            );
          } else if (
            record.type === "public" &&
            !record.sessionNames.includes("Default Price")
          ) {
            result.push(
              <Tag color="cyan" key={groupName}>
                {groupName}
              </Tag>
            );
          } else {
            result.push(
              <Tag color="geekblue" key={groupName}>
                {groupName}
              </Tag>
            );
          }
        });
        return (
          <Tooltip placement="topLeft" title={groupNames?.toString()}>
            {result}
          </Tooltip>
        );
      },
      ellipsis: {
        showTitle: false,
      },
    },
    {
      title: "Sessions",
      dataIndex: "sessionNames",
      key: "sessionNames",

      render: sessionNames => {
        let result = [];
        sessionNames?.forEach(sessionName => {
          result.push(
            <Tag color="geekblue" key={sessionName}>
              {sessionName}
            </Tag>
          );
        });
        return (
          <Tooltip placement="topLeft" title={sessionNames?.toString()}>
            {result}
          </Tooltip>
        );
      },

      ellipsis: {
        showTitle: false,
      },
    },
    {
      title: "Session Price",
      dataIndex: "sessionPrice",
      key: "sessionPrice",
      render: (sessionPrice, record) => {
        if (sessionPrice > 0) {
          if (!_.isEmpty(record.price_label)) {
            return (
              <p>
                <strong>{record.price_label}</strong>: ${sessionPrice}
              </p>
            );
          }
          return `$${sessionPrice}`;
        }
        if (sessionPrice == -1) {
          if (!_.isEmpty(record.price_label)) {
            return (
              <p>
                <strong>{record.price_label}</strong>: Not for Sale
              </p>
            );
          }
          return "Not for Sale";
        }
        if (sessionPrice == 0) {
          if (!_.isEmpty(record.price_label)) {
            return (
              <p>
                <strong>{record.price_label}</strong>: Free/Open Access
              </p>
            );
          }
          return "Free/Open Access";
        }
      },
    },
    {
      title: "Presentation Price",
      dataIndex: "abstractPrice",
      key: "abstractPrice",
      render: abstractPrice => {
        if (abstractPrice > 0) {
          return `$${abstractPrice}`;
        }
        if (abstractPrice == -1) {
          return "Not for Sale";
        }
        if (abstractPrice == 0) {
          return "Free/Open Access";
        }
      },
    },
  ];
  const abstractFieldsColumns = [
    {
      title: "Field Name",
      dataIndex: "fieldName",
      key: "fieldName",
    },
    {
      title: "Display Label",
      dataIndex: "displayLabel",
      key: "displayLabel",
    },
  ];
  const sessionsListColumns = [
    {
      title: "Session Type",
      dataIndex: "sessionType",
      key: "sessionType",
      width: "20%",
      ellipsis: {
        showTitle: false,
      },
    },
    {
      title: "Session Name",
      dataIndex: "sessionName",
      key: "sessionName",
      ellipsis: {
        showTitle: false,
      },
    },
  ];
  const customBundleListColumns = [
    {
      title: "Bundle Name",
      dataIndex: "bundle_name",
      key: "bundle_name",
      width: "20%",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      width: "30%",
      render: description => {
        return <div dangerouslySetInnerHTML={{ __html: description }}></div>;
      },
    },
    {
      title: "Sessions",
      dataIndex: "sessions",
      key: "sessions",
      width: "45%",
      render: (sessions, record, index) => {
        let result = [];
        let sessionNames = [];
        sessions?.forEach(session => {
          result.push(
            <Tag color="geekblue" key={session.id}>
              <strong>{session.session_type} :</strong> {session.session_name}
            </Tag>
          );
          sessionNames.push(session.session_name);
        });
        return (
          <Tooltip placement="topLeft" title={sessionNames?.toString()}>
            {result}
          </Tooltip>
        );
      },
      ellipsis: true,
    },
  ];

  const evaluationsCreditsColumns = [
    {
      title: "Session Name",
      dataIndex: "session_name",
      key: "session_name",
    },
    {
      title: "Include Evaluation",
      key: "include_evaluation",
      dataIndex: "include_evaluation",
    },
    {
      title: "Include Credits",
      key: "include_credits",
      dataIndex: "include_credits",
    },
  ];
  return (
    <div>
      <div>
        <Alert
          message={headerMessage}
          type="info"
          showIcon
          style={{ marginRight: "5%", marginLeft: "5%" }}
        />
        <br />
      </div>
      <Card
        size="small"
        title="Event details"
        extra={
          <Button type="primary" onClick={() => setStep(0)}>
            Edit
          </Button>
        }
        style={{ width: "90%", marginLeft: "5%", marginRight: "5%" }}
      >
        <div style={{ marginLeft: "5%" }}>
          <p>
            <strong>Event Name: </strong>
            {wizardState.config.conference.Confname}
          </p>
          <p>
            <strong>Store Name: </strong>
            {wizardState.config.store.Eventname}
          </p>
          <p>
            <strong>Store Category: </strong>
            {wizardState.config.menu.Button}
          </p>
          {/* <p>
            <strong>
              Copy over the session & abstract tags to the product:{" "}
            </strong>
            {wizardState.config.abstract_tag == "true" ? "Yes" : "No"}
          </p> */}
          <p>
            <strong>Sell Sessions: </strong>
            {wizardState.config.sell_session == "true" ? "Yes" : "No"}
          </p>
          <p>
            <strong>Sell Presentations: </strong>
            {wizardState.config.sell_abstract == "true" ? "Yes" : "No"}
          </p>
        </div>
      </Card>
      <br />
      <Card
        size="small"
        title="Sessions to Migrate"
        extra={
          <Button type="primary" onClick={() => setStep(1)}>
            Edit
          </Button>
        }
        style={{ width: "90%", marginLeft: "5%", marginRight: "5%" }}
      >
        <div style={{ marginLeft: "5%" }}>
          <Table
            columns={sessionsListColumns}
            dataSource={sessionsListTableData}
          />
        </div>

        {/* <div style={{ marginLeft: "5%" }}>
          <ul>
            {wizardState.config.session_list.map(session => (
              <li>{session.SessionName}</li>
            ))}
          </ul>
        </div> */}
      </Card>
      <br />
      {wizardState.config.create_custom_bundle == "true" &&
      wizardState.config.sell_session == "true" ? (
        <Card
          size="small"
          title="Custom Bundles"
          extra={
            <Popconfirm
              title="You may lose session pricing configuration."
              visible={showPopConfirm}
              onConfirm={() => {
                setShowPopConfirm(false);
                setStep(2);
              }}
              onCancel={() => setShowPopConfirm(false)}
            >
              <Button type="primary" onClick={() => setShowPopConfirm(true)}>
                Edit
              </Button>
            </Popconfirm>
          }
          style={{ width: "90%", marginLeft: "5%", marginRight: "5%" }}
        >
          <div style={{ marginLeft: "5%" }}>
            <Table
              columns={customBundleListColumns}
              dataSource={customBundleTableData}
            />
          </div>
        </Card>
      ) : (
        <></>
      )}
      <br />
      <Card
        size="small"
        title="Conference Pricing"
        extra={
          <Button type="primary" onClick={() => setStep(3)}>
            Edit
          </Button>
        }
        style={{ width: "90%", marginLeft: "5%", marginRight: "5%" }}
      >
        <div style={{ marginLeft: "5%" }}>
          <Table
            columns={conferencePricingColumns}
            dataSource={conferencePricingTableData}
          />
        </div>
      </Card>
      <br />

      {wizardState.config.sell_session == "true" ? (
        <Card
          size="small"
          title="Session Pricing"
          extra={
            <Button type="primary" onClick={() => setStep(4)}>
              Edit
            </Button>
          }
          style={{ width: "90%", marginLeft: "5%", marginRight: "5%" }}
        >
          <div style={{ marginLeft: "5%" }}>
            <Table
              columns={sessionPricingColumns}
              dataSource={sessionPricingTableData}
            />
          </div>
        </Card>
      ) : (
        <></>
      )}

      <br />
      <Card
        size="small"
        title="Presentation Fields"
        extra={
          <Button type="primary" onClick={() => setStep(5)}>
            Edit
          </Button>
        }
        style={{ width: "90%", marginLeft: "5%", marginRight: "5%" }}
      >
        <div style={{ marginLeft: "5%" }}>
          <Table
            columns={abstractFieldsColumns}
            dataSource={abstractFieldTableData}
          />
        </div>
      </Card>
      <br />
      {wizardState.config.include_evaluation_credit == "true" ? (
        <Card
          size="small"
          title="Credits & Evaluations"
          extra={
            <Button type="primary" onClick={() => setStep(6)}>
              Edit
            </Button>
          }
          style={{ width: "90%", marginLeft: "5%", marginRight: "5%" }}
        >
          <div style={{ marginLeft: "5%" }}>
            {wizardState.config.credits.length > 0 ? (
              <>
                <Descriptions bordered>
                  <Descriptions.Item label="Credits">
                    {wizardState.config.credits
                      .map(credit => credit.label)
                      .join(", ")}
                  </Descriptions.Item>
                </Descriptions>
                <br />
              </>
            ) : (
              <></>
            )}

            <Table
              columns={evaluationsCreditsColumns}
              dataSource={evaluationCreditsTableData}
            />
          </div>
        </Card>
      ) : (
        <></>
      )}
    </div>
  );
};

export default Review;
