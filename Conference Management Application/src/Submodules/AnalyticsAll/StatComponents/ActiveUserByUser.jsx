import { useState, useCallback, useMemo } from "react";
import _filter from 'lodash/filter';
import _slice from 'lodash/slice';
import { useMostActiveUserHook } from "@/AnalyticsAll/StatComponents/hooks/MostActiveUserHook";
import { Avatar, Col, Input, Row, Tooltip, } from "antd"
import { UserOutlined } from '@ant-design/icons';

import CommonDatePicker from "@/AnalyticsAll/StatComponents/common/CommonDatePicker"
import { convertLowercaseFormat, formatDate, get90PriorDate, getCurrentDate, getRoundValue, searchBasedOnName, sortName, sortColumnData, sortNumbers } from "@/AnalyticsAll/StatComponents/utils";
import { DoubleRightOutlined } from "@ant-design/icons";
import { useStatistics } from "@/AnalyticsAll/StatComponents/hooks/StatisticsHook";
import CommonTable from '@/AnalyticsAll/StatComponents/common/CommonTable';
import CommonFileViewTable from "@/AnalyticsAll/StatComponents/common/CommonFileViewTable";
import CustomExportCsv from '@/AnalyticsAll/StatComponents/common/CustomExportCsv';
import CommonSpinner from "@/AnalyticsAll/StatComponents/common/CommonSpinner";
import useProductModalDataConstruct from "@/AnalyticsAll/StatComponents/common/ProductModalTableHook";

