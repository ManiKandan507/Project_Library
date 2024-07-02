
import React, { useState, useEffect, useRef } from 'react'
import { Button } from 'antd';
import { CSVLink } from 'react-csv';
import { DownloadOutlined } from '@ant-design/icons';

const CustomExportCsv = (props) => {
    const { dataSource, Headers, exportFileName } = props
    const exportCsvRef = useRef();
    const [downloadCsv, setDownloadCsv] = useState(false)

    const handleTableDataExport = (e) => {
        setDownloadCsv(true)
    }

    useEffect(() => {
        if (dataSource.length > 0 && exportCsvRef.current) {
            setTimeout(() => {
                exportCsvRef?.current?.link.click();
                setDownloadCsv(false)
            }, 20);
        }
    }, [dataSource, downloadCsv]);

    return (
        <div className='csv-hover'>
            <Button type="primary" className='exportBtnColor' onClick={handleTableDataExport} icon={<DownloadOutlined height="15px" />}>Export CSV </Button>
            {(downloadCsv && dataSource.length) && <CSVLink filename={exportFileName} data={dataSource} ref={exportCsvRef} headers={Headers} />}
        </div>
    )
}
export default CustomExportCsv;