import React, { createRef, useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Spin, Tabs, Button, Select } from "antd";
import { ResponsiveBar } from "@nivo/bar";
import { requestSalesActivity, sendEmailRequest } from "../../../appRedux/actions/Reporting";
import moment from "moment";
import { stringToColour as stc, currencyFormatter } from "../../../helpers/common";
import { formatGroupName, addValuesInObj, combineAllArrays, constructSalesActivity, mapBarData, reverseDate, monthDisplayKey } from "./helper";
import _sortBy from "lodash/sortBy";
import _isEmpty from "lodash/isEmpty";
import _groupBy from "lodash/groupBy";
import _flattenDeep from "lodash/flattenDeep";
import _map from "lodash/map";
import _find from "lodash/find"
import TotalLabels from "../Common/TotalLabels"
import { SALES_BY_VOLUME, SALES_BY_REVENUE, PAGE_SIZE, SALES_NEW_MEMBERS, SALES_NEW_MEMBERS_REVENUE, RENEWING_MEMBERS, RENEWING_MEMBERS_REVENUE, TOTAL_INVOICES, HASH_DATA, TOTAL_REVENUE, SALES_NEW_MEMBERS_UUIDS, RENEWING_MEMBERS_UUIDS, TOTAL_INVOICES_UUIDS, SALES_GROUP_NAME, VIEW_BY_QUARTER, VIEW_BY_YEAR, VIEW_BY_FILTERS, VIEW_BY_MONTH, VIEW_BY_DAY, TABLE_VIEWS, VIEW_BY_ALL, SALES_GROUP_ID, SALES_ACTIVITY_SCREEN } from "../../../constants"
import Table from '../Common/CustomTable'
import NoDataFound from "../Common/NoDataFound";
import { getMemberDetailsRequest, showModal, handleAllMembersExport } from '../../../appRedux/actions/Reporting'
import MembersInfoModal from "../Common/MembersInfoModal";
import ChartHeader from "../Common/ChartHeader";

