import React from "react";
import { useState, useEffect, createRef } from "react";
import { DoubleRightOutlined } from "@ant-design/icons";
import { Tooltip, Badge, Radio, Row, Col, Modal, Typography, Input } from "antd";
import _map from 'lodash/map';
import _reduce from 'lodash/reduce';
import { formatDate, get90PriorDate, getCurrentDate, getRoundValue, filesChartData, barChartData, convertLowercaseFormat, sortColumnData, sortNumbers } from "@/AnalyticsAll/StatComponents/utils";
import { ReactComponent as Information } from "@/AnalyticsAll/NativeDashboards/ProductsAnalytics/assets/icons/Information.svg";
import { useMonthlyFileViewHook } from "@/AnalyticsAll/StatComponents/hooks/MonthlyFileViewHook";
import CommonDatePicker from "@/AnalyticsAll/StatComponents/common/CommonDatePicker";
import CommonTable from "@/AnalyticsAll/StatComponents/common/CommonTable";
import BandwidthChart from "@/AnalyticsAll/StatComponents/BandWidthChart";
import CustomResponsiveBarChart from '@/AnalyticsAll/StatComponents/common/CustomResponsiveBarChart'
import { LEGENDS_KEYS } from "@/AnalyticsAll/constants";
import CommonFileViewTable from "@/AnalyticsAll/StatComponents/common/CommonFileViewTable";
import CustomExportCsv from "@/AnalyticsAll/StatComponents/common/CustomExportCsv";
import CommonSpinner from "@/AnalyticsAll/StatComponents/common/CommonSpinner";
import useProductModalDataConstruct from "@/AnalyticsAll/StatComponents/common/ProductModalTableHook";
import DownloadChart from "@/AnalyticsAll/StatComponents/common/DownloadChart";

