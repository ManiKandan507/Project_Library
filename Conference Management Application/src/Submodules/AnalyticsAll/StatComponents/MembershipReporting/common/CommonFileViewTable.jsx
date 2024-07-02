import React, { useState } from 'react'
import { Radio, Typography, Input, Modal } from "antd";
import CommonTable from '@/MembershipReportingV2/common/CommonTable';
import CustomExportCsv from '@/MembershipReportingV2/common/CustomExportCsv';
import { getRoundValue } from '@/AnalyticsAll/StatComponents/utils';
import { useEffect } from 'react';

const CommonFileViewTable = (props) => {

  const { showModal, handleCancel = () => { }, handlefilesChange = () => { }, selectedFile, onFileSearch = () => { }, fileColumns, dataSource, title, isFileView = false, exportFileName = "", isChartLabel = false, fileMonth = "" } = props
  const [fileViewsCount, setFileViewsCount] = useState()

  const activeUsersHeaders = [
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
    }
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
    {
      label: 'Total Bandwidth(GB)',
      key: 'bandwidth_consumed',
    }
  ]

  const constructData = () => {
    let ExportCsvData = [];
    if (isFileView) {
      ExportCsvData = dataSource.map((data) => {
        let bandwidthUsage = isFileView && { bandwidth_consumed: getRoundValue(data.bandwidth_consumed, 2) }
        return {
          product_label: data.product_label, file_type: data.file_type, views
            : data.views, product_id: data.product_id, ...bandwidthUsage
        }
      })
    } else {
      ExportCsvData = dataSource;
    }
    return ExportCsvData;
  }

  const renderFileMonth = () => {
    if (isChartLabel) {
      return <div className='text-center'>
        <Typography className="monthtype">Month</Typography>
        <div className="py-2 fileViews" > {fileMonth}</div>
      </div>
    }
    return null
  }
  
  useEffect(()=>{
      let viewsCount = 0;
      dataSource.map((data) => {
        return viewsCount+=data?.views
      });
      setFileViewsCount(viewsCount)
  },[dataSource])

  return (
    <>
      {showModal && <Modal open={showModal} title={title} onCancel={handleCancel} footer={null} width='80%'>
        <div className="py-2 d-flex ">
          <div className="py-2"> {renderFileMonth()} </div>
          <div className='ml-6'>
            <Typography className="py-2" style={{ fontSize: "16px", color: '#c3c3c3' }}>File Type</Typography>
            <div>
              <Radio.Group onChange={handlefilesChange} value={selectedFile}  >
                <Radio value='all'>ALL</Radio>
                <Radio value='PDF'>PDFS</Radio>
                <Radio value='Video'>VIDEOS</Radio>
                <Radio value='Images'>IMAGES</Radio>
              </Radio.Group>
            </div>
          </div>
          <div className='ml-6'>
            <Typography className="py-2" style={{ fontSize: "16px", color: '#c3c3c3' }}>Total Views</Typography>
            <div className="fileViews" > {fileViewsCount}</div>
          </div>
        </div>
        <div className="d-flex mt-3">
          <Input placeholder="Search" onChange={onFileSearch} id="searchValue" className="mr-3" allowClear ></Input>
          <CustomExportCsv
            dataSource={constructData()}
            Headers={isFileView ? activeUsersFileViewHeaders : activeUsersHeaders}
            exportFileName={exportFileName}
          />
        </div>
        <div>
          <CommonTable
            columns={fileColumns}
            dataSource={dataSource}
            pagination={true}
            className='userModal py-5'
            scroll={{ y: 350 }}
            loading={false}
          />
        </div>
      </Modal>}
    </>
  )
}

export default CommonFileViewTable