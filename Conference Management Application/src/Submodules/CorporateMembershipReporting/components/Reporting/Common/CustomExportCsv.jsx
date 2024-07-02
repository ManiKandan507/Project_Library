import { CSVLink } from "react-csv";
import { ExportOutlined, DownloadOutlined } from "@ant-design/icons";
import { Button } from 'antd';
import dayjs from "dayjs";

export const CustomExportCsv = ({
   handleMemberDataExport = () => { },
   memberData = [],
   headers = [],
   handleExportCsv = false,
   fileName = {},
   exportTableRef,
   className = "my-2 text-right",
   isDownload = false
}) => {
   const generateFileName = () => {
      let csvFileName = fileName.name;
      if (fileName.startDate) {
         csvFileName += `-${dayjs(fileName.startDate).format("MMM-DD-YYYY")}`;
      }
      if (fileName.endDate) {
         csvFileName += `-${dayjs(fileName.endDate).format("MMM-DD-YYYY")}`;
      }
      return `${csvFileName ? csvFileName.toLocaleLowerCase() : 'data'}.csv`;
   }
   return (
      <div className={`${className}`}>
         <div className="export-csv-button">
            <Button icon={isDownload ? <DownloadOutlined /> : <ExportOutlined />} onClick={handleMemberDataExport} >{isDownload ? "Download" : "Export CSV"}</Button>
         </div >
         {memberData.length > 0 && handleExportCsv && (
            <CSVLink filename={generateFileName()} data={memberData} ref={exportTableRef} headers={headers} />
         )}
      </div>
   );
};