const FileChart = props => {
  const {
    params: { appdir },
  } = props;
  const chartReference = createRef()
  const [isBandwidth, setIsBandwidth] = useState(false);
  const [isTableView, setIsTableView] = useState(false);
  const [active, setActive] = useState("File");
  const [dates, setDates] = useState([get90PriorDate(), getCurrentDate()]);
  const [showModal, setShowModal] = useState(false);
  const [selectedFileTypeData, setSelectedFileTypeData] = useState([]);
  const [fileSearchValue, setFileSearchValue] = useState("");
  const [selectedFile, setSelectedFile] = useState("all");
  const [monthlyFileData, setMonthlyFileData] = useState([]);
  const [tableDataSource, setTableDataSource] = useState([]);
  const [chartDataSource, setChartDataSource] = useState([]);
  const [fileBarChartData, setFileBarChartData] = useState({});
  const [chartModal, setChartModal] = useState(false);
  const [fileHeader, setFileHeader] = useState([]);
  const [totalFileAndBandWidth, setTotalFileAndBandWidth] = useState([])
  const [labelModal, setLabelModal] = useState(false);
  const [fileMonth, setFileMonth] = useState('');
  const [labelData, setLabelData] = useState([])

  const { fileViewInfo: monthlyFileInfo, isFileLoading } = useMonthlyFileViewHook(appdir, dates);
  const productTableDataSource = useProductModalDataConstruct(selectedFile, fileSearchValue, selectedFileTypeData);

  useEffect(() => {
    if (monthlyFileInfo.length) {
      setMonthlyFileData(monthlyFileInfo);
    }
  }, [monthlyFileInfo]);

  useEffect(() => {
    if (monthlyFileData.length > 0) {
      const data = monthlyFileData.map(data => {
        return { ...data, contactUUIDs: data?.file_details };
      });
      let constructData = barChartData("file_view", data, {
        xAxisValue: "month",
        yAxisValue: "user",
      });
      setTableDataSource(constructData);
    }
  }, [monthlyFileData]);

  useEffect(() => {
    if (tableDataSource.length) {
      let totalFile = { value: 0, title: "UNIQUE FILES" }
      let totalBandwidth = { value: 0, title: "BANDWIDTH CONSUMED" }
      let totalFileViews = { value: 0, title: "TOTAL FILE VIEWS" }
      tableDataSource.forEach((data) => {
        totalFile.value = totalFile.value + data.user;
        totalBandwidth.value = totalBandwidth.value + Number(data.bandwidthConsumed.slice(0, -2));
        totalFileViews.value = totalFileViews.value + data.views
      })
      setTotalFileAndBandWidth([{ ...totalFileViews, value: totalFileViews.value.toLocaleString() }, { ...totalFile, value: totalFile.value.toLocaleString() }, { ...totalBandwidth, value: `${totalBandwidth.value.toFixed(2)} GB` },])
    }
  }, [tableDataSource])

  const userColumns = [
    {
      title: "PERIOD",
      dataIndex: "month",
      key: "month",
    },
    {
      title: "TOTAL FILE VIEWS",
      dataIndex: "views",
      key: "views",
      render: (_, data) => {
        return (
          <div className="d-flex userDatas">
            <div
              onClick={() => handleModalClick(data)}
              className="userCount"
            >
              {data.views}
            </div>
          </div>
        );
      },
    },
    {
      title: "UNIQUE FILES",
      dataIndex: "user",
      key: "user",
      render: (_, data) => {
        return (
          <div className="d-flex userDatas">
            <div
              onClick={() => handleModalClick(data)}
              className="userCount"
            >
              {data.user}
            </div>
          </div>
        );
      },
    },
    {
      title: "BANDWIDTH",
      dataIndex: "bandwidthConsumed",
      key: "bandwidthConsumed",
    },
  ];

  useEffect(() => {
    if (dates.length) {
      let fileHeader = [
        { label: `PERIOD (${dates[0]} to ${dates[1]})`, key: "month" },
        { label: "FILES", key: "user" },
        { label: "BANDWIDTH", key: "bandwidthConsumed" },
      ];
      setFileHeader(fileHeader);
    }
  }, [dates]);

  const handleClick = e => {
    let bandWidthView;
    let tableDataView;
    if (e.target.value === "File") {
      bandWidthView = false;
      tableDataView = false;
    } else if (e.target.value === "Bandwidth") {
      bandWidthView = true;
      tableDataView = false;
    } else if (e.target.value === "Table") {
      bandWidthView = false;
      tableDataView = true;
    }
    setIsBandwidth(bandWidthView);
    setIsTableView(tableDataView);
    setActive(e.target.value);
  };

  const handleDate = (value, dateStrings) => {
    setDates([
      dateStrings?.[0] ? formatDate(dateStrings?.[0]) : "",
      dateStrings?.[1] ? formatDate(dateStrings?.[1]) : "",
    ]);
  };

  const badgeIcon = () => {
    switch (active) {
      case "File":
        return (
          <div className="d-flex">
            <Badge color="var(--clr-green)" />
            <div className="chartText pr-2">Image</div>
            <Badge color="var(--clr-green)" />
            <div className="chartText pr-2">Video</div>
            <Badge color="var(--clr-green)" />
            <div className="chartText pr-2">PDF</div>
          </div>
        );
      case "Bandwidth":
        return <div className="float-left chartText pr-2">Bandwidth Usage</div>;
      case "Table":
        return <div className="float-left chartText pr-2">Bandwidth Usage</div>;
      default:
        break;
    }
  };

  const fileColumns = [
    {
      title: "Product Name",
      dataIndex: "product_name",
      key: "product_name",
      className: "text-left",
      width: "65%",
      ellipsis: {
        showTitle: false,
      },
      render: (_, data) => {
        return (
          <>
            <Tooltip placement="topLeft" title={data.product_label}>
              <div style={{ fontSize: "18px" }} className="elipsis">
                {data.product_label}
              </div>
            </Tooltip>
            <div className="d-flex">
              {data?.product_hierarchy?.parent.length
                ? data?.product_hierarchy?.parent.map((item, i) => {
                  return (
                    <div key={i}>
                      {(item?.immediate_parent === 0 ||
                        item?.immediate_parent === 1) && (
                          <div className="d-flex" style={{ flexWrap: "wrap" }}>
                            {item?.immediate_parent === 0 ? (
                              <Tooltip placement="topLeft" title={item?.ProductLabel}>
                                <div className="ml-0 elipsis sub-header">
                                  <DoubleRightOutlined />{" "}
                                  {`${item?.ProductLabel}`}
                                </div>
                              </Tooltip>
                            ) : (
                              <Tooltip placement="topLeft" title={item?.ProductLabel}>
                                <div className="ml-2 elipsis sub-header">
                                  <DoubleRightOutlined /> {item?.ProductLabel}
                                </div>
                              </Tooltip>
                            )}
                          </div>
                        )}
                    </div>
                  );
                })
                : null}
            </div>
          </>
        );
      },
      sorter: (obj1, obj2) => sortColumnData(obj1, obj2, 'product_label'),
    },
    {
      title: "Type",
      dataIndex: "file_type",
      key: "file_type",
      className: "text-left",
      render: data => {
        return <div>{data === "Unknown" ? "Others" : data}</div>;
      },
      width: "10%",
      sorter: (obj1, obj2) => sortColumnData(obj1, obj2, 'file_type'),
    },
    {
      title: "Views",
      dataIndex: "views",
      key: "views",
      width: "10%",
      className: "text-left",
      defaultSortOrder: 'descend',
      sorter: (obj1, obj2) => sortNumbers(obj1, obj2, 'views'),
    },
    {
      title: "Total Bandwidth",
      dataIndex: "bandwidth_consumed",
      key: "bandwidth_consumed",
      width: "15%",
      className: "text-left",
      render: (_, data) => {
        const bandWidth = getRoundValue(data.bandwidth_consumed, 2);
        return <div>{bandWidth} GB</div>;
      },
      sorter: (obj1, obj2) => sortNumbers(obj1, obj2, 'bandwidth_consumed'),
    },
  ];

  const handleModalClick = data => {
    setSelectedFile("all");
    setShowModal(true);
    setSelectedFileTypeData(data?.contactUUIDs);
  };
  const handleCancel = () => {
    setShowModal(false);
    setChartModal(false);
    setSelectedFileTypeData([]);
    setFileSearchValue("");
    setLabelModal(false)
    setSelectedFile('all');
  };

  const handlefilesChange = e => {
    setSelectedFile(e?.target?.value);
  };
  const onFileSearch = searchValue => {
    searchValue = convertLowercaseFormat(searchValue.target.value);
    setFileSearchValue(searchValue);
  };

  const TotalLabels = ({ bars, yScale }) => {
    const labelMargin = 20;
    let total = 0;
    return _map(bars, ({ data: { data, indexValue }, x, width }, i) => {
      total = _reduce(
        _map(LEGENDS_KEYS.FILES, key => data[key]),
        (tot, val) => {
          return val ? tot + val : tot;
        },
        0
      );
      return (
        <g
          transform={`translate(${x}, ${yScale(total) - labelMargin})`}
          key={`${indexValue}-${i}`}
        >
          <text
            className="bar-total-label"
            x={width / 2}
            y={labelMargin / 2}
            textAnchor="middle"
            onClick={() => labelClick(data)}
          >
            {`${total.toLocaleString()} File Views`}
          </text>
        </g>
      );
    });
  };

  const handleBarChart = (chartData, e) => {
    if (chartData?.data) {
      setChartDataSource(chartData?.data[`${chartData.id}_data`]);
    }
    let ChartTableDataSource = productTableData(chartData?.data)
    setChartModal(true);
    setFileBarChartData(chartData);
    setSelectedFileTypeData(ChartTableDataSource)
    setFileMonth(chartData?.data?.month)
    setSelectedFile(chartData?.id)
  };
  const renderTitle = () => {
    return <div className="d-flex pa-2 mt-5 ml-4">
      <div className="globalSummary card-title"> PERIOD SUMMARY </div>
      <div className="ml-2">
        <Tooltip title={"period summary"} placement="right">
          <Information style={{ width: "1.3rem" }} />
        </Tooltip>
      </div>
    </div>
  }

  const renderExportCSV = () => {
    if (isTableView) {
      return <Col>
        <CustomExportCsv
          dataSource={tableDataSource}
          Headers={fileHeader}
          exportFileName="Period Summary"
        />
      </Col>
    }
    return null
  }

  const renderFileChart = () => {
    if (active === "File") {
      return <CommonSpinner loading={isFileLoading}>
        <CustomResponsiveBarChart
          data={filesChartData(monthlyFileData)}
          appdir={appdir}
          indexBy="month"
          axisBottom={{ legendOffset: 50 }}
          axisLeft={{ legend: "views" }}
          keys={LEGENDS_KEYS.FILES}
          colors={{ scheme: "blue_green" }}
          margin={{ top: 80, right: 130, bottom: 80, left: 80 }}
          enableLabel
          layers={[
            "grid",
            "axes",
            "bars",
            TotalLabels,
            "markers",
            "legends",
            "annotations",
          ]}
          handleClick={handleBarChart}
          modelTitle="File Views"
          barChartData={fileBarChartData}
          tableData={productTableDataSource}
          tableColumnKey={fileColumns}
          handleonCloseModal={handleCancel}
          chartRef={chartReference}
          showModal={chartModal}
          handlefilesChange={handlefilesChange}
          selectedFile={selectedFile}
          onFileSearch={onFileSearch}
          fileMonth={fileMonth}
          isChartTable='true'
        />
      </CommonSpinner>
    }
    return null
  }

  const renderBandwidthChart = () => {
    if (isBandwidth) {
      return <BandwidthChart {...props} isFileTab={true} dates={dates} chartRef={chartReference} />
    }
    return null
  }

  const renderTable = () => {
    if (isTableView) {
      return <div className="py-5 ml-6">
        <CommonTable
          dataSource={tableDataSource}
          columns={userColumns}
          scroll={{ y: 250 }}
          pagination={false}
          loading={isFileLoading}
          className="ActiveUserTable"
        />
      </div>
    }
    return null
  }

  const renderFooter = () => {
    return <div style={{ borderTop: "2px solid #eeeeee" }}>
      <div className="text-left pl-5 py-3">
        <div className="globalSummary card-title"> TOTAL </div>
      </div>
      <CommonSpinner loading={isFileLoading}>
        <div className="d-flex">
          <div className="px-5 d-flex" style={{ width: "70%" }}>
            {totalFileAndBandWidth.length > 0 &&
              totalFileAndBandWidth.map((data, index) => {
                return (
                  <div key={index} style={{ width: '30%', textAlign: "left" }}>
                    <div className="card-title"> {data.title} </div>
                    <div className="cardValues"> {data.value} </div>
                  </div>
                );
              })}
          </div>
        </div>
      </CommonSpinner>
    </div>
  }

  const renderGroupButtons = () => {
    return <Col>
      <Radio.Group value={active} onChange={handleClick}>
        <Radio.Button value="File">File</Radio.Button>
        <Radio.Button value="Bandwidth">Bandwidth</Radio.Button>
        <Radio.Button value="Table">Table</Radio.Button>
      </Radio.Group>
    </Col>
  }

  const renderChartDownload = () => {
    if (!isTableView) {
      return <Col><DownloadChart chartRef={chartReference} fileName={{ name: isBandwidth ? "Bandwidth Usage" : "File Views" }} /></Col>
    }
    return null;
  }

  const productTableData = (tableData) => {
    let fileTypedata = [];
    if (tableData?.Video_data) {
      fileTypedata.push(...tableData?.Video_data)
    }
    if (tableData?.PDF_data) {
      fileTypedata.push(...tableData?.PDF_data)
    }
    if (tableData?.Others_data) {
      fileTypedata.push(...tableData?.Others_data)
    }
    if (tableData?.Image_data) {
      fileTypedata.push(...tableData?.Image_data)
    }
    return fileTypedata
  }

  const labelClick = (labelData) => {
    const tableDataSource = productTableData(labelData)
    setLabelData(tableDataSource)
    setSelectedFileTypeData(tableDataSource)
    setFileMonth(labelData.month)
    setLabelModal(true)
  }

  return (
    <>
      {renderTitle()}
      <Row gutter={16}>
        <Col flex={3} className='ml-6'> {badgeIcon()} </Col>
        {renderGroupButtons()}
        <Col>
          <CommonDatePicker handleDate={handleDate} dates={dates} />
        </Col>
        {renderChartDownload()}
        {renderExportCSV()}
      </Row>
      {renderFileChart()}
      {renderBandwidthChart()}
      {renderTable()}
      <CommonFileViewTable
        showModal={showModal}
        handleCancel={handleCancel}
        handlefilesChange={handlefilesChange}
        selectedFile={selectedFile}
        onFileSearch={onFileSearch}
        fileColumns={fileColumns}
        dataSource={productTableDataSource}
        title={`File Statistics`}
        isFileView={true}
        exportFileName="File Statistics"
      />
      {renderFooter()}
      {labelModal &&
        <>
          <CommonFileViewTable
            showModal={labelModal}
            handleCancel={handleCancel}
            handlefilesChange={handlefilesChange}
            selectedFile={selectedFile}
            onFileSearch={onFileSearch}
            fileColumns={fileColumns}
            dataSource={productTableDataSource}
            title={`File Views`}
            isFileView={true}
            exportFileName="File Views"
            isChartLabel={true}
            fileMonth={fileMonth}
          />
        </>}
    </>
  );
};
export default FileChart;