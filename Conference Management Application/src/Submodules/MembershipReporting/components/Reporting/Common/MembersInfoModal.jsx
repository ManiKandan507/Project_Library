import React, { useState, useEffect, useRef } from "react";
import { Modal, Spin, Row, Col, Statistic, Button } from "antd";
import { CloseOutlined, ArrowRightOutlined } from "@ant-design/icons";
import _isEmpty from "lodash/isEmpty";
import _map from "lodash/map";
import moment from "moment";
import { useDispatch, useSelector } from "react-redux";

import {
  getMemberDetailsRequest,
  handleAllMembersExport,
  fetchLocationCountryRequest,
  sendEmailRequest,
} from "../../../appRedux/actions/Reporting";
import {
  DEFAULT_DATE,
  PAGE_SIZE,
  SALES_ACTIVITY_SCREEN,
  TREND_SCREEN,
  HASH_DATA,
  LOCATION_REPORT_SCREEN,
  CURRENT_MEMBERS_SCREEN,
  EXPIRED_MEMBERS_SCREEN,
  NEW_MEMBERS_SCREEN,
  RENEWING_MEMBERS_SCREEN,
  TRANSITION_SCREEN,
} from "../../../constants";
import { handleEmptyValue } from "../../../helpers/common";
import CustomTable from "./CustomTable";

