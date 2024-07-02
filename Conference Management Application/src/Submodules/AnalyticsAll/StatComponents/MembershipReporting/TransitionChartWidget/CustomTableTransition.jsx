import React from "react";
import { Table, Pagination, Button } from "antd";
import { MailOutlined } from "@ant-design/icons";
import _isEmpty from 'lodash/isEmpty'

import { PAGE_SIZE } from "../../../constants";
// import { CustomExportCsv } from "./CustomExportCsv";

const CustomTableTransition = ({
   className = '',
   columns = [],
   tableData = [],
   exportCsv = true,
   scroll = {},
   selectedItem = {},
   handleMemberInfo = () => { },
   exportCsvInfo = {},
   page = 1,
   pageSize = PAGE_SIZE,
   size = "small",
   showSendEmail = false,
   onSendEmail = () => { },
   expandRowRender = (element) => { console.log(element); },
   rowKey= ""
}) => {
   const { className: csvClass, memberData, screen, handleExportCsv, exportTableRef, fileName, handleMemberDataExport, headers, isDownload = false } = exportCsvInfo

   return (
      <div className="mb-5">
         <Table className={className} columns={columns} scroll={scroll} dataSource={tableData} pagination={false} size={size} expandable={expandRowRender} rowKey={rowKey} />
         <div className="my-4 text-center d-flex justify-end mr-5">
            {tableData.length > 0 && <Pagination
               showSizeChanger={selectedItem.value > PAGE_SIZE}
               pageSizeOptions={[5, 10, 20, 50, 100]}
               defaultCurrent={page}
               defaultPageSize={pageSize}
               total={selectedItem.value}
               onChange={(e, size) => handleMemberInfo(e, size, false)}
            />}
            {showSendEmail && <Button icon={<MailOutlined />} className="ml-4" onClick={onSendEmail}>Send Email</Button>}
            {/* {exportCsv && <CustomExportCsv
               className={csvClass}
               handleMemberDataExport={handleMemberDataExport}
               fileName={fileName}
               memberData={memberData}
               handleExportCsv={handleExportCsv}
               screen={screen}
               exportTableRef={exportTableRef}
               headers={headers}
               isDownload={isDownload}
            />} */}
         </div>
      </div>
   )
}

export default CustomTableTransition