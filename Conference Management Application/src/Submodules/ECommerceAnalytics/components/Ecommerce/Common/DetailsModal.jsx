import React, { useState, useEffect, useRef } from "react";
import { Modal, Spin, Row, Col, Statistic } from "antd";
import { CloseOutlined, ArrowRightOutlined } from "@ant-design/icons";
import _isEmpty from "lodash/isEmpty";
import _map from "lodash/map";
import moment from "moment";
import { useDispatch, useSelector } from "react-redux";

import {
  handleAllMembersExport,
  sendEmailRequest
} from "../../../appRedux/actions/Reporting";
import {
  DEFAULT_DATE,
  PAGE_SIZE,
  HASH_DATA,
} from "../../../constants";
import { handleEmptyValue } from "../../../helpers/common";
import CustomTable from './CustomTable'
import { tableColumns } from "../Utils";

const DetailsModal = ({
  appdir = "",
  screen = "",
  sourceHex = "",
  visible = false,
  allLocationInfo = [],
  selectedItem = {},
  payload = {},
  fileName = {},
  handleClose = () => { },
  handleModalPagination = () => { },
  modelTitle,
  barChartData = {},
  tableColumnKey,
  tableData= [],
  tableLoading,
  handlePagination,
  page
}) => {

  const dispatch = useDispatch();
  const exportTableRef = useRef();
  const [dataSource, setDataSource] = useState([]);
  const [handleExportCsv, setHandleExportCsv] = useState(false);
  const [tableHeight, setTableHeight] = useState(window.innerHeight - 350);
  const [column, setColumn] = useState([]);

  const memberLoading = useSelector(state => state.reporting.loading) || false;
  const exportLoading = useSelector(state => state.reporting.processAllMembersExport) || false;
  const sendEmail = useSelector(state => state.reporting.sendEmail) || false;
  const memberData = useSelector(state => state.reporting?.allMemberInfo) || [];
  const processAllMembersExport =
    useSelector(state => state.reporting.processAllMembersExport) || false;
  const handleResize = () => { if (tableHeight >= 75) setTableHeight(window.innerHeight - 350) }
  const apiData = { screen, sourceHex }

  useEffect(() => {
    if (tableHeight < 75) setTableHeight(75)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    setColumn(tableColumns(tableColumnKey,appdir));
  },[tableColumnKey]);

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

  // const handleMemberData = (fromExport, fromMail) => {
  //   if (screen === LOCATION_REPORT_SCREEN) {
  //     dispatch(handleAllMembersExport(true));
  //   } else if (screen === TREND_SCREEN || screen === SALES_ACTIVITY_SCREEN) {
  //     dispatchMemberApi({
  //       uuids: selectedItem.UUIDs,
  //       exportCSV: fromExport,
  //       sendEmail: fromMail,
  //       ...apiData
  //     });
  //   } else {
  //     dispatchMemberApi({
  //       groupid: selectedItem.data.GroupID,
  //       detailed: 1,
  //       offset: 0,
  //       limit: selectedItem.value,
  //       exportCSV: fromExport,
  //       sendEmail: fromMail,
  //       ...apiData,
  //       ...payload,
  //     });
  //   }
  //   if (fromMail) {
  //     dispatch(sendEmailRequest(false));
  //   }
  // }

  // const handleMemberInfo = (val, pageSize) => {
  //   if (screen === LOCATION_REPORT_SCREEN) {
  //     handleModalPagination(val, pageSize)
  //   } else if (screen === TREND_SCREEN || screen === SALES_ACTIVITY_SCREEN) {
  //     dispatchMemberApi({
  //       ...apiData,
  //       uuids: selectedItem.UUIDs.slice(
  //         val * pageSize - pageSize,
  //         val * pageSize
  //       ),
  //     });
  //   } else {
  //     dispatchMemberApi({
  //       groupid: selectedItem.data.GroupID,
  //       detailed: 1,
  //       offset: val * pageSize - pageSize, limit: pageSize,
  //       ...payload,
  //       ...apiData
  //     });
  //   }
  // };

  // useEffect(() => {
  //   let exportData = screen === LOCATION_REPORT_SCREEN ? allLocationInfo : memberData;
  //   if ((sendEmail || processAllMembersExport) && exportData.length > 0) {
  //     setTimeout(() => {
  //       let reviewIds = _map(exportData, 'ReviewIDThisCustID').join();
  //       window.parent.postMessage({ reviewIds, type: sendEmail ? 'Email' : 'Download' }, '*')
  //       dispatch(sendEmailRequest(false));
  //       dispatch(handleAllMembersExport(false));
  //     }, 20)
  //   }
  // }, [sendEmail, processAllMembersExport])

  // useEffect(() => {
  //   if (processAllMembersExport) {
  //     setHandleExportCsv(processAllMembersExport);
  //   }
  // }, [processAllMembersExport]);
  // useEffect(() => {
  //   setHandleExportCsv(false)
  //   dispatch(handleAllMembersExport(false));
  //   dispatch(sendEmailRequest(false));
  // }, [])

  const constructMonth = () => {
    let content = ''
    if (modelTitle === 'File Views') {
      content = barChartData?.data?.month
    } else {
      let splitValue = barChartData?.data?.month.split(' - ');
      if (splitValue && splitValue.length) {
        content = `${splitValue[0]} ${splitValue[1]}`
      }
    }
    return content;
  }

  const renderHeader = () => {
    return (
      <Row className="text-center mb-3">
        <Col span={4}>
          <div className="ant-statistic">
            <div className="ant-statistic-title">Month</div>
            <div style={{ fontSize: 16, fontWeight: 600 }}>
              {constructMonth()}
            </div>
          </div>
        </Col>
        {modelTitle === 'File Views' && <Col span={4}>
          <Statistic title="File Type" value={barChartData?.id} valueStyle={{ fontSize: 16, fontWeight: 600 }} />
        </Col>
        }
      </Row>
    )
  }

  return (
    <Modal
      style={{ top: 20 }}
      closable={false}
      title={
        <div className="py-0 px-0 justify-space-between d-flex member-modal-header">
          <div className="member-modal-header-text">{modelTitle}</div>
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
            columns={column}
            tableData={tableData}
            selectedItem={selectedItem}
            exportCsv={false}
            loading={tableLoading}
            handlePagination={handlePagination}
            page={page}
            // handleMemberInfo={handleMemberInfo}
            // showSendEmail={true}
            // exportCsvInfo={{
            //   className: 'my-0 ml-4',
            //   memberData: screen === LOCATION_REPORT_SCREEN ? allLocationInfo : memberData,
            //   screen,
            //   handleExportCsv,
            //   exportTableRef,
            //   fileName,
            //   handleMemberDataExport: () => handleMemberData(true, false),
            //   headers: tableColumns.filter((_, inx) => inx !== 0 && inx !== tableColumns.length - 1),
            //   isDownload: true
            // }}
            // onSendEmail={() => handleMemberData(false, true)}
          />
        </div>
      </Spin>
    </Modal>
  );
};
export default DetailsModal;
