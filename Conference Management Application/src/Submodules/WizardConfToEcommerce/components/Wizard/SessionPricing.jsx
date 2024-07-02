import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Button,
  Input,
  Space,
  Table,
  Tag,
  Modal,
  Form,
  Select,
  message,
  Result,
  TreeSelect,
  Tooltip,
  Radio,
  Card,
  Alert,
  Divider,
  Popconfirm,
} from "antd";

import { DeleteOutlined } from "@ant-design/icons";
import {
  requestNextStep,
  requestPreviousStep,
  requestStoreSessionPricing,
} from "../../appRedux/actions/Wizard";
import "./custom.css";
import { isEmpty } from "lodash";
const { Option } = Select;
const _ = require("lodash");
const { SHOW_CHILD } = TreeSelect;
const SessionPricing = props => {
  const dispatch = useDispatch();

  const allContactGroups = useSelector(
    state => state.wizard.conference_pricing.contact_groups
  );

  const contact_groups_fetched = useSelector(
    state => state.wizard.conference_pricing.contact_groups_fetched
  );
  const allAttendeeGroups = useSelector(
    state => state.wizard.conference_pricing.attendee_groups
  );

  const attendee_groups_fetched = useSelector(
    state => state.wizard.conference_pricing.attendee_groups_fetched
  );
  const sessionTypes = useSelector(
    state => state.wizard.select_session_types.session_types
  );
  const allSessions = useSelector(
    state => state.wizard.select_session_types.all_sessions
  );

  const stateConfig = useSelector(state => state.wizard.config);
  const [sellSession] = useState(
    stateConfig.sell_session == "true" ? true : false
  );
  const [sellAbstract] = useState(
    stateConfig.sell_abstract == "true" ? true : false
  );

  const customBundleTitle = "Custom Bundles";
  const [showPopConfirm, setShowPopConfirm] = useState(false);
  const [createCustomBundle] = useState(
    stateConfig.create_custom_bundle === "true" ? true : false
  );

  const [doNotCreateProductSessionIDs] = useState(() => {
    if (createCustomBundle) {
      let sessionIDs = [];
      stateConfig.custom_bundles.forEach(bundle => {
        bundle.sessions.forEach(session => {
          if (
            session.do_not_create_product &&
            !sessionIDs.includes(parseInt(session.id))
          ) {
            sessionIDs.push(parseInt(session.id));
          }
        });
      });

      return sessionIDs;
    } else {
      return [];
    }
  });

  let [sessionPricingMap, setSessionPricingMap] = useState({});
  /* 
  {
    public: [12,20],
    attendee|<<SESSION_ID>>:[45,23],
    attendee|<<SESSION_ID>>:[34,45],
    <<GROUPID>>|<<SESSIONID>>:[67,5],
    <<GROUPID>>|<<SESSIONID>>:[23,98]
   }
   [X,Y] => X= session price, Y= abstract price
   */
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [processingPricing, setProcessingPricing] = useState({});
  const [groupsDropdownOptions, setGroupsDropdownOptions] = useState([]);
  const [attendeesDropdownOptions, setAttendeesDropdownOptions] = useState([]);
  const [modalPricingType, setModalPricingType] = useState("");
  const [groupsMap, setGroupsMap] = useState({});
  const [sessionsMap, setSessionsMap] = useState({});
  const [tableData, setTableData] = useState([]);
  const [pricingForm] = Form.useForm();
  const [treeData, setTreeData] = useState([]);
  const [modalSelectedSessions, setModalSelectedSessions] = useState([]);
  const [attendeeGroupsMap, setAttendeeGroupsMap] = useState({});
  const [defaultSessionBasePrice, setDefaultSessionBasePrice] = useState(() => {
    let basePrice = 0;
    stateConfig.session_pricing.forEach(pricing => {
      if (
        pricing.scope === "public" &&
        (!pricing.hasOwnProperty("sessions") || isEmpty(pricing.sessions))
      ) {
        basePrice = parseInt(pricing.session_price);
      }
    });
    return basePrice;
  });

  const [defaultAbstractBasePrice, setDefaultAbstractBasePrice] = useState(
    () => {
      let basePrice = 0;
      stateConfig.session_pricing.forEach(pricing => {
        if (
          pricing.scope === "public" &&
          (!pricing.hasOwnProperty("sessions") || isEmpty(pricing.sessions))
        ) {
          basePrice = parseInt(pricing.abstract_price);
        }
      });
      return basePrice;
    }
  );

  const [isSessionBasePricePaid, setIsSessionBasePricePaid] = useState(
    defaultSessionBasePrice > 0 ? true : false
  );

  const [isAbstractBasePricePaid, setIsAbstractBasePricePaid] = useState(
    defaultAbstractBasePrice > 0 ? true : false
  );

  const [isProcessingSessionPricePaid, setIsProcessingSessionPricePaid] =
    useState(false);
  const [isProcessingAbstractPricePaid, setIsProcessingAbstractPricePaid] =
    useState(false);
  const modalMessage = (
    <p>
      Create custom pricing for contacts in specific groups in your system, or
      based on registration selections for this past event.
      <br /> You can create as many special pricing rules as you would like.
    </p>
  );
  const headerDescription = (
    <p>
      Set a default price for the sessions
      <br /> <strong>Free/Open</strong> = Available for anyone
      <br /> <strong>Paid </strong>= Items must be purchased in order to view
      <br /> After creating a default price, you can set Special Pricing to
      allow certain types of people access to the content for different prices
      or make it free.
    </p>
  );
  let columns = [
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
          } else if (record.type === "public") {
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
      title: "Action",
      key: "action",
      render: (text, record) => (
        <Space size="middle">
          <DeleteOutlined
            onClick={() => {
              deleteTableRecord(record);
            }}
          />
        </Space>
      ),
    },
  ];

  if (sellAbstract) {
    columns.splice(3, 0, {
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
    });
  }

  useEffect(() => {
    let pricingMap = {};
    /**
     * {
     * public: [12,30],
     * <<ATTENDEE VALUE ID>>|<<SESSIONID>>: [23,40],
     * <<ATTENDEE VALUE ID>>|<<SESSIONID>>:[34,56],
     * <<GROUPID>>|<<SESSIONID>>:[23,56]
     * }
     * [X,Y] => X= session price, Y= abstract price
     */
    let initialTableData = [];
    //TODO: EdgeCase if the groupID and attendee ValueID is same then this will fail
    stateConfig.session_pricing.forEach(pricing => {
      if (pricing.scope === "public") {
        if (pricing.sessions && !isEmpty(pricing.sessions)) {
          let sessionNames = [];
          pricing.sessions.forEach(session => {
            if (session.hasOwnProperty("custom_session_id")) {
              // This is a custom bundle
              if (!sessionNames.includes(session.bundle_name)) {
                sessionNames.push(session.bundle_name);
              }
              pricingMap[`public|${session.custom_session_id}`] = [
                pricing.session_price,
                pricing.abstract_price ? pricing.abstract_price : 0,
                pricing.price_label ?? "",
              ];
            } else {
              if (!sessionNames.includes(session.SessionName)) {
                sessionNames.push(session.SessionName);
              }
              pricingMap[`public|${session.SessionID}`] = [
                pricing.session_price,
                pricing.abstract_price ? pricing.abstract_price : 0,
                pricing.price_label ?? "",
              ];
            }
          });

          initialTableData.push({
            key: pricing.pricing_id,
            groupNames: ["Default"],
            sessionNames: sessionNames,
            sessionPrice: pricing.session_price,
            abstractPrice: pricing.abstract_price ? pricing.abstract_price : 0,
            type: "public",
            price_label: pricing.price_label ?? "",
          });
        } else {
          pricingMap["public|Session"] = pricing.session_price;
          if (sellAbstract)
            pricingMap["public|Abstract"] = pricing.abstract_price;
        }
      } else if (pricing.scope === "attendee") {
        let groupNames = [];
        let sessionNames = [];
        pricing.attendees.forEach(attendee => {
          pricing.sessions.forEach(session => {
            if (session.hasOwnProperty("custom_session_id")) {
              // This is a custom bundle
              if (!sessionNames.includes(session.bundle_name)) {
                sessionNames.push(session.bundle_name);
              }
              pricingMap[`${attendee.ValueID}|${session.custom_session_id}`] = [
                pricing.session_price,
                pricing.abstract_price ? pricing.abstract_price : 0,
                pricing.price_label ?? "",
              ];
            } else {
              if (!sessionNames.includes(session.SessionName)) {
                sessionNames.push(session.SessionName);
              }
              pricingMap[`${attendee.ValueID}|${session.SessionID}`] = [
                pricing.session_price,
                pricing.abstract_price ? pricing.abstract_price : 0,
                pricing.price_label ?? "",
              ];
            }
          });
          groupNames.push(attendee.Rowlabel);
        });
        initialTableData.push({
          key: pricing.pricing_id,
          groupNames: groupNames,
          sessionNames: sessionNames,
          sessionPrice: pricing.session_price,
          abstractPrice: pricing.abstract_price ? pricing.abstract_price : 0,
          type: "attendee",
          price_label: pricing.price_label ?? "",
        });
      } else if (pricing.scope === "group") {
        let groupNames = [];
        let sessionNames = [];
        pricing.groups.forEach(group => {
          pricing.sessions.forEach(session => {
            if (session.hasOwnProperty("custom_session_id")) {
              // This is a custom bundle
              if (!sessionNames.includes(session.bundle_name)) {
                sessionNames.push(session.bundle_name);
              }
              pricingMap[`${group.GroupID}|${session.custom_session_id}`] = [
                pricing.session_price,
                pricing.abstract_price ? pricing.abstract_price : 0,
                pricing.price_label ?? "",
              ];
            } else {
              if (!sessionNames.includes(session.SessionName)) {
                sessionNames.push(session.SessionName);
              }
              pricingMap[`${group.GroupID}|${session.SessionID}`] = [
                pricing.session_price,
                pricing.abstract_price ? pricing.abstract_price : 0,
                pricing.price_label ?? "",
              ];
            }
          });
          groupNames.push(group.GroupName);
        });
        initialTableData.push({
          key: pricing.pricing_id,
          groupNames: groupNames,
          sessionNames: sessionNames,
          sessionPrice: pricing.session_price,
          abstractPrice: pricing.abstract_price ? pricing.abstract_price : 0,
          price_label: pricing.price_label ?? "",
          type: "group",
        });
      } else {
        return false;
      }
    });

    setTableData(initialTableData);
    setSessionPricingMap(pricingMap);
  }, [stateConfig.session_pricing]);

  useEffect(() => {
    if (!isEmpty(sessionTypes) && allSessions.length > 0) {
      let intermediateTree = [];
      let finalTree = [];

      let nodeMap = {};
      //Creating the root nodes
      sessionTypes.session_types.forEach(type => {
        intermediateTree.push({
          title: type.name,
          value: type.id,
          key: type.id,
        });
        nodeMap[type.name] = [];
      });
      intermediateTree.push({
        title: "Unknown",
        value: -1,
        key: -1,
      });
      nodeMap["Unknown"] = [];

      if (createCustomBundle) {
        intermediateTree.push({
          title: customBundleTitle,
          value: -2,
          key: -2,
        });
        nodeMap[customBundleTitle] = [];
      }

      //Creating the leaf nodes
      let tempSessionMap = { ...sessionsMap };
      stateConfig.session_list.forEach(session => {
        //Excluding session marked for not individual product creation

        if (!doNotCreateProductSessionIDs.includes(session.SessionID)) {
          tempSessionMap[session.SessionID] = session.SessionName;

          if (session.SessionType !== "" && nodeMap[session.SessionType]) {
            nodeMap[session.SessionType].push({
              title: session.SessionName,
              value: session.SessionID,
              key: session.SessionID,
            });
          } else {
            nodeMap["Unknown"].push({
              title: session.SessionName,
              value: session.SessionID,
              key: session.SessionID,
            });
          }
        }
      });

      //Adding the custom Bundles in Session Map
      stateConfig.custom_bundles.forEach(bundle => {
        tempSessionMap[bundle.custom_session_id] = bundle.bundle_name;
        nodeMap[customBundleTitle].push({
          title: bundle.bundle_name,
          value: bundle.custom_session_id,
          key: bundle.custom_session_id,
        });
      });
      setSessionsMap(tempSessionMap);
      intermediateTree.forEach(node => {
        if (!_.isEmpty(nodeMap[node.title])) {
          finalTree.push({
            title: node.title,
            key: node.key,
            value: node.value,
            children: nodeMap[node.title],
          });
        }
      });

      setTreeData([
        {
          title: "Select All",
          key: -3,
          value: -3,
          children: finalTree,
        },
      ]);
    }
  }, [sessionTypes, allSessions]);

  useEffect(() => {
    if (contact_groups_fetched && _.isEmpty(groupsDropdownOptions)) {
      let allGroups = [];
      let tempGroupsMap = {};
      allContactGroups.forEach(group => {
        allGroups.push(<Option key={group.GroupID}>{group.GroupName}</Option>);
        tempGroupsMap[group.GroupID] = group.GroupName;
      });
      tempGroupsMap["public"] = "Base Price";
      setGroupsMap(tempGroupsMap);
      setGroupsDropdownOptions(allGroups);
    }
    if (attendee_groups_fetched && _.isEmpty(attendeesDropdownOptions)) {
      let allAttendees = [];
      let tempAttendeeGroupsMap = {};
      allAttendeeGroups.forEach(attendee => {
        allAttendees.push(
          <Option key={attendee.ValueID}>{attendee.Rowlabel}</Option>
        );
        tempAttendeeGroupsMap[attendee.ValueID] = attendee.Rowlabel;
      });
      setAttendeeGroupsMap(tempAttendeeGroupsMap);
      setAttendeesDropdownOptions(allAttendees);
    }
  }, [contact_groups_fetched, attendee_groups_fetched]);

  const nextStep = () => {
    if (sellSession) {
      let publicIntermediateDispatchRequest = [];
      let attendeeIntermediateDispatchRequest = [];
      let groupIntermediateDispatchRequest = [];
      let id = 0;
      const allValueIDs = allAttendeeGroups.map(attendee => attendee.ValueID);
      let tempPublicIntermediateDefaultDispatch = {};
      for (let pricingId in sessionPricingMap) {
        const [groupid, sessionid] = getGroupIDSessionID(pricingId);
        let requiredSession = {};
        //Checking if this is custom bundle
        if (typeof sessionid == "string" && sessionid.includes("bundle")) {
          stateConfig.custom_bundles.forEach(bundle => {
            if (bundle.custom_session_id == sessionid) {
              requiredSession = bundle;
              return;
            }
          });
        }
        allSessions.forEach(session => {
          if (session.SessionID == sessionid) {
            requiredSession = session;
            return;
          }
        });
        let requiredGroup = {};
        allContactGroups.forEach(group => {
          if (group.GroupID == groupid) {
            requiredGroup = group;
            return;
          }
        });

        let requiredAttendee = {};
        allAttendeeGroups.forEach(attendee => {
          if (attendee.ValueID == groupid) {
            requiredAttendee = attendee;
            return;
          }
        });

        if (groupid === "public") {
          if (sessionid === "Abstract") {
            if (
              !tempPublicIntermediateDefaultDispatch.hasOwnProperty(
                "pricing_id"
              )
            ) {
              tempPublicIntermediateDefaultDispatch["pricing_id"] = id++;
            }
            if (
              !tempPublicIntermediateDefaultDispatch.hasOwnProperty("scope")
            ) {
              tempPublicIntermediateDefaultDispatch["scope"] = "public";
            }
            if (
              !tempPublicIntermediateDefaultDispatch.hasOwnProperty(
                "abstract_price"
              )
            ) {
              tempPublicIntermediateDefaultDispatch["abstract_price"] =
                sessionPricingMap[pricingId];
            }

            // publicIntermediateDispatchRequest.push({
            //   pricing_id: id++,
            //   scope: "public",
            //   abstract_price: sessionPricingMap[pricingId],
            // });
          } else if (sessionid === "Session") {
            if (
              !tempPublicIntermediateDefaultDispatch.hasOwnProperty(
                "pricing_id"
              )
            ) {
              tempPublicIntermediateDefaultDispatch["pricing_id"] = id++;
            }
            if (
              !tempPublicIntermediateDefaultDispatch.hasOwnProperty("scope")
            ) {
              tempPublicIntermediateDefaultDispatch["scope"] = "public";
            }
            if (
              !tempPublicIntermediateDefaultDispatch.hasOwnProperty(
                "session_price"
              )
            ) {
              tempPublicIntermediateDefaultDispatch["session_price"] =
                sessionPricingMap[pricingId];
            }

            // publicIntermediateDispatchRequest.push({
            //   pricing_id: id++,
            //   scope: "public",
            //   session_price: sessionPricingMap[pricingId],
            // });
          } else {
            publicIntermediateDispatchRequest.push({
              pricing_id: id++,
              scope: "public",
              sessions: requiredSession,
              session_price: sessionPricingMap[pricingId][0],
              abstract_price: sessionPricingMap[pricingId][1],
              price_label: sessionPricingMap[pricingId][2],
            });
          }
        } else if (allValueIDs.includes(parseInt(groupid))) {
          //This is a attendee record
          attendeeIntermediateDispatchRequest.push({
            pricing_id: id++,
            scope: "attendee",
            sessions: requiredSession,
            attendees: requiredAttendee,
            session_price: sessionPricingMap[pricingId][0],
            abstract_price: sessionPricingMap[pricingId][1],
            price_label: sessionPricingMap[pricingId][2],
          });
        } else {
          groupIntermediateDispatchRequest.push({
            pricing_id: id++,
            scope: "group",
            sessions: requiredSession,
            groups: requiredGroup,
            session_price: sessionPricingMap[pricingId][0],
            abstract_price: sessionPricingMap[pricingId][1],
            price_label: sessionPricingMap[pricingId][2],
          });
        }
      }
      if (!isEmpty(tempPublicIntermediateDefaultDispatch)) {
        publicIntermediateDispatchRequest.push(
          tempPublicIntermediateDefaultDispatch
        );
      }

      let pricing_id = 0;
      //Generating final public dispatch object
      let publicDispatch = [];
      let publicPriceLabelMap = {};
      if (publicIntermediateDispatchRequest.length == 0) {
        let tempDispatch = {};
        tempDispatch["pricing_id"] = pricing_id++;
        tempDispatch["scope"] = "public";
        tempDispatch["session_price"] = 0;
        tempDispatch["abstract_price"] = 0;
        publicDispatch.push(tempDispatch);
      }
      publicIntermediateDispatchRequest.forEach(record => {
        if (record.price_label) {
          publicPriceLabelMap[record.price_label]
            ? publicPriceLabelMap[record.price_label].push(record)
            : (publicPriceLabelMap[record.price_label] = [record]);
        } else {
          publicPriceLabelMap["OTHERS"]
            ? publicPriceLabelMap["OTHERS"].push(record)
            : (publicPriceLabelMap["OTHERS"] = [record]);
        }
      });

      for (let priceLabel in publicPriceLabelMap) {
        let publicSessionPriceMap = {};
        let publicSessionsMap = {};
        publicPriceLabelMap[priceLabel].forEach(record => {
          if (publicSessionPriceMap[record.session_price]) {
            publicSessionPriceMap[record.session_price].push(record);
            if (record.sessions)
              publicSessionsMap[record.session_price].push(record.sessions);
          } else {
            publicSessionPriceMap[record.session_price] = [record];
            if (record.sessions)
              publicSessionsMap[record.session_price] = [record.sessions];
          }
        });
        for (let record in publicSessionPriceMap) {
          let tempDispatch = {};

          tempDispatch["pricing_id"] = pricing_id++;
          tempDispatch["scope"] = "public";
          tempDispatch["session_price"] = record;
          tempDispatch["abstract_price"] =
            publicSessionPriceMap[record][0].abstract_price;

          if (publicSessionsMap[record])
            tempDispatch["sessions"] = publicSessionsMap[record];

          tempDispatch["price_label"] =
            priceLabel == "OTHERS" ? "" : priceLabel;

          publicDispatch.push(tempDispatch);
        }
      }

      //Generating final attendee dispatch object
      let attendeeDispatch = [];
      let attendeePriceLabelMap = {};
      attendeeIntermediateDispatchRequest.forEach(record => {
        if (record.price_label) {
          attendeePriceLabelMap[record.price_label]
            ? attendeePriceLabelMap[record.price_label].push(record)
            : (attendeePriceLabelMap[record.price_label] = [record]);
        } else {
          attendeePriceLabelMap["OTHERS"]
            ? attendeePriceLabelMap["OTHERS"].push(record)
            : (attendeePriceLabelMap["OTHERS"] = [record]);
        }
      });

      for (let priceLabel in attendeePriceLabelMap) {
        let attendeeSessionPriceMap = {};
        let attendeeSessionsMap = {};
        let attendeeGroupsMap = {};
        attendeePriceLabelMap[priceLabel].forEach(record => {
          if (attendeeSessionPriceMap[record.session_price]) {
            attendeeSessionPriceMap[record.session_price].push(record);
            attendeeSessionsMap[record.session_price].push(record.sessions);
            attendeeGroupsMap[record.session_price].push(record.attendees);
          } else {
            attendeeSessionPriceMap[record.session_price] = [record];
            attendeeSessionsMap[record.session_price] = [record.sessions];
            attendeeGroupsMap[record.session_price] = [record.attendees];
          }
        });
        for (let record in attendeeSessionPriceMap) {
          attendeeDispatch.push({
            pricing_id: pricing_id++,
            scope: "attendee",
            session_price: record,
            //Assuming that each sessions in this list will have same price for each abstract
            abstract_price: attendeeSessionPriceMap[record][0].abstract_price,
            sessions: attendeeSessionsMap[record],
            attendees: removeDuplicates(attendeeGroupsMap[record], "ValueID"),
            price_label: priceLabel == "OTHERS" ? "" : priceLabel,
          });
        }
      }

      //Generating final group dispatch object
      let groupDispatch = [];
      let groupPriceLabelMap = {};
      groupIntermediateDispatchRequest.forEach(record => {
        if (record.price_label) {
          groupPriceLabelMap[record.price_label]
            ? groupPriceLabelMap[record.price_label].push(record)
            : (groupPriceLabelMap[record.price_label] = [record]);
        } else {
          groupPriceLabelMap["OTHERS"]
            ? groupPriceLabelMap["OTHERS"].push(record)
            : (groupPriceLabelMap["OTHERS"] = [record]);
        }
      });

      for (let priceLabel in groupPriceLabelMap) {
        let groupSessionPriceMap = {};
        let groupSessionsMap = {};
        let groupGroupsMap = {};
        groupPriceLabelMap[priceLabel].forEach(record => {
          if (groupSessionPriceMap[record.session_price]) {
            groupSessionPriceMap[record.session_price].push(record);
            groupSessionsMap[record.session_price].push(record.sessions);
            groupGroupsMap[record.session_price].push(record.groups);
          } else {
            groupSessionPriceMap[record.session_price] = [record];
            groupSessionsMap[record.session_price] = [record.sessions];
            groupGroupsMap[record.session_price] = [record.groups];
          }
        });

        for (let record in groupSessionPriceMap) {
          groupDispatch.push({
            pricing_id: pricing_id++,
            scope: "group",
            session_price: record,
            //Assuming that each sessions in this list will have same price for each abstract
            abstract_price: groupSessionPriceMap[record][0].abstract_price,
            sessions: groupSessionsMap[record],
            groups: removeDuplicates(groupGroupsMap[record], "GroupID"),
            price_label: priceLabel == "OTHERS" ? "" : priceLabel,
          });
        }
      }

      dispatch(
        requestStoreSessionPricing([
          ...publicDispatch,
          ...attendeeDispatch,
          ...groupDispatch,
        ])
      );
    }
    dispatch(requestNextStep());
  };

  const getGroupIDSessionID = key => {
    return key.split("|");
  };

  const removeDuplicates = (list, duplication_id) => {
    let uniqueList = [];
    let checker = [];

    list.forEach(element => {
      if (!checker.includes(element[duplication_id])) {
        uniqueList.push(element);
        checker.push(element[duplication_id]);
      }
    });

    return uniqueList;
  };
  const previousStep = () => {
    dispatch(requestPreviousStep());
  };

  const handleSessionBasePriceChange = e => {
    let session_base_price = { "public|Session": parseInt(e.target.value) };
    setSessionPricingMap(Object.assign(sessionPricingMap, session_base_price));
  };

  const handleAbstractBasePriceChange = e => {
    let abstract_base_price = { "public|Abstract": parseInt(e.target.value) };
    setSessionPricingMap(Object.assign(sessionPricingMap, abstract_base_price));
  };

  const openPricingModal = (record, type) => {
    pricingForm.resetFields();
    if (type === "new") {
      setProcessingPricing(record);
    }
    setIsPricingModalOpen(true);
    setIsProcessingSessionPricePaid(false);
    setIsProcessingAbstractPricePaid(false);
    setModalPricingType("");
  };

  const deleteTableRecord = record => {
    //Fetch all groupIDs
    let toDeleteGroupIDSessionIDs = [];
    if (record.type === "attendee") {
      allAttendeeGroups.forEach(attendee => {
        allSessions.forEach(session => {
          if (
            record.groupNames.includes(attendee.Rowlabel) &&
            record.sessionNames.includes(session.SessionName)
          ) {
            toDeleteGroupIDSessionIDs.push(
              `${attendee.ValueID}|${session.SessionID}`
            );
          }
        });
      });
    } else {
      allContactGroups.forEach(group => {
        allSessions.forEach(session => {
          if (
            record.groupNames.includes(group.GroupName) &&
            record.sessionNames.includes(session.SessionName)
          ) {
            toDeleteGroupIDSessionIDs.push(
              `${group.GroupID}|${session.SessionID}`
            );
          }
        });
      });
    }

    setSessionPricingMap(_.omit(sessionPricingMap, toDeleteGroupIDSessionIDs));
    setTableData(() => {
      let updatedTableData = [];
      tableData.forEach(tableRecord => {
        if (tableRecord.key !== record.key) {
          updatedTableData.push(tableRecord);
        }
      });
      return updatedTableData;
    });
  };

  const ModalOkHandler = async e => {
    e.preventDefault();
    if (
      modalPricingType === "pricing_type_group" &&
      processingPricing?.groupids?.length === 0
    ) {
      message.error("Select groups");
      return;
    }
    if (
      modalPricingType === "pricing_type_attendee" &&
      processingPricing?.attendees?.length === 0
    ) {
      message.error("Select registrations");
      return;
    }
    if (
      modalPricingType === "pricing_type_attendee" &&
      processingPricing?.sessionPrice > 0
    ) {
      message.error("Cannot set paid pricing for Attendee Scope");
      return;
    }
    if (!processingPricing.hasOwnProperty("sessionPrice")) {
      message.error("Enter Session Price");
      return;
    }
    if (sellAbstract && !processingPricing.hasOwnProperty("abstractPrice")) {
      message.error("Enter Abstract Price");
      return;
    }
    if (processingPricing.sessionids.length == 0) {
      message.error("Select at least 1 session");
      return;
    }

    if (modalPricingType === "pricing_type_group") {
      // Check the exiting record in map
      let conflictSessionGroupNames = [];
      let selectedGroups = {};
      processingPricing?.groupids.forEach(groupid => {
        processingPricing?.sessionids.forEach(sessionid => {
          if (sessionPricingMap?.hasOwnProperty(`${groupid}|${sessionid}`)) {
            conflictSessionGroupNames.push({
              group: groupsMap[groupid],
              session: sessionsMap[sessionid],
            });
          }
        });
      });

      if (_.isEmpty(conflictSessionGroupNames)) {
        let groupNames = [];
        let sessionNames = [];
        //No Conflicting Groups
        processingPricing?.groupids.forEach(groupid => {
          processingPricing?.sessionids.forEach(sessionid => {
            selectedGroups[`${groupid}|${sessionid}`] = [
              processingPricing.sessionPrice,
              processingPricing.abstractPrice
                ? processingPricing.abstractPrice
                : 0,
              processingPricing.price_label ?? "",
            ];
            if (!sessionNames.includes(sessionsMap[sessionid])) {
              sessionNames.push(sessionsMap[sessionid]);
            }
          });
          groupNames.push(groupsMap[groupid]);
        });

        const maxTableKey = _.max(tableData.map(rec => parseInt(rec.key)));
        setTableData([
          ...tableData,
          {
            key: _.isNumber(maxTableKey) ? maxTableKey + 1 : 0,
            groupNames: groupNames,
            sessionNames: sessionNames,
            sessionPrice: processingPricing.sessionPrice,
            abstractPrice: processingPricing.abstractPrice
              ? processingPricing.abstractPrice
              : 0,
            price_label: processingPricing.price_label ?? "",
            type: "group",
          },
        ]);

        setSessionPricingMap(Object.assign(sessionPricingMap, selectedGroups));
        setIsPricingModalOpen(false);
      } else {
        let conflictGroups = [];
        let conflictSessions = [];
        conflictSessionGroupNames.forEach(record => {
          if (!conflictGroups.includes(record.group)) {
            conflictGroups.push(record.group);
          }
          if (!conflictSessions.includes(record.session)) {
            conflictSessions.push(record.session);
          }
        });
        message.error(
          `Pricing conflict for ${conflictGroups} with ${conflictSessions} with existing selections.`
        );
      }
    }

    if (modalPricingType === "pricing_type_attendee") {
      // Check the exiting record in map
      let conflictSessionGroupNames = [];
      let selectedGroups = {};
      processingPricing?.attendees.forEach(valueid => {
        processingPricing?.sessionids.forEach(sessionid => {
          if (sessionPricingMap?.hasOwnProperty(`${valueid}|${sessionid}`)) {
            conflictSessionGroupNames.push({
              group: attendeeGroupsMap[valueid],
              session: sessionsMap[sessionid],
            });
          }
        });
      });

      if (_.isEmpty(conflictSessionGroupNames)) {
        let groupNames = [];
        let sessionNames = [];
        //No Conflicting Groups
        processingPricing?.attendees.forEach(valueid => {
          processingPricing?.sessionids.forEach(sessionid => {
            selectedGroups[`${valueid}|${sessionid}`] = [
              processingPricing.sessionPrice,
              processingPricing.abstractPrice
                ? processingPricing.abstractPrice
                : 0,
              processingPricing.price_label ?? "",
            ];
            if (!sessionNames.includes(sessionsMap[sessionid])) {
              sessionNames.push(sessionsMap[sessionid]);
            }
          });
          groupNames.push(attendeeGroupsMap[valueid]);
        });

        const maxTableKey = _.max(tableData.map(rec => parseInt(rec.key)));
        setTableData([
          ...tableData,
          {
            key: _.isNumber(maxTableKey) ? maxTableKey + 1 : 0,
            groupNames: groupNames,
            sessionNames: sessionNames,
            sessionPrice: processingPricing.sessionPrice,
            abstractPrice: processingPricing.abstractPrice
              ? processingPricing.abstractPrice
              : 0,
            type: "attendee",
            price_label: processingPricing.price_label ?? "",
          },
        ]);

        setSessionPricingMap(Object.assign(sessionPricingMap, selectedGroups));
        setIsPricingModalOpen(false);
      } else {
        let conflictGroups = [];
        let conflictSessions = [];
        conflictSessionGroupNames.forEach(record => {
          if (!conflictGroups.includes(record.group)) {
            conflictGroups.push(record.group);
          }
          if (!conflictSessions.includes(record.session)) {
            conflictSessions.push(record.session);
          }
        });
        message.error(
          `Pricing conflict for ${conflictGroups} with ${conflictSessions} with existing selections.`
        );
      }
    }

    if (modalPricingType === "pricing_type_public") {
      // Check the exiting record in map
      let conflictSessionGroupNames = [];
      let selectedGroups = {};

      processingPricing?.sessionids.forEach(sessionid => {
        if (sessionPricingMap?.hasOwnProperty(`public|${sessionid}`)) {
          conflictSessionGroupNames.push({
            group: "Default",
            session: sessionsMap[sessionid],
          });
        }
      });

      if (_.isEmpty(conflictSessionGroupNames)) {
        let groupNames = [];
        let sessionNames = [];
        //No Conflicting Groups

        processingPricing?.sessionids.forEach(sessionid => {
          selectedGroups[`public|${sessionid}`] = [
            processingPricing.sessionPrice,
            processingPricing.abstractPrice
              ? processingPricing.abstractPrice
              : 0,
            processingPricing.price_label ?? "",
          ];
          if (!sessionNames.includes(sessionsMap[sessionid])) {
            sessionNames.push(sessionsMap[sessionid]);
          }
        });
        groupNames.push("Default");

        const maxTableKey = _.max(tableData.map(rec => parseInt(rec.key)));

        setTableData([
          ...tableData,
          {
            key: _.isNumber(maxTableKey) ? maxTableKey + 1 : 0,
            groupNames: groupNames,
            sessionNames: sessionNames,
            sessionPrice: processingPricing.sessionPrice,
            abstractPrice: processingPricing.abstractPrice
              ? processingPricing.abstractPrice
              : 0,
            price_label: processingPricing.price_label ?? "",
            type: "public",
          },
        ]);

        setSessionPricingMap(Object.assign(sessionPricingMap, selectedGroups));
        setIsPricingModalOpen(false);
      } else {
        let conflictGroups = [];
        let conflictSessions = [];
        conflictSessionGroupNames.forEach(record => {
          if (!conflictGroups.includes(record.group)) {
            conflictGroups.push(record.group);
          }
          if (!conflictSessions.includes(record.session)) {
            conflictSessions.push(record.session);
          }
        });
        message.error(
          `Pricing conflict for ${conflictGroups} with ${conflictSessions} with existing selections.`
        );
      }
    }
  };

  const ModalCancelHandler = () => {
    setProcessingPricing({});
    pricingForm.resetFields();
    setIsPricingModalOpen(false);
  };

  const handleModalGroupChange = value => {
    setProcessingPricing({ ...processingPricing, groupids: value });
  };

  const handleModalAttendeeRegistrationChange = value => {
    setProcessingPricing({ ...processingPricing, attendees: value });
  };

  const handleModalPricingTypeChange = e => {
    setModalPricingType(e.target.value);
  };

  const handleModalSessionChange = value => {
    setProcessingPricing({ ...processingPricing, sessionids: value });
  };

  const handleModalSessionPriceChange = e => {
    setProcessingPricing({
      ...processingPricing,
      sessionPrice: e.target.value,
    });
  };

  const handleModalAbstractPriceChange = e => {
    setProcessingPricing({
      ...processingPricing,
      abstractPrice: e.target.value,
    });
  };

  const handleSessionBasePriceDropdownChange = value => {
    let session_base_price = {};

    if (value == "notForSale") {
      session_base_price = { "public|Session": -1 };
      setIsSessionBasePricePaid(false);
    }
    if (value == "freeOpenAccess") {
      session_base_price = { "public|Session": 0 };
      setIsSessionBasePricePaid(false);
    }
    if (value == "paid") {
      let paidprice = 1;
      session_base_price = { "public|Session": paidprice };
      setIsSessionBasePricePaid(true);
    }
    setSessionPricingMap(Object.assign(sessionPricingMap, session_base_price));
  };

  const handleAbstractBasePriceDropdownChange = value => {
    let abstract_base_price = {};

    if (value == "notForSale") {
      abstract_base_price = { "public|Abstract": -1 };
      setIsAbstractBasePricePaid(false);
    }
    if (value == "freeOpenAccess") {
      abstract_base_price = { "public|Abstract": 0 };
      setIsAbstractBasePricePaid(false);
    }
    if (value == "paid") {
      let paidprice = 1;
      abstract_base_price = { "public|Abstract": paidprice };
      setIsAbstractBasePricePaid(true);
    }
    setSessionPricingMap(Object.assign(sessionPricingMap, abstract_base_price));
  };

  const handleModalSessionPriceDropdownChange = value => {
    if (value == "notForSale") {
      setProcessingPricing({
        ...processingPricing,
        sessionPrice: -1,
      });
      setIsProcessingSessionPricePaid(false);
    }
    if (value == "freeOpenAccess") {
      setProcessingPricing({
        ...processingPricing,
        sessionPrice: 0,
      });
      setIsProcessingSessionPricePaid(false);
    }
    if (value == "paid") {
      if (
        processingPricing.sessionPrice &&
        processingPricing.sessionPrice > 0
      ) {
        setProcessingPricing({ ...processingPricing });
      } else {
        //Setting default price as $10
        setProcessingPricing({
          ...processingPricing,
          sessionPrice: 10,
        });
      }
      setIsProcessingSessionPricePaid(true);
    }
  };

  const handleModalAbstractPriceDropdownChange = value => {
    if (value == "notForSale") {
      setProcessingPricing({
        ...processingPricing,
        abstractPrice: -1,
      });
      setIsProcessingAbstractPricePaid(false);
    }
    if (value == "freeOpenAccess") {
      setProcessingPricing({
        ...processingPricing,
        abstractPrice: 0,
      });
      setIsProcessingAbstractPricePaid(false);
    }
    if (value == "paid") {
      if (
        processingPricing.abstractPrice &&
        processingPricing.abstractPrice > 0
      ) {
        setProcessingPricing({ ...processingPricing });
      } else {
        //Setting default price as $10
        setProcessingPricing({
          ...processingPricing,
          abstractPrice: 10,
        });
      }
      setIsProcessingAbstractPricePaid(true);
    }
  };
  const handleModalPriceLabelChange = e => {
    setProcessingPricing({ ...processingPricing, price_label: e.target.value });
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        padding: "2%",
      }}
    >
      {sellSession ? (
        <div>
          <div>
            <Alert
              message="Set Price for Session"
              description={headerDescription}
              type="info"
              showIcon
            />
            <br />
            <Space direction="vertical">
              Session Default Price:
              <Space direction="horizontal">
                <Select
                  style={{ width: "150px" }}
                  onChange={handleSessionBasePriceDropdownChange}
                  defaultValue={
                    defaultSessionBasePrice > 0
                      ? "paid"
                      : defaultSessionBasePrice === 0
                      ? "freeOpenAccess"
                      : "notForSale"
                  }
                >
                  <Option value="freeOpenAccess">Free/Open Access</Option>
                  <Option value="paid">Paid</Option>
                </Select>
                {isSessionBasePricePaid ? (
                  <Input
                    addonBefore="$"
                    id="session_base_price"
                    onChange={handleSessionBasePriceChange}
                    defaultValue={
                      defaultSessionBasePrice > 0 ? defaultSessionBasePrice : 1
                    }
                  />
                ) : (
                  <></>
                )}
              </Space>
            </Space>

            {sellAbstract ? (
              <div>
                <div>
                  <br />
                </div>
                <Space direction="vertical">
                  Presentation Default Price:
                  <Space direction="horizontal">
                    <Select
                      style={{ width: "150px" }}
                      onChange={handleAbstractBasePriceDropdownChange}
                      defaultValue={
                        defaultAbstractBasePrice > 0
                          ? "paid"
                          : defaultAbstractBasePrice === 0
                          ? "freeOpenAccess"
                          : "notForSale"
                      }
                    >
                      <Option value="freeOpenAccess">Free/Open Access</Option>
                      <Option value="paid">Paid</Option>
                    </Select>
                    {isAbstractBasePricePaid ? (
                      <Input
                        addonBefore="$"
                        id="abstract_base_price"
                        onChange={handleAbstractBasePriceChange}
                        defaultValue={
                          defaultAbstractBasePrice > 0
                            ? defaultAbstractBasePrice
                            : 1
                        }
                      />
                    ) : (
                      <></>
                    )}
                  </Space>
                </Space>
              </div>
            ) : (
              <div />
            )}
          </div>
          <div>
            <Button
              style={{ float: "right" }}
              type="primary"
              onClick={() =>
                openPricingModal(
                  {
                    sessionPrice: isProcessingSessionPricePaid ? 10 : 0,
                    abstractPrice: isProcessingAbstractPricePaid ? 10 : 0,
                  },
                  "new"
                )
              }
              disabled={isSessionBasePricePaid ? false : true}
            >
              + Add Special Pricing
            </Button>
            <Table columns={columns} dataSource={tableData} />
          </div>

          {isPricingModalOpen && (
            <Modal
              open={isPricingModalOpen}
              title="Set Special Pricing"
              onOk={ModalOkHandler}
              onCancel={ModalCancelHandler}
              footer={[
                <Button
                  key="Ok"
                  type="primary"
                  htmlType="submit"
                  onClick={ModalOkHandler}
                >
                  Submit
                </Button>,
                <Button key="cancel" onClick={ModalCancelHandler}>
                  Cancel
                </Button>,
              ]}
            >
              <>
                <Alert message={modalMessage} type="info" showIcon />
                <br />
                <Form
                  form={pricingForm}
                  // labelCol={{ span: 10 }}
                  // wrapperCol={{ span: 16 }}
                  layout="vertical"
                  name="pricingForm"
                  onFinish={ModalOkHandler}
                  onFinishFailed={ModalCancelHandler}
                >
                  <Form.Item
                    label="Session Names"
                    name="sessionnames"
                    rules={[
                      { required: true, message: "Please select Sessions" },
                    ]}
                  >
                    <TreeSelect
                      treeCheckable={true}
                      value={modalSelectedSessions}
                      onChange={handleModalSessionChange}
                      treeData={treeData}
                      showCheckedStrategy={SHOW_CHILD}
                      placeholder="Please select sessions to migrate"
                      // style={{ margin: "0 5%", width: "70%" }}
                      allowClear={true}
                      maxTagCount={5}
                    />
                  </Form.Item>

                  <Form.Item
                    label="Scope"
                    name="pricingType"
                    rules={[
                      {
                        required: true,
                        message: "Please select Pricing Type",
                      },
                    ]}
                  >
                    <Radio.Group onChange={handleModalPricingTypeChange}>
                      <Radio.Button value="pricing_type_group">
                        Groups
                      </Radio.Button>
                      <Radio.Button
                        value="pricing_type_attendee"
                        disabled={
                          processingPricing.hasOwnProperty("sessionPrice")
                            ? sellAbstract
                              ? processingPricing.sessionPrice <= 0 &&
                                processingPricing.abstractPrice <= 0
                                ? false
                                : true
                              : processingPricing.sessionPrice <= 0
                              ? false
                              : true
                            : false
                        }
                      >
                        Attendee
                      </Radio.Button>
                      <Radio.Button value="pricing_type_public">
                        Default
                      </Radio.Button>
                    </Radio.Group>
                  </Form.Item>

                  {modalPricingType == "pricing_type_group" ? (
                    <Form.Item
                      label="Group Names"
                      name="groupnames"
                      rules={[
                        {
                          required: true,
                          message: "Please select Group Names",
                        },
                      ]}
                    >
                      <Select
                        mode="multiple"
                        allowClear
                        style={{ width: "100%" }}
                        placeholder="Please select groups"
                        onChange={handleModalGroupChange}
                      >
                        {[...groupsDropdownOptions]}
                      </Select>
                    </Form.Item>
                  ) : (
                    <></>
                  )}

                  {modalPricingType == "pricing_type_attendee" ? (
                    <Form.Item
                      label="Main Registration Categories"
                      name="attendeeRegistrations"
                      rules={[
                        {
                          required: true,
                          message: "Please select Attendee Registrations",
                        },
                      ]}
                    >
                      <Select
                        mode="multiple"
                        allowClear
                        style={{ width: "100%" }}
                        placeholder="Please select registrations"
                        onChange={handleModalAttendeeRegistrationChange}
                      >
                        {[...attendeesDropdownOptions]}
                      </Select>
                    </Form.Item>
                  ) : (
                    <></>
                  )}
                  <Form.Item
                    label="Price Label"
                    name="priceLabel"
                    rules={[
                      {
                        message: "Please enter price label",
                      },
                    ]}
                  >
                    <Input
                      onChange={handleModalPriceLabelChange}
                      id="price_label"
                    />
                  </Form.Item>

                  <Divider orientation="left">Set Price</Divider>
                  {/* <Card> */}
                  <Form.Item
                    label="Session Price Type"
                    name="sessionPriceType"
                    rules={[
                      {
                        required: true,
                        message: "Please select Session Price Type",
                      },
                    ]}
                  >
                    <Select
                      style={{ width: "150px" }}
                      onChange={handleModalSessionPriceDropdownChange}
                      defaultValue="freeOpenAccess"
                    >
                      <Option value="freeOpenAccess">Free/Open Access</Option>
                      {modalPricingType != "pricing_type_attendee" ? (
                        <Option value="paid">Paid</Option>
                      ) : (
                        <></>
                      )}
                    </Select>
                  </Form.Item>

                  {isProcessingSessionPricePaid ? (
                    <Form.Item
                      label="Session Price"
                      name="sessionPrice"
                      rules={[
                        { required: true, message: "Please enter Price" },
                      ]}
                    >
                      <Input
                        onChange={handleModalSessionPriceChange}
                        addonBefore="$"
                        id="session_base_price"
                        defaultValue={10}
                      />
                    </Form.Item>
                  ) : (
                    <div />
                  )}

                  {sellAbstract ? (
                    <div>
                      <Form.Item
                        label="Presentation Price Type"
                        name="abstractPriceType"
                        rules={[
                          {
                            required: true,
                            message: "Please select Presentation Price Type",
                          },
                        ]}
                      >
                        <Select
                          style={{ width: "150px" }}
                          onChange={handleModalAbstractPriceDropdownChange}
                          defaultValue="freeOpenAccess"
                        >
                          <Option value="freeOpenAccess">
                            Free/Open Access
                          </Option>
                          {modalPricingType != "pricing_type_attendee" ? (
                            <Option value="paid">Paid</Option>
                          ) : (
                            <></>
                          )}
                        </Select>
                      </Form.Item>

                      {isProcessingAbstractPricePaid ? (
                        <Form.Item
                          label="Presentation Price"
                          name="AbstractPrice"
                          rules={[
                            { required: true, message: "Please enter Price" },
                          ]}
                        >
                          <Input
                            onChange={handleModalAbstractPriceChange}
                            addonBefore="$"
                            id="abstract_base_price"
                            defaultValue={10}
                          />
                        </Form.Item>
                      ) : (
                        <div />
                      )}
                    </div>
                  ) : (
                    <div />
                  )}
                  {/* </Card> */}
                  {modalPricingType == "pricing_type_public" ? (
                    <Form.Item>
                      <Alert
                        banner
                        message="This will override the default price for selected sessions"
                      ></Alert>
                    </Form.Item>
                  ) : (
                    <></>
                  )}
                </Form>
              </>
            </Modal>
          )}
        </div>
      ) : (
        <div>
          <Result title="You can skip this step as you have selected not to sell sessions." />
        </div>
      )}
      <br />
      <div>
        <Button
          type="primary"
          style={{ float: "right", marginRight: "15%" }}
          onClick={() => nextStep()}
        >
          Next
        </Button>
        <Popconfirm
          title="You may lose pricing configuration."
          visible={showPopConfirm}
          onConfirm={() => {
            setShowPopConfirm(false);
            previousStep();
          }}
          onCancel={() => setShowPopConfirm(false)}
        >
          <Button
            style={{ float: "right", marginRight: "2%" }}
            onClick={() => setShowPopConfirm(true)}
          >
            Previous
          </Button>
        </Popconfirm>
      </div>
    </div>
  );
};

export default SessionPricing;