export const ActiveUserByUser = ({ appdir }) => {
  const [dates, setDates] = useState([get90PriorDate(), getCurrentDate()]);
  const [showModal, setShowModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState('all')
  const [modalTitle, setModalTitle] = useState('');
  const [activeUserTableData, setActiveUserTableData] = useState()
  const [activeUserDataSource, setActiveUserDataSource] = useState([])
  const [selectedFileTypeData, setSelectedFileTypeData] = useState([])
  const [fileSearchValue, setFileSearchValue] = useState('')

  const { mostActiveUser, loading } = useMostActiveUserHook(appdir, dates);
  const productTableDataSource = useProductModalDataConstruct(selectedFile, fileSearchValue, selectedFileTypeData);


  useMemo(() => {
    if (mostActiveUser.length) {
      let filterFileViewsRecord = (_slice(_filter(mostActiveUser, (data) => data?.file_views > 0), 0, 10)).map(item => {
        return { ...item, bandwidth_consumed: getRoundValue(item.bandwidth_consumed, 2) }
      })
      setActiveUserDataSource(filterFileViewsRecord)
      setActiveUserTableData(filterFileViewsRecord)
    }
  }, [mostActiveUser])

  const userColumns = [
    {
      title: 'NAME',
      dataIndex: 'user',
      key: 'user',
      render: (_, data) => {
        return (
          <div style={{ fontSize: '16px' }} className='d-flex'>
            <Avatar size={40} alt="profile" icon={<UserOutlined />} src={data?.Picture} />
            <div style={{ marginLeft: "10px" }}>{data.Firstname} {data.Lastname}</div>
          </div>
        )
      },
      sorter: sortName
    },
    {
      title: 'FILES ACCESSED',
      dataIndex: 'file_views',
      key: 'file_views',
      render: (_, data, i) => {
        return (
          <div className='d-flex userDatas'>
            <div key={i} onClick={() => handleModalClick(data)} className='userCount'>{data.file_views}</div>
          </div>
        )
      },
      sorter: (obj1, obj2) => sortNumbers(obj1, obj2, 'file_views'),
    },
    {
      title: 'BANDWIDTH',
      dataIndex: 'bandwidth_consumed',
      key: 'bandwidth_consumed',
      render: (_, data) => {
        const bandWidth = getRoundValue(data.bandwidth_consumed, 2)
        return <div className="d-flex">{bandWidth} GB</div>
      },
      sorter: (obj1, obj2) => sortNumbers(obj1, obj2, 'bandwidth_consumed'),
    }
  ];

  const fileColumns = [
    {
      title: 'Product Name',
      dataIndex: 'product_name',
      key: 'product_name',
      className: 'text-left',
      width: '75%',
      ellipsis: {
        showTitle: false,
      },
      render: (_, data) => {
        return (
          <>
            <Tooltip placement="topLeft" title={data.product_label}>
              <div style={{ fontSize: "18px" }} className='elipsis'>{data.product_label}</div>
            </Tooltip>
            <div className="d-flex">
              {data?.product_hierarchy?.parent.length ? data?.product_hierarchy?.parent.map((item, i) => {
                return (
                  <div key={i}>
                    {(item?.immediate_parent === 0 || item?.immediate_parent === 1) &&
                      <div className="d-flex" style={{ flexWrap: "wrap" }}>
                        {item?.immediate_parent === 0 ? <div className="ml-0 elipsis" style={{ width: "338px" }}><DoubleRightOutlined /> {`${item?.ProductLabel}`}</div> : <div style={{ width: "300px" }} className="ml-2 elipsis"><DoubleRightOutlined /> {item?.ProductLabel}</div>}
                      </div>}
                  </div>)
              }) : null}
            </div>

          </>
        )
      },
      sorter: (obj1, obj2) => sortColumnData(obj1, obj2, 'product_label')
    },
    {
      title: 'Type',
      dataIndex: 'file_type',
      key: 'file_type',
      className: 'text-left',
      render: (data) => {
        return <div>{data === 'Unknown' ? '' : data}</div>
      },
      width: '12.5%',
      sorter: (obj1, obj2) => sortColumnData(obj1, obj2, 'file_type')
    },
    {
      title: 'Views',
      dataIndex: 'views',
      key: 'views',
      width: '12.5%',
      className: 'text-left',
      sorter: (obj1, obj2) => sortNumbers(obj1, obj2, 'views'),
    },
  ];


  const activeUsersHeaders = [
    { label: 'NAME', key: 'user' },
    { label: 'FILES ACCESSED', key: 'file_views' },
    { label: 'BANDWIDTH (GB)', key: 'bandwidth' },
  ]

  const BandWidthUsage = useMemo(() => {
    let bandWidthCount= 0;
      activeUserDataSource.forEach((data)=>{
         return bandWidthCount+= data.bandwidth_consumed
      })

    return [
      {
        title: "BANDWIDTH USED",
        current: getRoundValue(bandWidthCount, 2), 
        suffix: 'GB',
        color: 'green'
      }
    ];
  }, [activeUserDataSource])


  const handleModalClick = (data) => {
    const name = `${data.Firstname} ${data.Lastname}`
    let filterUserData = mostActiveUser.filter((item) => item.UUID === data.UUID);
    setModalTitle(name)
    setSelectedFile("all")
    setShowModal(true)
    setSelectedFileTypeData(filterUserData[0]?.file_details)
  }

  const handlefilesChange = (e) => {
    setSelectedFile(e?.target?.value);
  }

  const handleCancel = () => {
    setShowModal(false);
    setSelectedFileTypeData([]);
    setFileSearchValue('');
  }

  const handleDate = useCallback((value, dateStrings) => {
    setDates([
      dateStrings?.[0] ? formatDate(dateStrings?.[0]) : "",
      dateStrings?.[1] ? formatDate(dateStrings?.[1]) : ""
    ]);
  }, [dates])

  const onFileSearch = (searchValue) => {
    searchValue = convertLowercaseFormat(searchValue.target.value);
    setFileSearchValue(searchValue);
  }
  const onActiveUserSearch = (searchValue) => {
    searchValue = convertLowercaseFormat(searchValue.target.value);
    let searchResult = [];
    if (searchValue) {
      searchResult = searchBasedOnName(activeUserTableData, searchValue);
    } else {
      searchResult = activeUserTableData;
    }
    setActiveUserDataSource(searchResult);
  }
  return (
    <>
      <Row gutter={16} className='mt-4'>
        <Col flex={3}>
          <Input placeholder="Search" onChange={onActiveUserSearch} allowClear ></Input>
        </Col>
        <Col>
          <CustomExportCsv
            dataSource={activeUserDataSource.map((data) => {
              return { user: `${data.Lastname} ${data.Firstname}`, bandwidth: data.bandwidth_consumed, file_views: data.file_views }
            })}
            Headers={activeUsersHeaders}
            exportFileName="By ActiveUsers"
          />
        </Col>
        <Col>
          <CommonDatePicker handleDate={handleDate} dates={dates} />
        </Col>
      </Row>
      <Row gutter={16} className="py-7">
        <Col flex={3}>
          <CommonTable
            dataSource={activeUserDataSource}
            columns={userColumns}
            pagination={false}
            loading={loading}
            className='ActiveUserTable'
          />
        </Col>
        <Col flex={1}>
          <CommonSpinner loading={loading} >
            <div className="mt-3">
              {BandWidthUsage.map((data => {
                return (
                  <div className='BandWidthText ml-16'>
                    <div className="card-title" >{data.title}</div>
                    <div className="progrssBarValue" style={{ fontWeight: '700' }}>{data.current} <span> {data.suffix}</span></div>
                  </div>
                )
              }))
              }
            </div>
          </CommonSpinner>
        </Col>
      </Row>
      <CommonFileViewTable
        showModal={showModal}
        handleCancel={handleCancel}
        handlefilesChange={handlefilesChange}
        selectedFile={selectedFile}
        onFileSearch={onFileSearch}
        fileColumns={fileColumns}
        dataSource={productTableDataSource}
        title={`${modalTitle}- File Views`}
        exportFileName={`${modalTitle}- File Views`}
      />
    </>
  )
}