const MembersInfoModal = ({
  appdir = "",
  screen = "",
  sourceHex = "",
  visible = false,
  membersInfo = [],
  allLocationInfo = [],
  selectedItem = {},
  payload = {},
  fileName = {},
  handleClose = () => {},
  handleModalPagination = () => {},
}) => {
  const dispatch = useDispatch();
  const exportTableRef = useRef();
  const [dataSource, setDataSource] = useState(membersInfo);
  const [handleExportCsv, setHandleExportCsv] = useState(false);
  const [tableHeight, setTableHeight] = useState(window.innerHeight - 350);

  const memberLoading = useSelector(state => state.reporting.loading) || false;
  const exportLoading =
    useSelector(state => state.reporting.processAllMembersExport) || false;
  const sendEmail = useSelector(state => state.reporting.sendEmail) || false;
  const memberData = useSelector(state => state.reporting?.allMemberInfo) || [];
  const processAllMembersExport =
    useSelector(state => state.reporting.processAllMembersExport) || false;
  const handleResize = () => {
    if (tableHeight >= 75) setTableHeight(window.innerHeight - 350);
  };
  const apiData = { screen, sourceHex };
  useEffect(() => {
    if (tableHeight < 75) setTableHeight(75);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!_isEmpty(membersInfo)) {
      setDataSource(membersInfo);
    }
  }, [membersInfo]);
  const memberImg = (url, data) => {
    let image_url = "";
    if (url && url.startsWith("http")) {
      image_url = url;
    } else {
      url = "default-avatar.png";
      image_url = `https://ui-avatars.com/api/?background=0D8ABC&color=fff&name=${data.Firstname}%20${data.Lastname}`;
    }
    return <img src={image_url} className="member-img" />;
  };
  const columns = [
    {
      title: <span className="text-center">Contact ID</span>,
      dataIndex: "ReviewIDThisCustID",
      label: "Contact ID",
      key: "ReviewIDThisCustID",
      render: val => <span>{handleEmptyValue(val)}</span>,
    },
    {
      title: <span className="text-center">Profile</span>,
      dataIndex: "Picture",
      key: "Picture",
      render: (url, data) => memberImg(url, data),
    },
    {
      label: "First Name",
      title: <span className="text-center">First name</span>,
      dataIndex: "Firstname",
      key: "Firstname",
      render: val => <span>{handleEmptyValue(val)}</span>,
    },
    {
      title: <span className="text-center">Last Name</span>,
      dataIndex: "Lastname",
      label: "Last Name",
      key: "Lastname",
      render: val => <span>{handleEmptyValue(val)}</span>,
    },
    {
      title: <span className="text-center">Organization</span>,
      dataIndex: "Company",
      label: "Organization",
      key: "Company",
      render: val => <span>{handleEmptyValue(val)}</span>,
    },
    {
      title: <span className="text-center">E-mail</span>,
      dataIndex: "Email",
      label: "E-mail",
      key: "Email",
      render: val => <span>{handleEmptyValue(val)}</span>,
    },
    {
      title: <span className="text-center">Member Join Date</span>,
      dataIndex: "MemberJoinDate",
      label: "Member Join Date",
      key: "MemberJoinDate",
      render: date => (
        <div className="text-center">
          {moment(date).isValid() ? moment(date).format(DEFAULT_DATE) : "-"}
        </div>
      ),
    },
    {
      title: <span className="text-center">Action</span>,
      dataIndex: "ReviewIDThisCustID",
      key: "",
      render: custId =>
        appdir && custId ? (
          <Button
            target="_blank"
            href={`https://www.xcdsystem.com/${appdir}/admin/contacts/managecontacts/index.cfm?CFGRIDKEY=${custId}`}
          >
            Manage
          </Button>
        ) : (
          "-"
        ),
    },
  ];
  const dispatchMemberApi = payload => {
    dispatch(getMemberDetailsRequest(payload));
  };
  const handleMemberData = (fromExport, fromMail) => {
    if (screen === LOCATION_REPORT_SCREEN) {
      dispatch(handleAllMembersExport(true));
    } else if (screen === TREND_SCREEN || screen === TRANSITION_SCREEN || screen === SALES_ACTIVITY_SCREEN) {
      dispatchMemberApi({
        uuids: selectedItem.UUIDs,
        exportCSV: fromExport,
        sendEmail: fromMail,
        ...apiData,
      });
    } else {
      dispatchMemberApi({
        groupid: selectedItem.data.GroupID,
        detailed: 1,
        offset: 0,
        limit: selectedItem.value,
        exportCSV: fromExport,
        sendEmail: fromMail,
        ...apiData,
        ...payload,
      });
    }
    if (fromMail) {
      dispatch(sendEmailRequest(false));
    }
  };
  const handleMemberInfo = (val, pageSize) => {
    if (screen === LOCATION_REPORT_SCREEN) {
      handleModalPagination(val, pageSize);
    } else if (screen === TREND_SCREEN || screen === TRANSITION_SCREEN  || screen === SALES_ACTIVITY_SCREEN) {
      dispatchMemberApi({
        ...apiData,
        uuids: selectedItem.UUIDs.slice(
          val * pageSize - pageSize,
          val * pageSize
        ),
      });
    } else {
      dispatchMemberApi({
        groupid: selectedItem.data.GroupID,
        detailed: 1,
        offset: val * pageSize - pageSize,
        limit: pageSize,
        ...payload,
        ...apiData,
      });
    }
  };
  useEffect(() => {
    let exportData =
      screen === LOCATION_REPORT_SCREEN ? allLocationInfo : memberData;
    if ((sendEmail || processAllMembersExport) && exportData.length > 0) {
      setTimeout(() => {
        let reviewIds = _map(exportData, "ReviewIDThisCustID").join();
        window.parent.postMessage(
          { reviewIds, type: sendEmail ? "Email" : "Download" },
          "*"
        );
        dispatch(sendEmailRequest(false));
        dispatch(handleAllMembersExport(false));
      }, 20);
    }
  }, [sendEmail, processAllMembersExport]);
  useEffect(() => {
    if (processAllMembersExport) {
      setHandleExportCsv(processAllMembersExport);
    }
  }, [processAllMembersExport]);
  useEffect(() => {
    setHandleExportCsv(false);
    dispatch(handleAllMembersExport(false));
    dispatch(sendEmailRequest(false));
  }, []);

  const getGroupName = () => {
    let leftSide = "";
    let rightSide = "";
    let middleIcon = "";
    const { isTable, groupTitle, source, target, selectedValue, icon } =
      selectedItem;
    if (isTable) {
      leftSide = groupTitle;
      rightSide = selectedValue;
    } else {
      if (!_isEmpty(source) || !_isEmpty(target)) {
        leftSide = source.name;
        rightSide = target.name;
      } else {
        leftSide = groupTitle;
      }
    }

    if (isTable) {
      middleIcon = `: `;
    } else if (icon) {
      middleIcon = (
        <ArrowRightOutlined
          style={{ fontSize: "15px", marginLeft: "10px", marginRight: "10px" }}
        />
      );
    }
    return (
      <span>
        {leftSide}
        {middleIcon} {rightSide}
      </span>
    );
  };
  const renderHeader = () => {
    let colSpan =
      screen === SALES_ACTIVITY_SCREEN || screen === LOCATION_REPORT_SCREEN
        ? 6
        : 8;
    return (
      <Row justify="space-between" className="text-center mb-3">
        {screen !== LOCATION_REPORT_SCREEN && (
          <Col span={colSpan}>
            <div class="ant-statistic">
              <div class="ant-statistic-title">Group Name</div>
              <div class="ant-statistic-content">
                <span class="ant-statistic-content-value">
                  <span class="ant-statistic-content-value-int">
                    {getGroupName()}
                  </span>
                </span>
              </div>
            </div>
          </Col>
        )}
        <Col span={colSpan}>
          <Statistic title="Total Count" value={selectedItem?.value} />
        </Col>
        {screen === LOCATION_REPORT_SCREEN && (
          <>
            {selectedItem?.country && (
              <Col span={colSpan}>
                <Statistic title="Country" value={selectedItem?.country} />
              </Col>
            )}
            {selectedItem?.state && (
              <Col span={colSpan}>
                <Statistic title="State" value={selectedItem?.state} />
              </Col>
            )}
            {selectedItem?.continent && (
              <Col span={colSpan}>
                <Statistic title="Continent" value={selectedItem?.continent} />
              </Col>
            )}
            {selectedItem?.region && (
              <Col span={colSpan}>
                <Statistic title="Region" value={selectedItem?.region} />
              </Col>
            )}
          </>
        )}
        {screen === SALES_ACTIVITY_SCREEN && (
          <Col span={colSpan}>
            <Statistic
              title="Total Revenue"
              value={selectedItem?.revenue ? selectedItem?.revenue : "$0"}
            />
          </Col>
        )}
        <Col span={colSpan}>
          <Statistic title="Report Type" value={HASH_DATA[screen] ?? ""} />
        </Col>
      </Row>
    );
  };

  return (
    <Modal
      style={{ top: 20 }}
      closable={false}
      title={
        <div className="py-0 px-0 justify-space-between d-flex member-modal-header">
          <div className="member-modal-header-text">Member Details</div>
          <div className="">
            <CloseOutlined
              className="gx-mt-0 close-icon-x"
              onClick={handleClose}
            />
          </div>
        </div>
      }
      footer={null}
      width={1100}
      open={visible}
      onCancel={handleClose}
      bodyStyle={{ paddingTop: 15 }}
    >
      <Spin spinning={memberLoading} size="large">
        <div>
          {renderHeader()}
          <CustomTable
            className="my-1"
            scroll={{ x: 768, y: tableHeight }}
            defaultPagination={false}
            columns={columns}
            tableData={dataSource}
            selectedItem={selectedItem}
            handleMemberInfo={handleMemberInfo}
            showSendEmail={true}
            exportCsvInfo={{
              className: "my-0 ml-4",
              memberData:
                screen === LOCATION_REPORT_SCREEN
                  ? allLocationInfo
                  : memberData,
              screen,
              handleExportCsv,
              exportTableRef,
              fileName,
              handleMemberDataExport: () => handleMemberData(true, false),
              headers: columns.filter(
                (_, inx) => inx !== 0 && inx !== columns.length - 1
              ),
              isDownload: screen === CURRENT_MEMBERS_SCREEN ? false : true,
            }}
            onSendEmail={() => handleMemberData(false, true)}
          />
        </div>
      </Spin>
    </Modal>
  );
};
export default MembersInfoModal;