const { Option } = Select;
const { TabPane } = Tabs;
const SalesActivity = props => {
  const sourceHex = props.sourceHex;
  const [loader, setLoader] = useState(true);
  const chartRef = createRef();
  const exportTableRef = useRef();
  const [salesDataFetched, setSalesDataFetched] = useState(false);
  const SalesActivity = useSelector(state => state.reporting.sales);
  const [filteredBarChartData, setFilteredBarChartData] = useState(SalesActivity);
  const [startDate, setStartDate] = useState(moment().subtract(30, "days"));
  const [endDate, setEndDate] = useState(moment());
  const [chartColorsData, setChartColorsData] = useState({});
  const [salesTableData, setSalesTableData] = useState([]);
  const [dataSource, setDataSource] = useState([]);
  const [allCountAndRevenue, setAllCountAndRevenue] = useState({}); // data for legend click
  const [selectedItem, setSelectedItem] = useState({});
  const [tableSelectedItem, setTableSelectedItem] = useState({});
  const [showMemberModal, setShowMemberModal] = useState(false)
  const [downloadCsv, setDownloadCsv] = useState(false)
  const [groupByChart, setGroupByChart] = useState(SALES_BY_VOLUME);
  const [selectedGroups, setSelectedGroups] = useState(() => {
    let defaultSelectedGroups = [];
    for (const group in props.groupsid) {
      defaultSelectedGroups.push(props.groupsid[group].groupid.toString());
    }
    return defaultSelectedGroups;
  });
  const [selectedChartView, setSelectedChartView] = useState(VIEW_BY_MONTH);
  const [selectedTableView, setSelectedTableView] = useState(VIEW_BY_ALL);
  const [tableSubViewOptions, setTableSubViewOptions] = useState([]);
  const [selectedTableSubView, setSelectedTableSubView] = useState('');
  const [constructedSalesActivity, setconstructedSalesActivity] = useState([]);
  const [groupMapForChart, setGroupMapForChart] = useState(() => {
    let groupDict = {};
    for (const group in props.groupsid) {
      groupDict[formatGroupName(props.groupsid[group].groupname)] =
        props.groupsid[group].groupname;
    }
    return groupDict;
  });
  const [allGroupMap, setAllGroupMap] = useState(() => {
    let groupDict = {};
    for (const group in props.groupsid) {
      groupDict[props.groupsid[group].groupid] =
        props.groupsid[group].groupname;
    }
    return groupDict;
  });
  const [chartViewOptions, setChartViewOptions] = useState([]);
  const [selectedTablePage, setSelectedTablePage] = useState({ page: 1, size: PAGE_SIZE });
  const [pageTotal, setPageTotal] = useState("");
  const membersInfo = useSelector(({ reporting }) => reporting.membersInfo?.data) || [];
  const memberLoading = useSelector(state => state.reporting.loading) || false;
  const modalVisible = useSelector(({ reporting }) => reporting.showModal) || false
  const handleMemberValue = (data, key) => {
    let revenueKey = SALES_NEW_MEMBERS_REVENUE
    switch (key) {
      case RENEWING_MEMBERS_UUIDS: revenueKey = RENEWING_MEMBERS_REVENUE; break;
      case TOTAL_INVOICES_UUIDS: revenueKey = TOTAL_REVENUE; break;
    }
    if (data[key].length > 0) {
      setSelectedItem({ ...data, UUIDs: data[key], revenue: currencyFormatter(data[revenueKey]), groupTitle: data.GroupName, GroupName: data.GroupName, value: data[key].length, selectedValue: HASH_DATA[key], isTable: true })
      dispatch(showModal(false))
      dispatch(getMemberDetailsRequest({ screen: props.screen, sourceHex, uuids: data[key].slice(0, PAGE_SIZE),appdir:props.appdir }))
    }
  }
  const DownloadMemberInfo = ({ data, keyVal, text }) => {
    return Number(text) > 0 ? <Button type='link' onClick={() => handleMemberValue(data, keyVal)}>{currencyFormatter(text, false)}</Button> : 0
  }
  const columns = [
    {
      label: HASH_DATA[SALES_GROUP_NAME],
      title: <div className='text-left'>Member Type</div>,
      dataIndex: SALES_GROUP_NAME,
      key: SALES_GROUP_NAME,
      render: text => <div className='text-left'><strong >{text}</strong></div>,
    },
    {
      title: HASH_DATA[SALES_NEW_MEMBERS],
      label: HASH_DATA[SALES_NEW_MEMBERS],
      dataIndex: SALES_NEW_MEMBERS,
      key: SALES_NEW_MEMBERS,
      render: (text, data) => <DownloadMemberInfo text={text} data={data} keyVal={SALES_NEW_MEMBERS_UUIDS} />
    },
    {
      title: HASH_DATA[SALES_NEW_MEMBERS_REVENUE],
      label: HASH_DATA[SALES_NEW_MEMBERS_REVENUE],
      dataIndex: SALES_NEW_MEMBERS_REVENUE,
      key: SALES_NEW_MEMBERS_REVENUE,
      render: text => <span>{currencyFormatter(text)}</span>,
    },
    {
      title: HASH_DATA[RENEWING_MEMBERS],
      label: HASH_DATA[RENEWING_MEMBERS],
      dataIndex: RENEWING_MEMBERS,
      key: RENEWING_MEMBERS,
      render: (text, data) => <DownloadMemberInfo text={text} data={data} keyVal={RENEWING_MEMBERS_UUIDS} />
    },
    {
      title: HASH_DATA[RENEWING_MEMBERS_REVENUE],
      label: HASH_DATA[RENEWING_MEMBERS_REVENUE],
      dataIndex: RENEWING_MEMBERS_REVENUE,
      key: RENEWING_MEMBERS_REVENUE,
      render: text => <span>{currencyFormatter(text)}</span>,
    },
    {
      title: HASH_DATA[TOTAL_INVOICES],
      label: HASH_DATA[TOTAL_INVOICES],
      dataIndex: TOTAL_INVOICES,
      key: TOTAL_INVOICES,
      render: (text, data) => <DownloadMemberInfo text={text} data={data} keyVal={TOTAL_INVOICES_UUIDS} />
    },
    {
      title: HASH_DATA[TOTAL_REVENUE],
      label: HASH_DATA[TOTAL_REVENUE],
      dataIndex: TOTAL_REVENUE,
      key: TOTAL_REVENUE,
      render: text => <span>{currencyFormatter(text)}</span>,
    },
  ];

  const dispatch = useDispatch();

  function handleGroupChange(groupIDs) {
    if (groupIDs.length > 0) {
      setSelectedGroups(groupIDs);
      setSalesDataFetched(false);
      setLoader(true);
    }
  }

  function handleDateChange(dates) {
    if (dates) {
      setStartDate(dates[0]);
      setEndDate(dates[1]);
      setSalesDataFetched(false);
      setLoader(true);
    }
  }

  const handleChartViewChange = (e) => setSelectedChartView(e);
  const handleTableViewChange = (e) => setSelectedTableView(e);
  const handleTableSubviewChange = (e) => setSelectedTableSubView(e);

  useEffect(() => {
    if (!_isEmpty(filteredBarChartData)) {
      let totalMembers = 0;
      let label = groupByChart === SALES_BY_VOLUME ? "Total Members" : "Total Revenue";
      filteredBarChartData.map(grp => { totalMembers += grp.total })
      setPageTotal(`${label}: ${formatValue(totalMembers)}`);
    }
  }, [filteredBarChartData])
  useEffect(() => {
    let differenceInDays = endDate.diff(startDate, 'days') + 1;
    let filters = VIEW_BY_FILTERS;
    let showDay = differenceInDays <= 90;
    let showYear = differenceInDays >= 365;
    let showQuarter = differenceInDays >= 90;
    if ((!showDay && selectedChartView === VIEW_BY_DAY) || (!showYear && selectedChartView === VIEW_BY_YEAR) || (!showQuarter && selectedChartView === VIEW_BY_QUARTER)) setSelectedChartView('Month')
    filters[VIEW_BY_DAY]['disabled'] = !(showDay);
    filters[VIEW_BY_YEAR]['disabled'] = !(showYear);
    filters[VIEW_BY_QUARTER]['disabled'] = !(showQuarter);
    setChartViewOptions(filters)
  }, [startDate, endDate])

  useEffect(() => {
    let colorData = {};
    if (!_isEmpty(selectedGroups) && !_isEmpty(allGroupMap)) {
      for (const key in allGroupMap) {
        colorData[formatGroupName(allGroupMap[key])] = stc(allGroupMap[key]);
      }
      if (_isEmpty(chartColorsData)) {
        setChartColorsData(colorData);
      }
    }
  }, [selectedGroups, allGroupMap]);

  useEffect(() => {
    if (!_isEmpty(SalesActivity)) {
      setconstructedSalesActivity(constructSalesActivity(SalesActivity, { startDate, endDate }))
    } else {
      // Sales Activity was empty, the loader and flags are defused below useEffect.
      setconstructedSalesActivity([])
    }
  }, [SalesActivity])

  useEffect(() => {
    if (constructedSalesActivity) {
      // By default the Month view will be used.
      let barView = VIEW_BY_MONTH;
      let isIncreasingBarValue = true;
      let invoiceKey = 'MonthOfInvoiceKey';
      switch (selectedChartView) {
        case VIEW_BY_DAY: {
          barView = VIEW_BY_DAY;
          isIncreasingBarValue = false;
          invoiceKey = 'DayOfInvoiceKey';
          break;
        }
        case VIEW_BY_MONTH: {
          barView = VIEW_BY_MONTH;
          isIncreasingBarValue = true;
          invoiceKey = 'MonthOfInvoiceKey';
          break;
        }
        case VIEW_BY_QUARTER: {
          barView = VIEW_BY_QUARTER;
          isIncreasingBarValue = true;
          invoiceKey = 'QuarterOfInvoiceKey';
          break;
        }
        case VIEW_BY_YEAR: {
          barView = VIEW_BY_YEAR;
          isIncreasingBarValue = true;
          invoiceKey = 'YearOfInvoice';
          break;
        }
      }
      setFilteredBarChartData(mapBarData({
        data: constructedSalesActivity,
        invoiceKey,
        // constructBarChartData function props
        barView,
        isIncreasingBarValue,
        barValueKey: groupByChart === SALES_BY_VOLUME ? TOTAL_INVOICES : TOTAL_REVENUE,
      }));
      setLoader(false);
      setSalesDataFetched(true);
    } else if (startDate.isSame(endDate)) {
      setFilteredBarChartData([])
      setLoader(false);
      setSalesDataFetched(true);
    }
  }, [constructedSalesActivity, groupByChart, selectedChartView]);

  useEffect(() => {
    if (constructedSalesActivity.length) {
      let filteredSalesData = constructedSalesActivity;
      let groupKey = null;
      switch (selectedTableView) {
        case VIEW_BY_MONTH: groupKey = 'MonthOfInvoiceKey'; break;
        case VIEW_BY_QUARTER: groupKey = 'QuarterOfInvoiceKey'; break;
        case VIEW_BY_YEAR: groupKey = 'YearOfInvoice'; break;
      }
      if (groupKey !== null) {
        let groupedData = _groupBy(constructedSalesActivity, groupKey);
        let subViewOptions = _sortBy(Object.keys(groupedData), (e) => reverseDate(e));
        if (selectedTableView === VIEW_BY_MONTH) {
          subViewOptions = subViewOptions.map(e => monthDisplayKey(e))
          filteredSalesData = groupedData[selectedTableSubView.length ? moment(reverseDate(selectedTableSubView)).format('MM-YYYY') : moment(reverseDate(subViewOptions[0])).format('MM-YYYY')]
        } else {
          filteredSalesData = groupedData[selectedTableSubView.length ? selectedTableSubView : subViewOptions[0]]
        }
        setTableSubViewOptions(subViewOptions);
      } else {
        setTableSubViewOptions([]);
        setSelectedTableSubView('');
      }
      let constructedDataSource = _map(_groupBy(filteredSalesData, SALES_GROUP_ID), (groupArr) => {
        let UUIDObj = combineAllArrays(groupArr, [SALES_NEW_MEMBERS_UUIDS, RENEWING_MEMBERS_UUIDS]);
        return {
          GroupID: groupArr[0][SALES_GROUP_ID],
          GroupName: groupArr[0][SALES_GROUP_NAME],
          ...addValuesInObj(groupArr, [TOTAL_INVOICES, TOTAL_REVENUE, SALES_NEW_MEMBERS, RENEWING_MEMBERS, RENEWING_MEMBERS_REVENUE, SALES_NEW_MEMBERS_REVENUE]),
          ...UUIDObj,
          MembersUUIDs: _flattenDeep(Object.values(UUIDObj)),
        }
      })
      setDataSource(constructedDataSource);
    }
  }, [constructedSalesActivity, selectedTableView, selectedTableSubView])

  useEffect(() => {
    if (constructedSalesActivity.length) {
      let groupUUIDs = {};
      _map(_groupBy(constructedSalesActivity, SALES_GROUP_ID), (groupArr) => {
        let UUIDObj = combineAllArrays(groupArr, [SALES_NEW_MEMBERS_UUIDS, RENEWING_MEMBERS_UUIDS]);
        let totalRevenue = addValuesInObj(groupArr, [TOTAL_REVENUE])[TOTAL_REVENUE];
        let MembersUUIDs = _flattenDeep(Object.values(UUIDObj))
        groupUUIDs[formatGroupName(groupArr[0][SALES_GROUP_NAME])] = { uuids: MembersUUIDs, revenue: totalRevenue };
      })
      setAllCountAndRevenue(groupUUIDs)
    }
  }, [constructedSalesActivity])

  useEffect(() => {
    if (!salesDataFetched) {
      dispatch(
        requestSalesActivity({
          sourceHex: sourceHex,
          groupid: selectedGroups,
          start_date: moment(startDate).format("DD/MM/YYYY"),
          end_date: moment(endDate).format("DD/MM/YYYY"),
          appdir:props.appdir
        })
      );
    }
  }, [startDate, endDate, salesDataFetched]);
  useEffect(() => {
    if (modalVisible) {
      setShowMemberModal(modalVisible)
    }
  }, [modalVisible])
  useEffect(() => {
    if (salesTableData.length > 0 && downloadCsv && exportTableRef.current) {
      setTimeout(() => {
        exportTableRef.current.link.click();
        setDownloadCsv(false)
      }, 20);
    }
  }, [salesTableData, downloadCsv]);

  const getCustomColors = ({ id }) => {
    return chartColorsData[id];
  };

  const getSumOfGroupsData = datum => {
    let total = 0;
    filteredBarChartData.map(data => {
      total = total + Number(data[datum.id] ?? 0);
    });
    return `${groupMapForChart[datum.id]} (${formatValue(total)})`;
  };

  const formatValue = value => {
    return groupByChart === SALES_BY_REVENUE ? currencyFormatter(value) : currencyFormatter(value, false);
  };
  const handleClick = (val, legend = false) => {
    const { id, data, label } = val
    let uuids = legend ? allCountAndRevenue[val.id] ? allCountAndRevenue[val.id]['uuids'] : [] : data[`${val.id}UUIDS`];
    if (uuids.length > 0) {
      let groupTitle = legend ? (label ?? "").slice(0, label.lastIndexOf("(")) : data[`${id}Title`];
      let groupRevenue = legend ? allCountAndRevenue[val.id]['revenue'] : data[`${id}revenue`];
      setSelectedItem({ ...val, UUIDs: uuids, revenue: currencyFormatter(groupRevenue), value: uuids.length, groupTitle, isTable: false, icon: false })
      dispatch(showModal(false))
      dispatch(getMemberDetailsRequest({ screen: props.screen, sourceHex, uuids: uuids.slice(0, PAGE_SIZE),appdir:props.appdir }))
    }
  }
  const handleMemberInfo = (val, pageSize) => {
    setSelectedTablePage({ page: val, size: pageSize });
    setSalesTableData(dataSource.slice(val * pageSize - pageSize, val * pageSize))
  }
  useEffect(() => {
    if (dataSource.length > 0 && !modalVisible) {
      const { page, size } = selectedTablePage;
      setTableSelectedItem({ value: dataSource.length })
      setSalesTableData(dataSource.slice((page * size) - size, page * size))
    }
  }, [dataSource, modalVisible])

  const handleTotalLabelClick = (date) => {
    let clickedBarData = _find(filteredBarChartData, { date });
    if (clickedBarData?.allUUIDs?.length) {
      setSelectedItem({ UUIDs: clickedBarData.allUUIDs, revenue: currencyFormatter(clickedBarData.overAllRevenue), value: clickedBarData.allUUIDs.length, groupTitle: date.replace("*", ""), isTable: false, icon: false })
      dispatch(showModal(false))
      dispatch(getMemberDetailsRequest({ screen: props.screen, sourceHex, uuids: clickedBarData.allUUIDs.slice(0, PAGE_SIZE),appdir:props.appdir }))
    }
  }
  return (<Spin spinning={memberLoading} size="large">
    <div>
      <ChartHeader
        select={{
          loading: loader,
          defaultValue: selectedGroups,
          dataSource: allGroupMap,
          onChange: handleGroupChange
        }}
        datePicker={{
          showRangePicker: true,
          defaultValue: [startDate, endDate],
          onChange: handleDateChange
        }}
        downloadChart={{
          chartRef: chartRef,
          fileName: { name: "sales-activity", startDate, endDate },
          disabled: loader
        }}
        viewBySelect={{
          viewByOptions: chartViewOptions,
          viewByChange: handleChartViewChange,
          defaultView: selectedChartView,
        }}
        pageTotal={pageTotal}
      />
      {loader ? (
        <div style={{ height: 500 }}>
          <Spin
            size="large"
            style={{
              marginTop: "25%",
              marginLeft: "50%",
            }}
          />
        </div>
      ) : (
        <div>
          <Tabs
            defaultActiveKey={groupByChart}
            onChange={setGroupByChart}
          >
            <TabPane tab="Sales by Volume" key={SALES_BY_VOLUME} />
            <TabPane tab="Sales by Revenue" key={SALES_BY_REVENUE} />
          </Tabs>
          {_isEmpty(filteredBarChartData) ? <NoDataFound /> :
            <div>
              <div className="lineChart" style={{ height: 500 }} ref={chartRef}>
                <ResponsiveBar
                  data={filteredBarChartData}
                  onClick={(e) => handleClick(e, false)}
                  //Group Names
                  keys={selectedGroups.map(groupID =>
                    formatGroupName(allGroupMap[groupID])
                  )}
                  indexBy="date"
                  margin={{ top: 50, right: 200, bottom: 80, left: 85 }}
                  colors={getCustomColors}
                  padding={0.3}
                  tooltip={({ id, value, color }) => (
                    <div
                      style={{
                        padding: 5,
                        color,
                        background: "#222222",
                      }}
                    >
                      <span>
                        {groupMapForChart[id]} : {formatValue(value)}
                      </span>
                    </div>
                  )}
                  borderColor={{ from: "color", modifiers: [["darker", 1.6]] }}
                  axisTop={null}
                  axisRight={null}
                  axisBottom={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: -40,
                    legend: selectedChartView,
                    legendPosition: "middle",
                    legendOffset: 60,
                  }}
                  axisLeft={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: 0,
                    legend: groupByChart === SALES_BY_VOLUME ? "Total Memberships" : "Total Revenue",
                    legendPosition: "middle",
                    legendOffset: -70,
                    format: value =>
                      formatValue(value),
                  }}
                  layers={[
                    "grid",
                    "axes",
                    "bars",
                    props =>
                      TotalLabels({
                        ...props,
                        key: "total",
                        currency: groupByChart === SALES_BY_REVENUE,
                        onTotalLabelClick: handleTotalLabelClick,
                        screen: SALES_ACTIVITY_SCREEN,
                      }),
                    "markers",
                    "legends",
                  ]}
                  label={d => formatValue(d.value)}
                  labelTextColor={{
                    from: "color",
                    modifiers: [["darker", 1.6]],
                  }}
                  legendLabel={getSumOfGroupsData}
                  legends={[
                    {
                      anchor: "bottom-right",
                      direction: "column",
                      itemHeight: 20,
                      itemWidth: 130,
                      translateY: 0,
                      dataFrom: "keys",
                      justify: false,
                      translateX: 180,
                      itemsSpacing: 5,
                      itemDirection: "right-to-left",
                      itemOpacity: 0.85,
                      symbolSize: 20,
                      onClick: (d) => {
                        handleClick(d, true)
                      },
                      effects: [
                        {
                          on: "hover",
                          style: {
                            itemOpacity: 1,
                          },
                        },
                      ],
                    },
                  ]}
                />
              </div>
              <Select style={{ margin: '0px 0px 10px 10px', width: '100px' }} defaultValue={selectedTableView} onChange={handleTableViewChange}>
                {TABLE_VIEWS.map(e => <Option key={e} value={e}>{e}</Option>)}
              </Select>
              {Boolean(tableSubViewOptions.length) && <Select
                key={tableSubViewOptions[0]}
                style={{ margin: '0px 0px 10px 10px', width: '120px' }}
                defaultValue={selectedTableView === VIEW_BY_ALL ? '' : tableSubViewOptions[0]}
                onChange={handleTableSubviewChange}
              >
                {tableSubViewOptions.map(e => <Option key={e} value={e}>{e}</Option>)}
              </Select>}
              <Table
                page={selectedTablePage.page}
                pageSize={selectedTablePage.size}
                columns={columns}
                exportCsv={true}
                selectedItem={tableSelectedItem}
                tableData={salesTableData}
                scroll={{ x: 768, y: 330 }}
                handleMemberInfo={(e, size) => handleMemberInfo(e, size)}
                exportCsvInfo={{
                  className: "my-0 ml-4",
                  handleMemberDataExport: (e) => setDownloadCsv(e),
                  fileName: { name: "sales-activity", startDate, endDate },
                  memberData: dataSource,
                  handleExportCsv: downloadCsv,
                  screen: props.screen,
                  exportTableRef: exportTableRef,
                  headers: columns
                }} />
            </div>}
        </div>
      )}
      {showMemberModal && <MembersInfoModal fileName={{ name: "sales-activity", startDate, endDate }} selectedItem={selectedItem} appdir={props.appdir} screen={props.screen} sourceHex={sourceHex} membersInfo={membersInfo} handleClose={() => {
        dispatch(handleAllMembersExport(false))
        dispatch(sendEmailRequest(false))
        dispatch(showModal(false))
        setShowMemberModal(false)
      }} visible={showMemberModal} />}
    </div>
  </Spin>
  );
};
export default SalesActivity;
