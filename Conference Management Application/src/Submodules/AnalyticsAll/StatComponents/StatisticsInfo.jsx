import { Tag, Tooltip, Progress } from "antd";
import React, { useEffect, useState } from "react";
import { useStatistics } from "@/AnalyticsAll/StatComponents/hooks/StatisticsHook";
import { ReactComponent as Information } from '@/AnalyticsAll/NativeDashboards/ProductsAnalytics/assets/icons/Information.svg';
import { getRoundValue } from '@/AnalyticsAll/StatComponents/utils';
import CommonSpinner from '@/AnalyticsAll/StatComponents/common/CommonSpinner';

const Statistics = props => {
  const { appdir } = props.params
  const { statistics, loading } = useStatistics(appdir)
  const [constructData, setConstructData] = useState([])

  useEffect(() => {
    if (Object.keys(statistics).length > 0)
      setConstructData(cardData(statistics))
  }, [statistics])

  const cardData = (data) => [
    {
      title: 'Total Products',
      value: { Total: data.total_products },
    },
    {
      title: 'Total Files',
      value: { Total: data.total_files },
    },
    {
      title: 'Total Storage',
      value: { Total: `${getRoundValue(data.total_utilized_storage, 2)}`, Available: `${data.total_storage ? `/ ${data.total_storage} GB` : 'GB'}` },
    },
  ];

  const renderMonthlyActiveUser = () => {
    if (Object.keys(statistics).length > 0) {
      return <div className="mb-4 ml-4">
        <div className="pt-4 mt-5">
          <div className='d-flex justify-space-between' style={{ flexWrap: "wrap" }}>
            <div className='d-flex'>
              <div className="card-title">{"MONTHLY ACTIVE USERS"}</div>
              <div className="ml-2">
                <Tooltip title={"Monthly Active Users"} placement="right" >
                  <Information style={{ width: "1.3rem" }} />
                </Tooltip>
              </div>
            </div>
          </div>
          <div className='float-right'>
            <Tag color={Math.trunc((statistics.current_month_active_users / statistics.max_monthly_bandwidth * 100).toFixed(2)) >= 80 ? 'red' : 'green'} style={{ borderRadius: "10px" }}>{`${((statistics.current_month_active_users / statistics.max_monthly_bandwidth * 100).toFixed(2))}%`}</Tag>
          </div>
          <div className="mr-2">
            <Progress
              strokeColor={Math.trunc((statistics.current_month_active_users / statistics.max_monthly_bandwidth * 100).toFixed(2)) >= 80 ? 'red' : 'green'}
              percent={(statistics.current_month_active_users / statistics.max_monthly_bandwidth * 100).toFixed(2)}
              format={() => {
                return (
                  <div className='text-center' style={{ fontSize: '15px', fontWeight: 'bold' }}>
                    {`${statistics.current_month_active_users} ${statistics.max_monthly_users ? `/ ${statistics.max_monthly_users} ${'USERS'}` : `${'USERS'}`}`}
                  </div>
                )
              }}
              strokeWidth={6}
              showInfo={false}
            />
          </div>
          <div className="text-left progrssBarValue" style={{ fontWeight: '700' }}> {statistics.current_month_active_users} / <span style={{ fontWeight: 'normal' }}>{statistics.max_monthly_users} {'USERS'}</span></div>
        </div>
      </div>
    }
    return null
  }

  const renderTotalDetails = () => {
    if (constructData.length) {
      return <div className="d-flex justify-space-between mb-4 mt-6" style={{ flexWrap: "wrap" }}>
        {constructData.map((data, index) => {
          return (
            <div key={index} className="text-left mb-4 mr-2 ml-4 ">
              <div className="card-title">
                {data.title.toUpperCase()}
                <span className="ml-2">
                  <Tooltip title={data.title} placement="right">
                    <Information style={{ width: "1.3rem" }} />
                  </Tooltip>
                </span>
              </div>
              <div className="cardValues">
                {data.value.Total.toLocaleString()} <span style={{ fontWeight: 'normal' }}>{data.value.Available}</span>
              </div>
            </div>
          );
        })}
      </div>
    }
    return null
  }

  const renderMonthlyBandwidth = () => {
    if (Object.keys(statistics).length > 0) {
      return <>
        <div className='d-flex justify-space-between' style={{ flexWrap: "wrap" }}>
          <div className='d-flex'>
            <div className="ml-4 card-title">{'MONTHLY BANDWIDTH'}</div>
            <div className="ml-2">
              <Tooltip title={'Monthly Bandwidth'} placement="right" >
                <Information style={{ width: "1.3rem" }} />
              </Tooltip>
            </div>
          </div>
        </div>
        <div className='float-right'>
          <Tag color={Math.trunc((statistics.current_month_bandwidth / statistics.max_monthly_users * 100).toFixed(2)) >= 80 ? 'red' : 'green'} style={{ borderRadius: "10px" }}>{`${((statistics.current_month_bandwidth / statistics.max_monthly_users * 100).toFixed(2))}%`}</Tag>
        </div>
        <div className="ml-4 mr-2">
          <Progress
            strokeColor={Math.trunc((statistics.current_month_bandwidth / statistics.max_monthly_users * 100).toFixed(2)) >= 80 ? 'red' : 'green'}
            percent={(statistics.current_month_bandwidth / statistics.max_monthly_users * 100).toFixed(2)}
            format={() => {
              return (
                <div className='text-center' style={{ fontSize: '15px', fontWeight: 'bold' }}>
                  {`${getRoundValue(statistics.current_month_bandwidth, 2)} ${statistics.max_monthly_bandwidth ? `/ ${statistics.max_monthly_bandwidth} ${'GB'}` : `${'GB'}`}`}
                </div>
              )
            }}
            strokeWidth={6}
            showInfo={false}
          />
        </div>
        <div className="text-left progrssBarValue ml-4" style={{ fontWeight: '700' }}> {getRoundValue(statistics.current_month_bandwidth, 2)} / <span style={{ fontWeight: 'normal' }}>{statistics.max_monthly_bandwidth} {'GB'}</span></div>
      </>
    }
    return null
  }

  return (
    <CommonSpinner loading={loading} className="spinning">
      {renderMonthlyActiveUser()}
      {renderMonthlyBandwidth()}
      {renderTotalDetails()}
    </CommonSpinner>
  )
}


export default Statistics