import React from "react";
import { Table, Pagination, Button } from "antd";
import { MailOutlined } from "@ant-design/icons";
import _isEmpty from 'lodash/isEmpty'

import { PAGE_SIZE } from "../../../constants";
import { CustomExportCsv } from "./CustomExportCsv";
import { useState } from "react";
import { useEffect } from "react";

const CustomTable = ({
   className = '',
   columns = [],
   tableData = [],
   exportCsv = true,
   scroll = {},
   selectedItem = {},
   handleMemberInfo = () => { },
   exportCsvInfo = {},
   page = false,
   pageSize = false,
   size = "small",
   showSendEmail = false,
   onSendEmail = () => { },
}) => {
   const { className: csvClass, memberData, screen, handleExportCsv, exportTableRef, fileName, handleMemberDataExport, headers, isDownload = false } = exportCsvInfo
   const [currentPage, setCurrentPage] = useState(1);
   const [currentPageSize, setCurrentPageSize] = useState(PAGE_SIZE);
   useEffect(() => {
      if (page) { setCurrentPage(page) }
      if (pageSize) { setCurrentPageSize(pageSize) }
   }, [page, pageSize])
   const handlePaginationChange = (e, size) => {
      setCurrentPage(e);
      setCurrentPageSize(size);
      handleMemberInfo(e, size, false);
   }
   return (
      <div className="mb-5">
         <Table className={className} columns={columns} scroll={scroll} dataSource={tableData} pagination={false} size={size} />
         <div className="my-4 text-center d-flex justify-end mr-5">
            {tableData.length > 0 && <Pagination
               showSizeChanger={selectedItem.value > PAGE_SIZE}
               pageSizeOptions={[5, 10, 20, 50, 100]}
               current={currentPage}
               pageSize={currentPageSize}
               defaultCurrent={1}
               defaultPageSize={PAGE_SIZE}
               total={selectedItem.value}
               onChange={handlePaginationChange}
            />}
            {showSendEmail && <Button icon={<MailOutlined />} className="ml-4" onClick={onSendEmail}>Send Email</Button>}
            {exportCsv && <CustomExportCsv
               className={csvClass}
               handleMemberDataExport={handleMemberDataExport}
               fileName={fileName}
               memberData={memberData}
               handleExportCsv={handleExportCsv}
               screen={screen}
               exportTableRef={exportTableRef}
               headers={headers}
               isDownload={isDownload}
            />}
         </div>
      </div>
   )
}

export default CustomTable