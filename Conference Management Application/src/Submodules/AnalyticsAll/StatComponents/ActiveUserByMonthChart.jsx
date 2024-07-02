import React, { useState, useMemo, useCallback, useEffect, createRef } from 'react'
import { Avatar, Badge, Modal, Radio, Tabs, Input, Select } from 'antd'
import _orderBy from 'lodash/orderBy';
import { UserOutlined } from '@ant-design/icons'
import { useMonthlyActiveUser } from '@/AnalyticsAll/StatComponents/hooks/MonthlyActiveUserHook'
import { useActiveUserByMonthChart } from '@/AnalyticsAll/StatComponents/hooks/ActiveUserByMonthChartHook'
import CustomResponsiveBarChart from '@/AnalyticsAll/StatComponents/common/CustomResponsiveBarChart'
import { constructData, convertLowercaseFormat, formatDate, get90PriorDate, getCurrentDate, searchBasedOnName, sortName, sortNumbers } from '@/AnalyticsAll/StatComponents/utils'
import LabelOutside from '@/AnalyticsAll/StatComponents/common/LabelOutside'
import { LEGENDS_KEYS } from '@/AnalyticsAll/constants'
import { ActiveUserByUser } from '@/AnalyticsAll/StatComponents/ActiveUserByUser'
import CommonTable from '@/AnalyticsAll/StatComponents/common/CommonTable';
import CustomExportCsv from '@/AnalyticsAll/StatComponents/common/CustomExportCsv';
import CommonSpinner from '@/AnalyticsAll/StatComponents/common/CommonSpinner';
import DownloadChart from "@/AnalyticsAll/StatComponents/common/DownloadChart";
import { DatePicker } from "antd";
import { calculateMonthDays } from './utils';
import moment from 'moment';

const { TabPane } = Tabs
const { Option } = Select;
const { RangePicker } = DatePicker;

