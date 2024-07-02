import React, { useState, useEffect, useRef, useContext } from "react";
import { Col, Radio, Row, Table } from "antd";
import moment from "moment";
import _map from 'lodash/map';
import _groupBy from 'lodash/groupBy';
import CommonSpinner from "./common/CommonSpinner";
import DonationMonthChart from "./DonationMonthChart";
import { ConstructedData } from "./helper";
import { currencyFormatter, getFullMonthName, toTitleCase } from "../util";
import DownloadChart from "./common/DownloadChart";
import CustomExportCsv from "./common/CustomExportCsv"
import GlobalContext from "./context/DonationContext";
import { BarChartOutlined, TableOutlined } from "@ant-design/icons";

const DonationsByMonth = () => {

    const { donationCategory, config: {appDir, options, primaryColor} } = useContext(GlobalContext)
    const [activeTab, setActiveTab] = useState('horizontal')
    const [dataSource, setDataSource] = useState([])
    const [loading, setLoading] = useState(false)
    const [tableDataSource, setTableDataSource] = useState([])
    const [donationId, setDontionId] = useState([])
    const [noDataFound, setNoDataFound] = useState(false)
    const chartRef = useRef();

    useEffect(() => {
        if (donationId?.length) {
            getDonationData(moment().subtract(6, 'month').format('MM-DD-YYYY'), moment().format('MM-DD-YYYY'), donationId)
        }
    }, [donationId])

    useEffect(() => {
        if (activeTab === 'table' && dataSource.length) {
            setTableDataSource(groupByMonthData(dataSource))
        }
    }, [dataSource, activeTab])

    useEffect(() => {
        if (donationCategory?.length) {
            const donationIds = donationCategory.map((donation) => {
                return donation.donation_id
            })
            setDontionId(donationIds)
        }
    }, [donationCategory])

    const getDonationData = async (start_date, end_date, donationId) => {
        try {
            setLoading(true)
            const result = await fetch(`${appDir}?module=donations&component=reports&function=see_donations&start_date=${start_date}&end_date=${end_date}&donationids=[${donationId}]&membership=true`, options)
            const values = await result.json();
            if (values.length || result?.status == 200) {
                setNoDataFound(values?.length ? false: true)
                setLoading(false)
                setDataSource(values?.length ? values : [])
            }
        }
        catch (e) {
            setLoading(false)
            setNoDataFound(true)
            console.log("error", e);
        }
    }

    const groupByMonthData = (dataSource) => {
        const data = ConstructedData(dataSource);
        const groupedData = _map(_groupBy(data, "monthOfInvoice"), (groupArr) => {
            let month = ''
            let monthOfInvoice = ''
            let totalDonations = 0
            let yearOfInvoice = ''
            groupArr.map((val) => {
                month = val.month
                monthOfInvoice = val.monthOfInvoice
                totalDonations += val.amount
                yearOfInvoice = val.yearOfInvoice
            })
            return ({
                monthOfInvoice: monthOfInvoice,
                month: month,
                totalDonations: totalDonations,
                totalDonors: groupArr.length,
                yearOfInvoice: yearOfInvoice
            })
        })
        return groupedData
    }

    const handleClick = (e) => {
        setActiveTab(e.target.value)
    }

    const columnHeader = [
        {
            title: 'MONTH',
            dataIndex: 'month',
            key: 'month',
            width: 25,
            render: (_, data) => {
                return <div className="text-left" >{toTitleCase(getFullMonthName(data.monthOfInvoice))} {data.yearOfInvoice}</div>
            }
        },
        {
            title: 'DONATIONS',
            dataIndex: 'totalDonations',
            key: 'totalDonations',
            width: 5,
            render: (_, data) => {
                return <div className="text-left">{currencyFormatter(data.totalDonations)}</div>
            }
        }
    ]

    const donationByMonthHeaders = [
        { label: "MONTH", key: "Month" },
        { label: "DONATIONS", key: "TotalDonations" },
    ]

    return (
        <div style={{ height: "450px" }}>
            <CommonSpinner loading={loading}>
                <div style={{ padding: '10px' }}>
                    <Row>
                        <Col flex={3} className='side-menu-title'> {'DONATION BY MONTH'}</Col>
                        <Col className="pr-3">
                            <Radio.Group value={activeTab} onChange={handleClick}>
                                <Radio.Button value='horizontal'>
                                    <BarChartOutlined className="horizontal pr-1" />Horizontal</Radio.Button>
                                <Radio.Button value='vertical'>
                                    <BarChartOutlined className="pr-1" />Vertical</Radio.Button>
                                <Radio.Button value='table'>
                                    <TableOutlined className="pr-1" />Table</Radio.Button>
                            </Radio.Group>
                        </Col>
                        <div>
                            {activeTab === 'table' ?
                                <Col className="ml-2">
                                    {tableDataSource.length ?
                                        <CustomExportCsv
                                            dataSource={tableDataSource.map(data => {
                                                return {
                                                    Month: `${getFullMonthName(data.monthOfInvoice)} ${data.yearOfInvoice}`,
                                                    TotalDonations: data.totalDonations,
                                                }
                                            })}
                                            Headers={donationByMonthHeaders}
                                            exportFileName={"donation month"}
                                        /> : ""
                                    }
                                </Col>
                                : <Col>
                                    {dataSource.length ? <DownloadChart chartRef={chartRef} fileName={{ name: "Donation By Month", startDate: new Date() }} /> : ""}
                                </Col>
                            }
                        </div>
                    </Row>
                </div>
                {(activeTab === 'horizontal' || activeTab === 'vertical') && <div>
                    <DonationMonthChart noDataFound={noDataFound} dataSource={dataSource} isvertical={activeTab === 'vertical' && true} chartRef={chartRef} 
                        primaryColor={primaryColor} />
                </div>}
                {activeTab === 'table' && <div className="card-month-table">
                    <Table dataSource={tableDataSource} columns={columnHeader} pagination={false} scroll={{ y: 300 }} size='small' />
                </div>}
            </CommonSpinner>
        </div>
    )
}

export default DonationsByMonth;