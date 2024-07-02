/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Button,
  Spin,
  Select,
  Form,
  Radio,
  Alert,
  message,
  Divider,
  Input,
} from "antd";
import {
  requestNextStep,
  requestConferences,
  requestStores,
  requestStoreSelectedConference,
  requestConfMenus,
  requestLoadingConfMenus,
} from "../../appRedux/actions/Wizard";
import "./custom.css";
import { PlusOutlined, InfoCircleFilled } from "@ant-design/icons";
const { Option } = Select;
const _ = require("lodash");
const SelectConference = props => {
  const dispatch = useDispatch();
  const [conferenceSelectList, setConferenceSelectList] = useState(
    <Select></Select>
  );
  const [storeSelectList, setStoreSelectList] = useState(<Select></Select>);
  const [attenMenuSelectList, setAttenMenuSelectList] = useState(
    <Select></Select>
  );
  const [showSellAbstract, setShowSellAbstract] = useState(false);
  const [showSellCustomBundle, setShowSellCustomBundle] = useState(false);
  const stateConfig = useSelector(state => state.wizard.config);

  const [selectedOptions, setSelectedOptions] = useState({
    conference: stateConfig.conference ? stateConfig.conference : "",
    store: stateConfig.store ? stateConfig.store : "",
    sell_session: stateConfig.sell_session ? stateConfig.sell_session : null,
    abstract_tag: stateConfig.abstract_tag ? stateConfig.abstract_tag : "true",
    sell_abstract: stateConfig.sell_abstract
      ? stateConfig.sell_abstract
      : "false",
    menu: stateConfig.menu ? stateConfig.menu : null,
    create_custom_bundle: stateConfig.create_custom_bundle
      ? stateConfig.create_custom_bundle
      : "false",
    include_evaluation_credit: stateConfig.include_evaluation_credit
      ? stateConfig.include_evaluation_credit
      : "true",
  });

  const conferenceList = useSelector(
    state => state.wizard.select_conference.conferences
  );
  const conferences_fetched = useSelector(
    state => state.wizard.select_conference.conferences_fetched
  );

  const attenMenuList = useSelector(
    state => state.wizard.select_conference.menus
  );
  const menus_fetched = useSelector(
    state => state.wizard.select_conference.menus_fetched
  );
  const [newAttenMenuName, setNewAttenMenuName] = useState("");

  const [addNewMenuInputValue, setAddNewMenuInputValue] = useState("");
  const storeList = useSelector(state => state.wizard.select_conference.stores);
  const stores_fetched = useSelector(
    state => state.wizard.select_conference.stores_fetched
  );
  const [conferenceForm] = Form.useForm();

  useEffect(() => {
    let finalList = [];
    conferenceList.forEach(conf => {
      finalList.push(
        <Option value={conf.ConferenceID}> {conf.Confname} </Option>
      );
    });

    setConferenceSelectList(finalList);
  }, [conferenceList]);

  useEffect(() => {
    let finalList = [];
    storeList.forEach(store => {
      finalList.push(
        <Option value={store.StoreID}> {store.Eventname} </Option>
      );
    });

    setStoreSelectList(finalList);
  }, [storeList]);

  useEffect(() => {
    let finalList = [];
    attenMenuList.forEach(menu => {
      if (menu.ScreenType === "Custom") {
        finalList.push(<Option value={menu.MenuID}> {menu.Button} </Option>);
      }
    });
    if (stateConfig.menu && stateConfig.menu.MenuID == "new") {
      finalList.push(<Option value="new"> {stateConfig.menu.Button} </Option>);
    }
    setAttenMenuSelectList(finalList);
  }, [attenMenuList]);

  useEffect(() => {
    if (!conferences_fetched) {
      //Request conference List
      dispatch(requestConferences(props.sourceHex));
    }
    if (!stores_fetched) {
      //Request store List
      dispatch(requestStores(props.sourceHex));
    }
  });

  const handleConferenceMenuClick = value => {
    if (value) {
      for (let confitr = 0; confitr < conferenceList.length; confitr++) {
        if (conferenceList[confitr].ConferenceID === value) {
          setSelectedOptions({
            ...selectedOptions,
            conference: conferenceList[confitr],
          });
          break;
        }
      }
    }
  };

  const handleStoreMenuClick = value => {
    if (value) {
      for (let storeitr = 0; storeitr < storeList.length; storeitr++) {
        if (storeList[storeitr].StoreID === value) {
          setSelectedOptions({
            ...selectedOptions,
            store: storeList[storeitr],
          });
          dispatch(requestLoadingConfMenus(true));
          dispatch(
            requestConfMenus({
              sourceHex: props.sourceHex,
              ConfID: storeList[storeitr].ConfID,
            })
          );
          break;
        }
      }
    }
  };

  const handleAttenMenuSelected = value => {
    if (value) {
      if (value == "new") {
        setSelectedOptions({
          ...selectedOptions,
          menu: { MenuID: "new", Button: newAttenMenuName },
        });
      } else {
        for (let menuitr = 0; menuitr < attenMenuList.length; menuitr++) {
          if (attenMenuList[menuitr].MenuID === value) {
            setSelectedOptions({
              ...selectedOptions,
              menu: attenMenuList[menuitr],
            });
            break;
          }
        }
      }
    }
  };

  const handleNewAttendMenuChange = e => {
    setNewAttenMenuName(e.target.value);
    setAddNewMenuInputValue(e.target.value);
  };
  const addNewAttenMenu = () => {
    let finalList = [];
    attenMenuList.forEach(menu => {
      if (menu.ScreenType === "Custom") {
        finalList.push(<Option value={menu.MenuID}> {menu.Button} </Option>);
      }
    });

    finalList.push(<Option value="new"> {newAttenMenuName} </Option>);
    setAddNewMenuInputValue("");
    setAttenMenuSelectList(finalList);
  };

  const sellSessionChangeHandler = e => {
    if (e) {
      setSelectedOptions({ ...selectedOptions, sell_session: e.target.value });

      setShowSellAbstract(e.target.value === "true" ? true : false);
      setShowSellCustomBundle(e.target.value === "true" ? true : false);
    }
  };

  const sellAbstractChangeHandler = e => {
    if (e) {
      setSelectedOptions({ ...selectedOptions, sell_abstract: e.target.value });
    }
  };
  const includeEvaluationCreditChangeHandler = e => {
    if (e) {
      setSelectedOptions({
        ...selectedOptions,
        include_evaluation_credit: e.target.value,
      });
    }
  };

  const createCustomBundleChangeHandler = e => {
    if (e) {
      setSelectedOptions({
        ...selectedOptions,
        create_custom_bundle: e.target.value,
      });
    }
  };

  const abstractTagChangeHandler = e => {
    if (e) {
      setSelectedOptions({ ...selectedOptions, abstract_tag: e.target.value });
    }
  };

  const submitSelectConferenceForm = () => {
    if (
      selectedOptions.conference &&
      selectedOptions.store &&
      selectedOptions.sell_session &&
      selectedOptions.abstract_tag &&
      selectedOptions.create_custom_bundle
    ) {
      if (
        selectedOptions.conference.headerLogo &&
        selectedOptions.conference.TemplateName
      ) {
        selectedOptions.conference.header_image =
          selectedOptions.conference.headerLogo.includes("http")
            ? selectedOptions.conference.headerLogo
            : `https://xcdsystem.com/${props.appdir}/images/${selectedOptions.conference.TemplateName}/${selectedOptions.conference.headerLogo}`;
      }

      dispatch(requestStoreSelectedConference(selectedOptions));
      dispatch(requestNextStep());
    } else {
      let selection = [];
      if (_.isEmpty(selectedOptions.conference)) {
        selection.push("Conference");
      }

      if (_.isEmpty(selectedOptions.store)) {
        selection.push("Store");
      }
      if (_.isEmpty(selectedOptions.menu)) {
        selection.push("Menu");
      }

      if (!selectedOptions.sell_session) {
        selection.push("Sell Session");
      }

      if (!selectedOptions.abstract_tag) {
        selection.push("Abstract Tag");
      }

      if (!selectedOptions.sell_abstract) {
        selection.push("Sell Abstract");
      }

      message.error(`Please select ${selection}`);
    }
  };

  return conferences_fetched && stores_fetched ? (
    <div>
      {storeList.length === 0 ? (
        <Alert
          message="No Stores Found"
          description={
            <div>
              Create a store
              <a
                href={`https://www.xcdsystem.com/${props.appdir}/admin/conference/index.cfm?NewConf=1&store=1`}
                target="_blank"
                rel="noreferrer"
              >
                {` here`}
              </a>
            </div>
          }
          type="error"
          showIcon
          style={{ marginRight: "5%", marginLeft: "5%" }}
        />
      ) : (
        <Form
          form={conferenceForm}
          name="conferenceForm"
          layout="horizontal"
          onFinish={submitSelectConferenceForm}
          labelCol={{ span: 10 }}
          wrapperCol={{ span: 8, push: 1 }}
          initialValues={{
            conference: selectedOptions.conference
              ? selectedOptions.conference.Confname
              : "",
            store: selectedOptions.store ? selectedOptions.store.Eventname : "",
            sell_session: selectedOptions.sell_session ?? "",
            abstract_tag: selectedOptions.abstract_tag ?? "",
            sell_abstract: selectedOptions.sell_abstract
              ? selectedOptions.sell_abstract
              : "false",
            create_custom_bundle: selectedOptions.create_custom_bundle
              ? selectedOptions.create_custom_bundle
              : "false",
            menu: selectedOptions.menu ? selectedOptions.menu.Button : "",
            include_evaluation_credit: selectedOptions.include_evaluation_credit
              ? selectedOptions.include_evaluation_credit
              : "true",
          }}
        >
          <Form.Item
            name="conference"
            label="Select Event"
            rules={[{ required: true }]}
            onChange={handleConferenceMenuClick}
          >
            <Select
              allowClear
              placeholder="Select Event"
              onChange={handleConferenceMenuClick}
              showSearch
              filterOption={(input, option) => {
                return (
                  option.children[1]
                    .toLowerCase()
                    .indexOf(input.toLowerCase()) >= 0
                );
              }}
            >
              {conferenceSelectList}
            </Select>
          </Form.Item>
          <Form.Item
            name="store"
            label="Select Store"
            rules={[{ required: true }]}
            onChange={handleStoreMenuClick}
          >
            <Select
              allowClear
              placeholder="Select Store"
              onChange={handleStoreMenuClick}
            >
              {storeSelectList}
            </Select>
          </Form.Item>

          {menus_fetched && selectedOptions.conference?.ConferenceID ? (
            <Form.Item
              name="menu"
              label="Select/Create Category"
              rules={[{ required: true }]}
              tooltip={{
                title:
                  "Pick or create a category to organize the products within your store",
                icon: <InfoCircleFilled />,
              }}
              // onChange={handleAttenMenuSelected}
            >
              <Select
                allowClear
                placeholder="Select Category"
                onChange={handleAttenMenuSelected}
                loading={!menus_fetched}
                dropdownRender={menu => (
                  <div>
                    {menu}
                    <Divider style={{ margin: "4px 0" }} />
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "nowrap",
                        padding: 8,
                      }}
                    >
                      <Input
                        style={{ flex: "auto" }}
                        onChange={handleNewAttendMenuChange}
                        value={addNewMenuInputValue}
                      />
                      <a
                        style={{
                          flex: "none",
                          padding: "8px",
                          display: "block",
                          cursor: "pointer",
                        }}
                        onClick={addNewAttenMenu}
                      >
                        <PlusOutlined /> Add New
                      </a>
                    </div>
                  </div>
                )}
              >
                {attenMenuSelectList}
              </Select>
            </Form.Item>
          ) : (
            <></>
          )}
          {/* <Form.Item
            label=" Do you want to copy over the session & abstract tags to the product?"
            name="abstract_tag"
            rules={[{ required: true }]}
            style={{ textJustify: "auto" }}
          >
            <Radio.Group onChange={abstractTagChangeHandler}>
              <Radio.Button value="true">Yes</Radio.Button>
              <Radio.Button value="false">No</Radio.Button>
            </Radio.Group>
          </Form.Item> */}
          <Form.Item
            label="Do you want to sell access to individual sessions?"
            name="sell_session"
            rules={[{ required: true }]}
          >
            <Radio.Group onChange={sellSessionChangeHandler}>
              <Radio.Button value="true">Yes</Radio.Button>
              <Radio.Button value="false">No</Radio.Button>
            </Radio.Group>
          </Form.Item>
          {showSellAbstract ? (
            <>
              <Form.Item
                label=" Do you want to sell access to specific individual presentations?"
                name="sell_abstract"
                style={{ textJustify: "auto" }}
              >
                <Radio.Group onChange={sellAbstractChangeHandler}>
                  <Radio.Button value="true">Yes</Radio.Button>
                  <Radio.Button value="false">No</Radio.Button>
                </Radio.Group>
              </Form.Item>
              <Form.Item
                label=" Do you want to include session evaluations and credits?"
                name="include_evaluation_credit"
                style={{ textJustify: "auto" }}
              >
                <Radio.Group onChange={includeEvaluationCreditChangeHandler}>
                  <Radio.Button value="true">Yes</Radio.Button>
                  <Radio.Button value="false">No</Radio.Button>
                </Radio.Group>
              </Form.Item>
            </>
          ) : (
            <></>
          )}
          {showSellCustomBundle ? (
            <Form.Item
              label=" Do you want to create custom Bundle?"
              name="create_custom_bundle"
              style={{ textJustify: "auto" }}
            >
              <Radio.Group onChange={createCustomBundleChangeHandler}>
                <Radio.Button value="true">Yes</Radio.Button>
                <Radio.Button value="false">No</Radio.Button>
              </Radio.Group>
            </Form.Item>
          ) : (
            <></>
          )}

          <Form.Item style={{ marginInlineStart: "80%" }}>
            <Button type="primary" htmlType="submit">
              Next
            </Button>
          </Form.Item>
        </Form>
      )}
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

export default SelectConference;