export const ActiveUserByMonthChart = (props) => {
  const { params: { appdir, primary_color } } = props
  const chartReference = createRef()
  const [dataSource, setDataSource] = useState([]);
  const [selectedMonthData, setSelectedMonthData] = useState();
  const [userBarChartData, setUserBarChartData] = useState({});
  const [contactUuid, setContactUuid] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [navigate, setNavigate] = useState(true)
  const [dates, setDates] = useState([get90PriorDate(), getCurrentDate()]);
  const [periodHeader, setPeriodHeader] = useState([]);
  const [isQuarterView, setIsQuarterView] = useState(false);
  const [isYearView, setIsYearView] = useState(false);
  const [active, setActive] = useState("Month");
  const [period, setPeriod] = useState("Month")
  let { activeUser: monthlyActiveUserData, ChartLoading } = useMonthlyActiveUser(appdir, dates , period)
  let { selectedBarChartUserData: monthChartTableData } = useActiveUserByMonthChart({ appdir, dates, contactUuid })

  useEffect(() => {
    if(active === 'Month'){
      setDates([get90PriorDate(), getCurrentDate()])
      setPeriod("Month")
    } else if(active === "Year"){
      setDates([moment().startOf('year').subtract(1, "year").format('DD/MM/YYYY'), getCurrentDate()])
      setPeriod("Year")
    } else{
      setDates([moment().startOf('quarter').subtract(1, "quarter").format('DD/MM/YYYY'),getCurrentDate()])
      setPeriod('Quarter')
    }
  }, [active])
  

  const userColumns = [
    {
      title: 'Name',
      dataIndex: 'user',
      key: 'user',
      className: 'text-left',
      render: (text, data) => {
        return (
          <div className="d-flex flex-row align-center">
            <Avatar size={40} alt="profile" icon={<UserOutlined />} src={data?.Picture} />
            <div style={{ marginLeft: '1rem', fontSize: '16px' }}>
              {data?.Firstname} {data?.Lastname}
            </div>
          </div>
        )
      },
      sorter: sortName

    },
    {
      title: 'Files Accessed',
      dataIndex: 'file_views',
      key: 'file_views',
      className: 'text-left',
      render: (_, data) => {
        return <div style={{ fontSize: '16px' }}>{data.file_views}</div>
      },
      sorter: (obj1, obj2) => sortNumbers(obj1, obj2, 'file_views'),
    },
  ];

  const ActiveUserByMonthColumns = [
    {
      title: isQuarterView ? 'QUARTER': isYearView ? 'YEAR': 'MONTHS',
      dataIndex: 'month',
      key: 'month',
      ellipsis: true,
      render: (_, data) => {
        return <div className='d-flex'>{data.month}</div>
      }
    },
    {
      title: 'USERS',
      dataIndex: 'user',
      key: 'user',
      render: (text, data) => {
        return (
          <div className='d-flex userDatas'>
            <div onClick={() => handleModalClick(data)} className='userCount'>{data.user}</div>
          </div>
        )
      }
    },
  ];
  useEffect(() => {
    if (dates.length) {
      let byPeriodHeaders = [
        { label: `MONTHS (${dates[0]} to ${dates[1]})`, key: "month" },
        { label: "FILES", key: "user" },
      ];
      setPeriodHeader(byPeriodHeaders);
    }
  }, [dates])

  const userTableHeaders = [
    { label: "Name", key: "user" },
    { label: "Files Accessed", key: "file_accessed" },
  ]

  const handleModalClick = (tableData) => {
    if (tableData && tableData?.contactUUIDs.length) {
      setContactUuid(tableData?.contactUUIDs)
    }
    setShowModal(true)
  }

  const handleBarChart = (chartData) => {
    if (chartData?.data && chartData?.data?.contactUUIDs.length) {
      setContactUuid(chartData?.data?.contactUUIDs);
    }
    setShowModal(true)
    setUserBarChartData(chartData);
  }

  useMemo(() => {
    if (monthChartTableData?.length > 0) {
      setDataSource(monthChartTableData);
      setSelectedMonthData(monthChartTableData)
    }
  }, [monthChartTableData])

  const handleonCloseModal = () => {
    setShowModal(false)
    setDataSource([])
    setContactUuid([])
    setSelectedMonthData([])
  }

  const handleClick = (e) => {
    let periodView;
    if (e.target.value === 'chart') {
      periodView = true;
    } else {
      periodView = false;
    }
    setNavigate(periodView)
  }
  const handleDate = useCallback((value, dateStrings) => {
    if(isQuarterView){
      setDates([
        formatDate(moment(value?.[0])),
        formatDate(moment(value?.[1]).add(2,'months').endOf('months'))
      ])
    } else if (isYearView) {
      setDates([ 
        formatDate(dateStrings?.[0]),
        formatDate(moment(dateStrings?.[1]).endOf('year'))]);
    } else {
      setDates([
        formatDate(dateStrings?.[0]),
        formatDate (moment(dateStrings?.[1]).endOf('months')),
      ]);
    }
  }, [dates]);

  const handleSearch = (searchValue) => {
    searchValue = convertLowercaseFormat(searchValue.target.value)
    let searchResult = []
    if (searchValue) {
      searchResult = searchBasedOnName(selectedMonthData, searchValue)
    } else {
      searchResult = selectedMonthData
    }
    setDataSource(searchResult)
  }

const barChartData = useMemo(() => {
    const type = 'active_user'
    const data = monthlyActiveUserData
    const axisValue = { xAxisValue: 'month', yAxisValue: 'user' }
    let orderedData = [];
    if (data && data.length) {
      orderedData = _orderBy(data, ['YearOfAccess', (item) => parseInt(item.MonthOfAccess)], ['asc', 'asc']);
    }

    return constructData(
      type,
      orderedData,
      axisValue.xAxisValue,
      axisValue.yAxisValue,
      axisValue.viewChartType,
      active,
      true,
    )
  }, [monthlyActiveUserData])


  const renderModal = () => {
    if (showModal) {
      return <Modal
        title="Users"
        open={showModal}
        onCancel={handleonCloseModal}
        footer={null}
        width="50%"
      >
        <div className="d-flex py-5">
          <Input
            placeholder="Search"
            onChange={handleSearch}
            allowClear
            className="mr-3"
          ></Input>
          <CustomExportCsv
            dataSource={dataSource.map(data => {
              return {
                user: `${data.Firstname} ${data.Lastname}`,
                file_accessed: data.file_views,
              };
            })}
            Headers={userTableHeaders}
            userData={monthChartTableData}
            exportFileName="By PeriodUsers"
          />
        </div>
        <CommonTable
          dataSource={dataSource}
          columns={userColumns}
          loading={selectedMonthData?.length > 0 ? false : true}
          scroll={{ y: 250 }}
          pagination={false}
          className="userModal "
        />
      </Modal>
    }
    return null
  }

  const renderTable = () => {
    return <CommonSpinner loading={ChartLoading}>
      <div className="pa-5 ml-8 sm-w-100 xlg-w-80" style={{ width: "55%" }}>
        <CommonTable
          dataSource={barChartData}
          columns={ActiveUserByMonthColumns}
          pagination={false}
          className="userTableHead"
          scroll={{ y: 250 }}
          loading={false}
        />
        {renderModal()}
      </div>
    </CommonSpinner>
  }

  const renderChart = () => {
    return <CommonSpinner loading={ChartLoading}>
      <div style={{ width: "95%" }} className='sm-w-100 xlg-w-80'>
        <CustomResponsiveBarChart
          data={barChartData}
          appdir={appdir}
          indexBy="month"
          axisBottom={{ legendOffset: 50 }}
          axisLeft={{ legend: "Active Users" }}
          keys={LEGENDS_KEYS?.BY_MONTH}
          colors={{ scheme: "pastel2" }}
          margin={{ top: 80, right: 130, bottom: 80, left: 80 }}
          layers={[
            "grid",
            "axes",
            "bars",
            "markers",
            "legends",
            "annotations",
            props => <LabelOutside {...props} />,
          ]}
          handleClick={handleBarChart}
          modelTitle="Active Users"
          barChartData={userBarChartData}
          tableColumnKey="By_Month"
          tableData={dataSource}
          tableLoading={
            monthChartTableData?.length > 0 ? false : true
          }
          active={active}
          handleonCloseModal={handleonCloseModal}
          showModal={showModal}
          chartRef={chartReference}
        />
      </div>
    </CommonSpinner>
  }

  const renderBadge = () => {
    return <div className='float-left chartText'> {navigate && <Badge color="var(--clr-green)" />} No of Users </div>
  }

  const renderExportCSV = () => {
    if (!navigate) {
      return <CustomExportCsv
        dataSource={barChartData}
        Headers={periodHeader}
        exportFileName="By Period"
      />
    }
    return null;
  }

  const renderButtonGroup = () => {
    return <Radio.Group defaultValue={"chart"} onChange={handleClick}>
      <Radio.Button value="chart">Chart</Radio.Button>
      <Radio.Button value="table">Table</Radio.Button>
    </Radio.Group>
  }

  const renderChartDownload = () => {
    if (navigate) {
      return <DownloadChart chartRef={chartReference} fileName={{ name: "By Period" }} />
    }
    return null;
  }
  
  const handleChange = (e) =>{
    let QuarterView;
    let YearView;
    if(e === "Month"){
      QuarterView = false;
      YearView = false;
    } else if ( e === 'Quarter' ){
      QuarterView = true;
      YearView = false;
    } else if (e === "Year") {
      QuarterView = false;
      YearView = true;
    }
    setIsQuarterView(QuarterView)
    setIsYearView(YearView)
    setActive(e)
  }
  
  const disabledPeriods =(current)=>{
    let period;
    switch (active) {
      case "Month":
        period = current && current > moment().endOf('month');
      case "Quarter":  
        period = current && current > moment().endOf('quarter');
      case "Year":
      period = current && current > moment().endOf('year');
    }
    return period;
  }

  return (
    <div className='mt-2'>
      <Tabs defaultActiveKey="By Active Users" size="small">
        <TabPane tab="By Active Users" key="1">
          <ActiveUserByUser appdir={appdir} />
        </TabPane>
        <TabPane tab="By Period" key="2">
          <div className="py-4 d-flex justify-space-between sm-w-100 xlg-w-80" style={{ width: "85%" }}>
            <div className='ml-15'> {renderBadge()} </div>
            <div className='d-flex'>
              <div className='tableChart mr-2'> {renderExportCSV()} </div>
              <div className='mr-2'> {renderChartDownload()} </div>
              <div className='tableChart mr-2'> {renderButtonGroup()} </div>
              <div className='tableChart mr-2'>
                <Select defaultValue={active} style={{ width: 100 }} onChange={handleChange}>
                  <Option value='Month'>Month</Option>
                  <Option value='Quarter'>Quarter</Option>
                  <Option value='Year'>Year</Option>
                </Select>
              </div>
              <div className='tableChart date-picker'>
                { active ==='Month' && 
                <RangePicker 
                  picker="month"  
                  defaultValue={[moment().startOf('month').subtract(calculateMonthDays(2), "days"), moment()]} 
                  onChange={handleDate}
                  disabledDate={disabledPeriods}
                />}
                { isQuarterView && 
                <RangePicker 
                  picker="quarter" 
                  defaultValue={[moment().subtract(1, 'quarter').endOf('quarter'), moment()]} 
                  /*  format ={'[Q]Q-Y'}  */
                  disabledDate={disabledPeriods} 
                  onChange={handleDate}
                />}
                { isYearView && 
                <RangePicker  
                  picker="year" 
                  defaultValue={[moment(). subtract(1, 'year'), moment()]} 
                  disabledDate={disabledPeriods}
                  onChange={handleDate} 
                />}
              </div>
            </div>
          </div>
          {navigate ? (
            renderChart()
          ) : (
            renderTable()
          )}
        </TabPane>
      </Tabs>
    </div>
  );
}
