import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Button,
  Spin,
  Input,
  Space,
  Table,
  Tag,
  Modal,
  Form,
  Select,
  message,
  Tooltip,
  Alert,
  Radio,
  Upload,
} from "antd";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { DeleteOutlined, UploadOutlined } from "@ant-design/icons";
import {
  requestNextStep,
  requestPreviousStep,
  requestContactGroups,
  requestStoreConferencePricing,
  requestUpdateConferenceDetails,
  requestAttendeeGroups,
  requestUploadToS3,
} from "../../appRedux/actions/Wizard";
import "./custom.css";
const { Option } = Select;
const _ = require("lodash");
const ConferencePricing = props => {
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

  const stateConfig = useSelector(state => state.wizard.config);
  const stateConferencePricing = useSelector(
    state => state.wizard.conference_pricing
  );
  let [conferencePricingMap, setConferencePricingMap] = useState({});
  let [conferenceGroupPriceLabelMap, setConferenceGroupPriceLabelMap] =
    useState({});
  let [conferenceAttendeePricingMap, setConferenceAttendeePricingMap] =
    useState({});
  let [conferenceAttendeePriceLabelMap, setConferenceAttendeePriceLabelMap] =
    useState({});

  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [processingPricing, setProcessingPricing] = useState({});
  const [groupsDropdownOptions, setGroupsDropdownOptions] = useState([]);
  const [attendeesDropdownOptions, setAttendeesDropdownOptions] = useState([]);
  const [groupsMap, setGroupsMap] = useState({});
  const [attendeeGroupsMap, setAttendeeGroupsMap] = useState({});
  const [modalPricingType, setModalPricingType] = useState("");
  const [tableData, setTableData] = useState([]);
  const [pricingForm] = Form.useForm();
  const [conferenceDescription, setConferenceDescription] = useState(
    stateConfig.conference.Conf_description
  );
  const [uploading, setUploading] = useState(false);
  let [defaultBasePrice] = useState(() => {
    let basePrice = 0;
    stateConfig.conference_pricing.forEach(pricing => {
      if (pricing.scope === "public") {
        basePrice = parseInt(pricing.price);
      }
    });
    return parseInt(basePrice);
  });

  const [isBasePricePaid, setIsBasePricePaid] = useState(
    defaultBasePrice > 0 ? true : false
  );

  const [isProcessingPricePaid, setIsProcessingPricePaid] = useState(true);
  const headerDescription = (
    <p>
      Set a default price for the entire event (including all sessions and
      presentations)
      <br /> <strong>Free/Open</strong> = Available for anyone
      <br /> <strong>Paid </strong>= Items must be purchased in order to view
      <br /> After creating a default price, you can set Special Pricing to
      allow certain types of people access to the content for different prices
      or make it free.
    </p>
  );
  const modalMessage = (
    <p>
      Create custom pricing for contacts in specific groups in your system, or
      based on registration selections for this past event.
      <br /> You can create as many special pricing rules as you would like.
    </p>
  );
  const columns = [
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
  useEffect(() => {
    if (!contact_groups_fetched) {
      //Request Contact Groups
      dispatch(
        requestContactGroups({
          appdir: props.appdir,
        })
      );
    }
    if (!attendee_groups_fetched) {
      //Request Contact Groups
      dispatch(
        requestAttendeeGroups({
          sourceHex: props.sourceHex,
          ConferenceID: stateConfig.conference.ConferenceID,
        })
      );
    }
  });

  useEffect(() => {
    let pricingMap = {};
    let attendeePricingMap = {};
    let initialTableData = [];
    let groupPriceLabelMap = {};
    let attendeePriceLabelMap = {};

    stateConfig.conference_pricing.forEach(pricing => {
      if (pricing.scope === "public") {
        pricingMap["public"] = pricing.price;
      } else if (pricing.scope === "attendee") {
        let attendeeGroupNames = [];
        pricing.attendees.forEach(group => {
          attendeePricingMap[group.ValueID] = pricing.price;
          attendeeGroupNames.push(group.Rowlabel);
          attendeePriceLabelMap[group.ValueID] = pricing.price_label ?? "";
        });
        initialTableData.push({
          key: pricing.pricing_id,
          groupNames: attendeeGroupNames,
          price: pricing.price,
          type: "attendee",
          price_label: pricing.price_label ?? "",
        });
        pricingMap["attendee"] = pricing.price;
      } else if (pricing.scope === "group") {
        let groupNames = [];
        pricing.groups.forEach(group => {
          pricingMap[group.GroupID] = pricing.price;
          groupNames.push(group.GroupName);
          groupPriceLabelMap[group.GroupID] = pricing.price_label ?? "";
        });
        initialTableData.push({
          key: pricing.pricing_id,
          groupNames: groupNames,
          price: pricing.price,
          price_label: pricing.price_label ?? "",
        });
      } else {
        return false;
      }
    });

    setTableData(initialTableData);
    setConferencePricingMap(pricingMap);
    setConferenceAttendeePricingMap(attendeePricingMap);
    setConferenceGroupPriceLabelMap(groupPriceLabelMap);
    setConferenceAttendeePriceLabelMap(attendeePriceLabelMap);
  }, [stateConfig.conference_pricing]);

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

  useEffect(() => {
    if (stateConferencePricing.image_url !== "") {
      setUploading(false);
    }
  }, [stateConferencePricing.image_url]);

  const nextStep = () => {
    if (uploading) {
      message.info("Upload in Progress. Please wait.");
      return false;
    }
    let dispatchRequest = [];
    let id = 0;
    let priceGroupMap = {};
    let attendeePriceGroupMap = {};

    for (let pricingId in conferencePricingMap) {
      if (pricingId === "public") {
        dispatchRequest.push({
          pricing_id: id++,
          scope: "public",
          price: conferencePricingMap[pricingId],
        });
      } else {
        let requiredGroup = {};
        allContactGroups.forEach(group => {
          if (group.GroupID == pricingId) {
            requiredGroup = group;
            return;
          }
        });
        if (priceGroupMap[conferencePricingMap[pricingId]]) {
          priceGroupMap[conferencePricingMap[pricingId]].push(requiredGroup);
        } else {
          priceGroupMap[conferencePricingMap[pricingId]] = [requiredGroup];
        }
      }
    }

    for (let pricingId in conferenceAttendeePricingMap) {
      let requiredGroup = {};
      allAttendeeGroups.forEach(attendee => {
        if (attendee.ValueID == pricingId) {
          requiredGroup = attendee;
          return;
        }
      });
      if (attendeePriceGroupMap[conferenceAttendeePricingMap[pricingId]]) {
        attendeePriceGroupMap[conferenceAttendeePricingMap[pricingId]].push(
          requiredGroup
        );
      } else {
        attendeePriceGroupMap[conferenceAttendeePricingMap[pricingId]] = [
          requiredGroup,
        ];
      }
    }

    for (let price in priceGroupMap) {
      let tempGroupPriceLabelMap = {};
      priceGroupMap[price].forEach(group => {
        if (conferenceGroupPriceLabelMap[group.GroupID]) {
          tempGroupPriceLabelMap[conferenceGroupPriceLabelMap[group.GroupID]]
            ? tempGroupPriceLabelMap[
                conferenceGroupPriceLabelMap[group.GroupID]
              ].push(group)
            : (tempGroupPriceLabelMap[
                conferenceGroupPriceLabelMap[group.GroupID]
              ] = [group]);
        } else {
          tempGroupPriceLabelMap["OTHERS"]
            ? tempGroupPriceLabelMap["OTHERS"].push(group)
            : (tempGroupPriceLabelMap["OTHERS"] = [group]);
        }
      });
      for (let priceLabel in tempGroupPriceLabelMap) {
        if (priceLabel === "OTHERS") {
          dispatchRequest.push({
            pricing_id: id++,
            scope: "group",
            groups: tempGroupPriceLabelMap[priceLabel],
            price: price,
            price_label: "",
          });
        } else {
          dispatchRequest.push({
            pricing_id: id++,
            scope: "group",
            groups: tempGroupPriceLabelMap[priceLabel],
            price: price,
            price_label: priceLabel,
          });
        }
      }
    }

    for (let price in attendeePriceGroupMap) {
      let tempAttendeePriceLabelMap = {};
      attendeePriceGroupMap[price].forEach(att => {
        if (conferenceAttendeePriceLabelMap[att.ValueID]) {
          tempAttendeePriceLabelMap[
            conferenceAttendeePriceLabelMap[att.ValueID]
          ]
            ? tempAttendeePriceLabelMap[
                conferenceAttendeePriceLabelMap[att.ValueID]
              ].push(att)
            : (tempAttendeePriceLabelMap[
                conferenceAttendeePriceLabelMap[att.ValueID]
              ] = [att]);
        } else {
          tempAttendeePriceLabelMap["OTHERS"]
            ? tempAttendeePriceLabelMap["OTHERS"].push(att)
            : (tempAttendeePriceLabelMap["OTHERS"] = [att]);
        }
      });
      for (let priceLabel in tempAttendeePriceLabelMap) {
        if (priceLabel === "OTHERS") {
          dispatchRequest.push({
            pricing_id: id++,
            scope: "attendee",
            attendees: tempAttendeePriceLabelMap[priceLabel],
            price: price,
            price_label: "",
          });
        } else {
          dispatchRequest.push({
            pricing_id: id++,
            scope: "attendee",
            attendees: tempAttendeePriceLabelMap[priceLabel],
            price: price,
            price_label: priceLabel,
          });
        }
      }
    }
    //Adding the default selection for default price
    if (!dispatchRequest.map(request => request.scope).includes("public")) {
      dispatchRequest.push({
        pricing_id: id++,
        scope: "public",
        price: "0",
      });
    }

    dispatch(requestStoreConferencePricing(dispatchRequest));
    dispatch(
      requestUpdateConferenceDetails({
        description: conferenceDescription,
        image_url: stateConferencePricing.image_url,
      })
    );
    dispatch(requestNextStep());
  };

  const previousStep = () => {
    dispatch(requestPreviousStep());
  };

  const handleBasePriceChange = e => {
    let base_price = { public: parseInt(e.target.value) };
    setConferencePricingMap(Object.assign(conferencePricingMap, base_price));
  };

  const handleConfDescriptionChange = e => {
    setConferenceDescription(e);
  };

  const handleBasePriceDropdownChange = value => {
    let base_price = {};
    if (value == "notForSale") {
      base_price = { public: -1 };
      setIsBasePricePaid(false);
    }
    if (value == "freeOpenAccess") {
      base_price = { public: 0 };
      setIsBasePricePaid(false);
    }
    if (value == "paid") {
      let paidprice = 1;
      base_price = { public: paidprice };
      setIsBasePricePaid(true);
    }
    setConferencePricingMap(Object.assign(conferencePricingMap, base_price));
  };

  const handleModalPriceDropdownChange = value => {
    if (value == "notForSale") {
      setProcessingPricing({ ...processingPricing, price: -1 });
      setIsProcessingPricePaid(false);
    }
    if (value == "freeOpenAccess") {
      setProcessingPricing({ ...processingPricing, price: 0 });
      setIsProcessingPricePaid(false);
    }
    if (value == "paid") {
      if (processingPricing.price && processingPricing.price > 0) {
        setProcessingPricing({ ...processingPricing });
      } else {
        //Setting default price as $10
        setProcessingPricing({ ...processingPricing, price: 10 });
      }
      setIsProcessingPricePaid(true);
    }
  };

  const openPricingModal = (record, type) => {
    pricingForm.resetFields();
    if (type === "new") {
      setProcessingPricing(record);
    }
    setIsPricingModalOpen(true);
    setIsProcessingPricePaid(true);
    setModalPricingType("");
  };

  const deleteTableRecord = record => {
    //Fetch all groupIDs
    if (record.type === "attendee") {
      let toDeleteAttendee = [];
      allAttendeeGroups.forEach(attendee => {
        if (record.attendees.includes(attendee.ValueID)) {
          toDeleteAttendee.push(attendee.Rowlabel);
        }
      });
      setConferenceAttendeePricingMap(
        _.omit(conferenceAttendeePricingMap, toDeleteAttendee)
      );
    } else {
      let toDeleteGroupIDs = [];
      allContactGroups.forEach(group => {
        if (record.groupNames.includes(group.GroupName)) {
          toDeleteGroupIDs.push(group.GroupID);
        }
      });

      setConferencePricingMap(_.omit(conferencePricingMap, toDeleteGroupIDs));
    }

    setTableData(() => {
      let updatedTableData = [];
      tableData.forEach(tableRecord => {
        //TODO: what if the groupID and attendee ValueID is same. This will fail
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
    if (!processingPricing.hasOwnProperty("price")) {
      message.error("Enter Price");
      return;
    }
    // Check the exiting record in map

    if (modalPricingType === "pricing_type_group") {
      let conflictGroupNames = [];
      let selectedGroups = {};
      let selectedPriceLabelMap = {};
      processingPricing?.groupids.forEach(groupid => {
        if (conferencePricingMap?.hasOwnProperty(groupid)) {
          conflictGroupNames.push(groupsMap[groupid]);
        }
      });

      if (_.isEmpty(conflictGroupNames)) {
        let groupNames = [];
        //No Conflicting Groups
        processingPricing?.groupids.forEach(groupid => {
          selectedGroups[groupid] = processingPricing.price;
          selectedPriceLabelMap[groupid] = processingPricing.price_label ?? "";
          groupNames.push(groupsMap[groupid]);
        });

        const maxTableKey = _.max(tableData.map(rec => parseInt(rec.key)));
        setTableData([
          ...tableData,
          {
            key: _.isNumber(maxTableKey) ? maxTableKey + 1 : 0,
            groupNames: groupNames,
            price: processingPricing.price,
            price_label: processingPricing.price_label ?? "",
          },
        ]);

        setConferencePricingMap(
          Object.assign(conferencePricingMap, selectedGroups)
        );
        setConferenceGroupPriceLabelMap(
          Object.assign(conferenceGroupPriceLabelMap, selectedPriceLabelMap)
        );
        setIsPricingModalOpen(false);
      } else {
        message.error(
          `Pricing conflict for ${conflictGroupNames} with existing selections.`
        );
      }
    }

    if (modalPricingType === "pricing_type_attendee") {
      let conflictAttendees = [];
      let selectedAttendees = {};
      let selectedAttendeePriceLabelMap = {};
      processingPricing?.attendees.forEach(valueID => {
        if (conferenceAttendeePricingMap?.hasOwnProperty(valueID)) {
          conflictAttendees.push(attendeeGroupsMap[valueID]);
        }
      });

      if (_.isEmpty(conflictAttendees)) {
        let groupNames = [];
        //No Conflicting Groups
        processingPricing?.attendees.forEach(valueid => {
          selectedAttendees[valueid] = processingPricing.price;
          selectedAttendeePriceLabelMap[valueid] =
            processingPricing.price_label ?? "";
          groupNames.push(attendeeGroupsMap[valueid]);
        });
        const maxTableKey = _.max(tableData.map(rec => parseInt(rec.key)));
        setTableData([
          ...tableData,
          {
            key: _.isNumber(maxTableKey) ? maxTableKey + 1 : 0,
            groupNames: groupNames,
            price: processingPricing.price,
            type: "attendee",
            price_label: processingPricing.price_label ?? "",
          },
        ]);

        setConferenceAttendeePricingMap(
          Object.assign(conferenceAttendeePricingMap, selectedAttendees)
        );
        setConferenceAttendeePriceLabelMap(
          Object.assign(
            conferenceAttendeePriceLabelMap,
            selectedAttendeePriceLabelMap
          )
        );
        setIsPricingModalOpen(false);
      } else {
        message.error(
          `Pricing conflict for ${conflictAttendees} with existing selections.`
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

  const handleModalPriceChange = e => {
    setProcessingPricing({ ...processingPricing, price: e.target.value });
  };

  const handleModalPriceLabelChange = e => {
    setProcessingPricing({ ...processingPricing, price_label: e.target.value });
  };

  const handleUploadConferenceImage = files => {
    if (files.fileList.length === 0) {
      //deleted the file placed for uploading
      dispatch(
        requestUploadToS3({
          key: "",
          file: "",
          "Content-Type": "image/*",
        })
      );
      return true;
    } else if (files.fileList.length > 1) {
      message.error("Maximum 1 image can be selected");
      return false;
    } else if (
      stateConferencePricing.image_url &&
      stateConferencePricing.image_url !== ""
    ) {
      message.error("Please delete the exiting image to replace");
      return false;
    }
    const key = `${props.appdir}/companies/files/${(Math.random() + 1)
      .toString(36)
      .substring(7)}_${files.fileList[0].name}`;
    setUploading(true);
    dispatch(
      requestUploadToS3({
        key: key,
        file: files,
        "Content-Type": "image/*",
      })
    );
  };

  return contact_groups_fetched && attendee_groups_fetched ? (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        padding: "2%",
      }}
    >
      <div>
        <Alert
          message="Set Price for Entire Event"
          description={headerDescription}
          type="info"
          showIcon
        />
        <br />
      </div>
      <div>
        <Space direction="vertical">
          Default Price:
          <Space direction="horizontal">
            <Select
              style={{ width: "150px" }}
              onChange={handleBasePriceDropdownChange}
              defaultValue={
                defaultBasePrice > 0
                  ? "paid"
                  : defaultBasePrice === 0
                  ? "freeOpenAccess"
                  : "notForSale"
              }
            >
              <Option value="notForSale">Not for Sale</Option>
              <Option value="freeOpenAccess">Free/Open Access</Option>
              <Option value="paid">Paid</Option>
            </Select>
            {isBasePricePaid ? (
              <Input
                placeholder="Enter Price"
                addonBefore="$"
                id="base_price"
                onChange={handleBasePriceChange}
                defaultValue={defaultBasePrice > 0 ? defaultBasePrice : 1}
              />
            ) : (
              <></>
            )}
          </Space>
        </Space>
        <div>
          <br />
          <Space direction="vertical">
            Event Description:
            <ReactQuill
              theme="snow"
              value={conferenceDescription}
              style={{ width: "600px" }}
              onChange={handleConfDescriptionChange}
            />
          </Space>
        </div>
        <div>
          <br />
          <Space direction="vertical">
            Event Image:
            <Upload
              name="conference_image_upload"
              accept=".jpg,.png,.jpeg"
              maxCount={1}
              multiple={false}
              defaultFileList={
                stateConfig.conference.image_url
                  ? [
                      {
                        url: stateConfig.conference.image_url,
                        name: "Conference Image",
                        uid: -1,
                        status: "done",
                      },
                    ]
                  : []
              }
              beforeUpload={file => {
                if (!file.type.includes("image/")) {
                  message.error(`${file.name} is not a image file`);
                }
                return false;
              }}
              onChange={handleUploadConferenceImage}
            >
              <Button icon={<UploadOutlined />} loading={uploading}>
                Click to Upload
              </Button>
            </Upload>
          </Space>
        </div>
      </div>
      <div>
        <Button
          style={{ float: "right" }}
          type="primary"
          onClick={() => openPricingModal({}, "new")}
          // disabled={isBasePricePaid ? false : true}
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
                label="Price Type"
                name="priceType"
                rules={[{ required: true, message: "Please select Type" }]}
              >
                <Select
                  style={{ width: "150px" }}
                  onChange={handleModalPriceDropdownChange}
                  defaultValue="paid"
                >
                  <Option value="freeOpenAccess">Free/Open Access</Option>
                  <Option value="paid">Paid</Option>
                </Select>
              </Form.Item>
              {isProcessingPricePaid ? (
                <Form.Item
                  label="Price"
                  name="price"
                  rules={[{ required: true, message: "Please enter Price" }]}
                >
                  <Input
                    onChange={handleModalPriceChange}
                    addonBefore="$"
                    id="base_price"
                  />
                </Form.Item>
              ) : (
                <div />
              )}
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
                  <Radio.Button value="pricing_type_group">Groups</Radio.Button>
                  <Radio.Button
                    value="pricing_type_attendee"
                    disabled={processingPricing.price <= 0 ? false : true}
                  >
                    Attendee
                  </Radio.Button>
                </Radio.Group>
              </Form.Item>
              {modalPricingType == "pricing_type_group" ? (
                <Form.Item
                  label="Group Names"
                  name="groupnames"
                  rules={[
                    { required: true, message: "Please select Group Names" },
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
            </Form>
          </>
        </Modal>
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
        <Button
          style={{ float: "right", marginRight: "2%" }}
          onClick={() => previousStep()}
        >
          Previous
        </Button>
      </div>
    </div>
  ) : (
    <div>
      <Spin
        size="large"
        style={{
          marginTop: "5%",
          marginLeft: "50%",
        }}
      />
    </div>
  );
};

export default ConferencePricing;
