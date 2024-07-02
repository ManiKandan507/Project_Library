import React, { useState, useEffect } from "react";
import { Modal, Row, Col, Statistic, Input, Tooltip, Avatar, Button } from "antd";
import {
  searchBasedOnName, convertLowercaseFormat, searchBasedOnEmail, sortColumnData, sortNumbers, getRoundValue
} from "@/AnalyticsAll/StatComponents/utils";
import CustomExportCsv from '@/AnalyticsAll/StatComponents/common/CustomExportCsv';
import CommonTable from "@/AnalyticsAll/StatComponents/common/CommonTable";
import { DoubleRightOutlined, UserOutlined } from '@ant-design/icons';
import CommonFileViewTable from "@/AnalyticsAll/StatComponents/common/CommonFileViewTable";

const DetailsModal = ({
  appdir = "",
  visible = false,
  handleClose = () => { },
  modelTitle,
  barChartData = {},
  tableColumnKey,
  tableData = [],
  tableLoading = false,
  handlefilesChange = () =>{ },
  selectedFile,
  onFileSearch = () => { },
  fileMonth,
  isChartTable = false ,
  active,
}) => {
  const [activeUser, setActiveUser] = useState([]);
  const [dataSource, setDataSource] = useState([]);
  const [fileDataSource, setFileDataSource ] = useState([]);

  useEffect(() => {
    setActiveUser(tableData)
    setDataSource(tableData)
    setFileDataSource(tableData)
  }, [tableData])

  const handleEmptyValue = value => value ? value : '-'

  const activeUserColumn = [
    {
      title: 'User',
      dataIndex: 'user',
      key: 'user',
      render: (_, data) => {
        return (
          <div style={{ fontSize: '16px', color:'black' }}>
            <Row style={{ flexWrap: "nowrap" }}>
              <Col flex={1}>
                <Avatar size={40} alt="profile" icon={<UserOutlined />} src={data?.Picture} />
              </Col>
              <Col flex={4} className="ml-3">
                <div>{`${data.Firstname} ${data.Lastname}`.trim()}</div>
              </Col>
            </Row>
          </div>
        )
      },
    },
    {
      title: 'Organization',
      dataIndex: "Company",
      label: "Organization",
      key: "Company",
      render: val => <span>{handleEmptyValue(val)}</span>,
    },
    {
      title: 'E-mail',
      dataIndex: "Email",
      label: "E-mail",
      key: "Email",
      render: val => <span>{handleEmptyValue(val)}</span>,
    },
    {
      title: 'Total Product Views',
      label: "Total Product Views",
      dataIndex: "product_views",
      render: (_, data) => {
        return <div>{data.product_views.toLocaleString()}</div>
      },
      key: "TotalViews",
    },
    {
      title: 'Action',
      dataIndex: "ReviewIDThisCustID",
      key: "",
      render: custId => (
        <Button><a
          target="_blank"
          href={`https://www.xcdsystem.com/${appdir}/admin/contacts/managecontacts/index.cfm?CFGRIDKEY=${custId}`}
        >
          {tableColumnKey === 'By_User' ? 'View Product' : 'Manage'}
        </a></Button>
      ),
    },
  ];

  const fileColumns = [
    {
      title: 'Product Name',
      dataIndex: 'product_name',
      key: 'product_name',
      className: 'text-left',
      width: '70%',
      ellipsis: true,
      render: (_, data) => {
        return (
          <>
            <Tooltip placement="topLeft" title={data.product_name}>
              <div style={{ fontSize: "18px" }} className='elipsis'>{data.product_label}</div>
            </Tooltip>
            <div className="d-flex">
              {data?.product_hierarchy?.parent.length ? data?.product_hierarchy?.parent.map((item, i) => {
                return (
                  <div key={i} className="d-flex">
                    {(item?.immediate_parent === 0 || item?.immediate_parent === 1) &&
                      <div className="d-flex" style={{ flexWrap: "wrap" }}>
                        {item?.immediate_parent === 0 ? <div className="ml-0 elipsis" style={{ width: "300px" }}><DoubleRightOutlined /> {`${item?.ProductLabel}`}</div> : <div style={{ width: "300px" }} className="ml-2 elipsis"><DoubleRightOutlined /> {item?.ProductLabel}</div>}
                      </div>}
                  </div>)
              }) : null}
            </div>

          </>
        )
      },
      sorter: (obj1, obj2) => sortColumnData(obj1, obj2, 'product_label'),

    },
    {
      title: 'Type',
      dataIndex: 'file_type',
      key: 'file_type',
      className: 'text-left',
      render: (data) => {
        return <div>{data === 'Unknown' ? 'Unknown' : data}</div>
      },
      width: '17.5%',
    },
    {
      title: 'Views',
      dataIndex: 'views',
      key: 'views',
      className: 'text-left',
      width: '12.5%',
      render: (_, rec) => {
        return <div>{rec?.views}</div>
      },
      sorter: (obj1, obj2) => sortNumbers(obj1, obj2, 'views'),
    },
  ];

  const constructMonth = () => {
    let content = ''
    if (modelTitle === 'File Views') {
      content = barChartData?.data?.month
    } else {
      let splitValue = barChartData?.data?.month.split(' - ');
      if (splitValue && splitValue.length) {
        content = `${splitValue[0]} `
      }
    }
    return content;
  }
  
  const constructPeriod = () =>{
    let Period;
    if(active == "Year"){
      Period = 'Year'
    } else if(active == "Quarter"){
      Period =  "Quarter"
    } else{
      Period = "Month"
    }
    return Period
  }

  const renderHeader = () => {
    return (
      <Row className="mb-3 ml-2">
        <Col span={4}>
          <div className="ant-statistic">
            <div className="ant-statistic-title">{constructPeriod()}</div>
            <div style={{ fontSize: 16, fontWeight: 600,}}>
              {constructMonth()}
            </div>
          </div>
        </Col>
        {modelTitle === 'File Views' && <Col span={4}>
          <Statistic title="File Type" value={barChartData?.id} valueStyle={{ fontSize: 16, fontWeight: 600, }} />
        </Col>
        }
      </Row>
    )
  }

  const activeUserHeaders = [
    { label: "User", key: "user" },
    { label: "Organization", key: "organization" },
    { label: "E-mail", key: "email" },
    { label: "Total Product Views", key: "total_product_views" },
  ]

  const activeUsersFileViewHeaders = [
    {
      label: 'Product Id',
      key: 'product_id'
    },
    {
      label: 'Product Name',
      key: 'product_label'
    },
    {
      label: 'Type',
      key: 'file_type'
    },
    {
      label: 'Views',
      key: 'views',
    },
  ]


  const handleSearch = (e) => {
    let searchValue = convertLowercaseFormat(e.target.value)
    let searchResult = []
    if (modelTitle === "File Views") {
      if (searchValue) {
        searchResult = dataSource.filter((data) => convertLowercaseFormat(`${data?.product_label}`).includes(searchValue))
      } else {
        searchResult = dataSource
      }
      setActiveUser(searchResult)
    } else {
      const emailRegex = /^[_a-z0-9-]+(\.[_a-z0-9-]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{1,15})$/
      if (searchValue && emailRegex.test(searchValue)) {
        searchResult = searchBasedOnEmail(dataSource, searchValue)
      } else if (searchValue) {
        searchResult = searchBasedOnName(dataSource, searchValue)
      } else {
        searchResult = dataSource
      }
      setActiveUser(searchResult)
    }
  }

  const constructExportCSVData = () => {
    let ExportCsvData = [];
    if (modelTitle !== "File Views") {
      ExportCsvData = activeUser.map((data) => {
        return {
          user: `${data.Firstname} ${data.Lastname}`,
          organization: data.Company,
          email: data.Email,
          total_product_views: data.product_views
        }
      })
    } else {
      ExportCsvData = activeUser.map((data) => {
        let bandwidthUsage = { bandwidth_consumed: getRoundValue(data.bandwidth_consumed, 2) }
        return {
          product_label: data.product_label, file_type: data.file_type, views
            : data.views, product_id: data.product_id, ...bandwidthUsage
        }
      })
    }
    return ExportCsvData

  }
  return (
    <div>
       {!isChartTable && <Modal
        style={{ top: 20 }}
        title={modelTitle}
        footer={null}
        width={1100}
        open={visible}
        onCancel={handleClose}
        bodyStyle={{ paddingTop: 15 }}
      >
        <div>
          {renderHeader()}
          <div className="d-flex mt-3 mb-3">
            <Input placeholder="Search" onChange={(e) => handleSearch(e)} id="searchValue" className="mr-3" allowClear ></Input>
            <CustomExportCsv
              dataSource={constructExportCSVData()}
              Headers={modelTitle === "File Views" ? activeUsersFileViewHeaders : activeUserHeaders}
              exportFileName={modelTitle}
            />
          </div>
          <CommonTable
            className="my-1"
            scroll={{ y: 450 }}
            pagination={false}
            columns={modelTitle === "File Views" ? fileColumns : activeUserColumn}
            dataSource={activeUser}
            loading={tableLoading}
          />
          
        </div>
      </Modal>}
      <div>
        { isChartTable && <CommonFileViewTable
          showModal={visible}
          handleCancel={handleClose}
          handlefilesChange={handlefilesChange}
          selectedFile={selectedFile}
          onFileSearch={onFileSearch}
          fileColumns={tableColumnKey}
          dataSource={fileDataSource}
          title={`File Views`}
          isFileView={true}
          exportFileName="File Views"
          isChartLabel={true}
          fileMonth={fileMonth}
        />}
      </div>
    </div>
  );
};
export default DetailsModal;
