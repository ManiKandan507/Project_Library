import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import _map from 'lodash/map';
import _isEmpty from "lodash/isEmpty";
import _filter from 'lodash/filter';
import _slice from 'lodash/slice';
import { Col, Row, Progress, Spin, Tooltip,Tag } from 'antd';

import ActiveUserChart from './ActiveUserChart';
import BandwidthChart from './BandwidthChart';
import PopularFileDetails from './PopularFileDetails';
import ActiveUserDetails from './ActiveUserDetails';
import CardWrapper from "../Common/CardWrapper";
import { fileColumns, lineChartData, userColumns, userData, progressBarData } from '../Utils';
import RenderCard from "../Common/RenderCard";
import { fetchInsightDataRequest } from "../../../appRedux/actions";
import { get30PriorDate, getCurrentDate } from "../Common/Utils";
import { formatDate } from "../Common/Utils";
import { InfoCircleFilled } from "@ant-design/icons";

const DefaultHome = ({ appdir, sourceHex, primary_color }) => {
  const dispatch = useDispatch();

  const [dates, setDates] = useState([get30PriorDate(), getCurrentDate()]);
  const [constructedData, setConstructedData] = useState([]);

  const insightData = useSelector(
    (state) => state.reporting.insightData
  );

    console.log("insightData",insightData);

  const monthlyActiveUserData = useSelector(
    (state) => state.reporting.monthlyActiveUserData
  );

  const monthlyBandwidthData = useSelector(
    (state) => state.reporting.monthlyBandwidthData
  );

  const viewedFileLoading = useSelector(
    (state) => state.reporting.viewedFileLoading
  );

  const activeUserLoading = useSelector(
    (state) => state.reporting.activeUserLoading
  );

  const activeUsersData = useSelector(
    (state) => state.reporting.activeUsersData
  );

  useEffect(() => {
    dispatch(fetchInsightDataRequest({ appDir: appdir }))
  }, []);

  const handleDateFilter = (dateStrings) => {
    setDates([
      dateStrings?.[0] ? formatDate(dateStrings?.[0]) : "",
      dateStrings?.[1] ? formatDate(dateStrings?.[1]) : ""
    ]);
  }

  useEffect(() => {
    if (activeUsersData) {
      setConstructedData(_slice(_filter(activeUsersData, (data) => data.file_views > 0), 0, 10));
    }
  }, [activeUsersData]);

  const renderProgressBar = () => {
    return (
      <>
      {
        Object.keys(insightData).length>0 ? progressBarData(insightData).map((data=>{
          return(
            <>
            <div className="d-flex">
              <div className="card-title">{data.title}</div>
              <div className="ml-2 mr-2">
                <Tooltip title={data.title} placement="right" >
                  <InfoCircleFilled className="infoCircleFilled"/>
                </Tooltip>
              </div>
              <div className="ml-2">
              <Tag color={data.color} style={{borderRadius:"10px"}}>{`${(data.percentage).toFixed(2)}%`}</Tag>
              </div>
            </div>
            <div>
              <Progress
                strokeColor={{
                  '0%': '#57C019',
                  '100%': '#DF6418',
                }}
                percent={data.percentage}
                format={() => {
                  return (
                    <div className='text-center' style={{ fontSize: '15px', fontWeight: 'bold' }}>
                      {`${data.current} ${data.max ? `/ ${data.max} ${data.suffix}` : `${data.suffix}`}`}
                    </div>
                  )
                }}
                strokeWidth={6}
                showInfo={false}
              />
            </div>
            <div>
              <div style={{ color: primary_color, fontSize: "18px", fontWeight: 'bold' }}> {data.current} / {data.max} {data.suffix}</div>
            </div>
            </>
          )
        })):null
      }
      </>
    )
  }

  return (
    <>
    <Row>
      <Col span={4}>
        <Spin spinning={Object.keys(insightData).length>0 ? false : true} tip="Loading">
          <RenderCard type="home" data={insightData} primary_color={primary_color} />
          <div>
            {renderProgressBar()}
          </div>
        </Spin>
      </Col>
      <Col span={12} className="pl-2">
          <ActiveUserChart
            title="Monthly Active Users"
            activeTab="user"
            chartData={lineChartData('active_user', monthlyActiveUserData, 'No Of Users')}
            appdir={appdir}
            dates={dates}
            handleDateFilter={handleDateFilter}
          />
          <BandwidthChart
            title="Monthly Bandwidth Usage"
            activeTab="bandwidth"
            chartData={lineChartData('bandwidth', monthlyBandwidthData, "Bandwidth Usage")}
            appdir={appdir}
            dates={dates}
          />
      </Col>
      <Col span={8}>
            <ActiveUserDetails
              title="Most Active Users"
              activeTab='user'
              tableColumn={userColumns}
              tableData={userData(constructedData)}
              appdir={appdir}
              sourceHex={sourceHex}
              dates={dates}
              loading={activeUserLoading}
            />
            <PopularFileDetails
              title="Most Popular Files"
              activeTab='file'
              tableColumn={fileColumns}
              appdir={appdir}
              dates={dates}
              loading={viewedFileLoading}
            />
      </Col>
      </Row>
    </>
  );
};

export default DefaultHome;