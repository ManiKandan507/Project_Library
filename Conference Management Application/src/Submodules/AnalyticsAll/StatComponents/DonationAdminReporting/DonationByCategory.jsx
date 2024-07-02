import React, { useState, useRef, useEffect, useContext } from "react";
import { Button, Col, Radio, Row, Table } from "antd";
import CommonSpinner from "./common/CommonSpinner";
import moment from "moment";
import DonationCategoryChart from "./DonationCategoryChart";
import { CompareTableData } from "./helper";
import { currencyFormatter, getMonthName } from "../util";
import DownloadChart from "./common/DownloadChart"
import CustomExportCsv from "./common/CustomExportCsv";
import { LineChartOutlined, TableOutlined } from "@ant-design/icons";
import GlobalContext from "./context/DonationContext";

const DonationByCategory = (props) => {
    const { CategoryTypes } = props
    const { config } = useContext(GlobalContext)
    const { appDir, options, primaryColor } = config

    const chartRef = useRef();

    const [activeTab, setActiveTab] = useState('chart')
    const [dataSource, setDataSource] = useState([])
    const [loading, setLoading] = useState(false)
    const [tableDataSource, setTableDataSource] = useState([])
    const [donationCategory, setDonationCategory] = useState([])
    const [noDataFound, setNoDataFound] = useState(false)


    const dateRange = [moment().subtract(6, 'month').format('MM-DD-YYYY'), moment().format('MM-DD-YYYY')]

    useEffect(() => {
        if (CategoryTypes?.length) {
            setDonationCategory(constructDonationId(CategoryTypes))
        }
    }, [CategoryTypes])

    useEffect(() => {
        if (donationCategory?.length) {
            getDonorData(dateRange[0], dateRange[1], donationCategory)
        }
    }, [donationCategory])

    useEffect(() => {
        if (activeTab === 'table' && (dataSource.length && CategoryTypes.length)) {
            const ConstructedData = CompareTableData(dataSource, CategoryTypes)
            setTableDataSource(ConstructedData)
        }
    }, [dataSource, activeTab, CategoryTypes])

    const constructDonationId = () => {
        const donationIds = CategoryTypes.map((category) => {
            return category.donation_id
        })
        return donationIds
    }

    const getDonorData = async (start_date, end_date, donationCategory) => {
        try {
            setLoading(true)
            const result = await fetch(`${appDir}?module=donations&component=reports&function=see_donations&start_date=${start_date}&end_date=${end_date}&donationids=[${donationCategory}]&membership=true`, options)
            const values = await result.json();
            if (values.length || result?.status == 200) {
                setLoading(false)
                setNoDataFound(values?.length?false: true)
                setDataSource(values?.length? values : [])
            }
        }
        catch (e) {
            setNoDataFound(true)
            console.log('error', e);
            setLoading(false)
        }
    }

    const handleClick = (e) => {
        setActiveTab(e.target.value)
    }

    const donationType = [...new Set(tableDataSource.map((value) => value.donationName))]

    const columnHeader = [
        {
            title: 'MONTH',
            dataIndex: 'monthAndYear',
            key: 'monthAndYear',
            width: 6,
            render: (data, row, index) => {
                const obj = {
                    children: <div>{data}</div>,
                    props: {}
                }
                for (let i = 0; i <= tableDataSource.length; i++) {
                    if (index % donationType.length === 0) {
                        obj.props.rowSpan = donationType.length;
                    }
                    if (index % donationType.length !== 0) {
                        obj.props.rowSpan = 0;
                    }
                }
                return obj
            }
        },
        {
            title: 'DONATION NAME',
            colspan: 0,
            dataIndex: 'donationName',
            key: 'donationName',
            width: 20,
            render: (data, row, index) => {
                const obj = {
                    children: data,
                    props: {}
                }
                return obj
            }
        },
        {
            title: 'AMOUNT',
            colspan: 0,
            dataIndex: 'totalAmount',
            key: 'totalAmount',
            width: 5,
            render: (data, row, index) => {
                const obj = {
                    children: data === 0 ? data : currencyFormatter(data),
                    props: {}
                }
                return obj
            }
        },
    ]

    const donationByCategoryHeaders = [
        { label: "MONTH", key: "MonthName" },
        { label: "DONATION NAME", key: "DonationName" },
        { label: "AMOUNT($)", key: "TotalAmount" },
    ]

    return (
        <div>
            <CommonSpinner loading={loading}>
                <div className="py-4">
                    <Row gutter={16}>
                        <Col flex={3} className='side-menu-title ml-2'>{'DONATION BY CATEGORY'}</Col>
                        <Col>
                            <Radio.Group value={activeTab} onChange={handleClick}>
                                <Radio.Button value='chart'>
                                    <LineChartOutlined className="pr-1" />Chart</Radio.Button>
                                <Radio.Button value='table'>
                                    <TableOutlined className="pr-1" />Table</Radio.Button>
                            </Radio.Group>
                        </Col>
                        {dataSource?.length ?
                            <>
                                {activeTab === 'chart' ?
                                    <Col >
                                        <DownloadChart chartRef={chartRef} fileName={{ name: "Donation Category" }} />
                                    </Col> :
                                    <Col>
                                        <CustomExportCsv
                                            dataSource={tableDataSource.map(data => {
                                                return {
                                                    MonthName: data.monthAndYear,
                                                    DonationName: data.donationName,
                                                    TotalAmount: data.totalAmount,
                                                }
                                            })}
                                            Headers={donationByCategoryHeaders}
                                            exportFileName={`donation-category-${moment(dateRange[0]).format('MM-DD-YYYY')}-to-${moment(dateRange[1]).format('MM-DD-YYYY')}`}
                                        />
                                    </Col>
                                }
                            </> : <></>
                        }
                    </Row>
                    {activeTab === 'chart' && <div className="py-2" style={{ height: '350px' }}>
                        <DonationCategoryChart noDataFound={noDataFound} dataSource={dataSource} CategoryTypes={CategoryTypes} chartRef={chartRef} primaryColor={primaryColor} />
                    </div>}
                    {activeTab === 'table' && <div className="mt-4">
                        <Table dataSource={tableDataSource} columns={columnHeader} pagination={false} scroll={{ y: 300 }} bordered={true} size='small' />
                    </div>}
                    <div className="py-2 ml-6">
                        <Button className="exploreMore custom-theme-color" onClick={() => props.handleExplore('donations')}> <span style={{ textDecoration: 'underline' }}> Explore More </span></Button>
                    </div>
                </div>
            </CommonSpinner>
        </div>
    )
}

export default DonationByCategory;