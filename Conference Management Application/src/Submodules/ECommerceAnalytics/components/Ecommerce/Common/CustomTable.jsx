import React from "react";
import { Table, Pagination, Button } from "antd";
import { MailOutlined } from "@ant-design/icons";

import { PAGE_SIZE } from "../../../constants";
import { CustomExportCsv } from "./CustomExportCsv";

const CustomTable = ({
   className = '',
   columns = [],
   tableData = [],
   exportCsv = true,
   scroll = {},
   selectedItem = {},
   handlePagination = () => { },
   exportCsvInfo = {},
   page = 1,
   pageSize = PAGE_SIZE,
   size = "small",
   showSendEmail = false,
   onSendEmail = () => { },
   bordered = false,
   loading = false,
   showPagination = true
}) => {
   const { className: csvClass, memberData, screen, handleExportCsv, exportTableRef, fileName, handleMemberDataExport, headers, isDownload = false } = exportCsvInfo
   return (
      <div className="mb-5">
         <Table
            className={className}
            columns={columns}
            scroll={scroll}
            dataSource={tableData}
            pagination={false}
            size={size}
            bordered={bordered}
            loading={loading}
            rowKey={(record) => record.key ?? record.product_id}
         />
         <div className="my-4 text-center d-flex justify-end mr-5">
            {selectedItem.totalCount > 0 && showPagination && tableData.length ? <Pagination
               // showSizeChanger={selectedItem.total > PAGE_SIZE}
               // pageSizeOptions={[5, 10, 20, 50, 100]}
               showSizeChanger={false}
               defaultCurrent={page}
               defaultPageSize={pageSize}
               total={selectedItem.totalCount}
               onChange={(e, size) => handlePagination(e, size, false)}
            /> : null}
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

export default CustomTable;