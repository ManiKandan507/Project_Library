import React, { useEffect, useState } from "react";
import { ResponsivePie } from '@nivo/pie';
import _map from 'lodash/map';
import _groupBy from 'lodash/groupBy';
import CommonSpinner from "../common/CommonSpinner";
import { Col, Row, Table, Typography, Tooltip } from "antd";
import { currencyFormatter, stringToColour, toTitleCase } from "../../util";
import { customColor } from "../helper";

const CommonPieChart = ({
    dataSource,
    type,
    columnTitle,
    setShowModal,
    setTableClickData,
    primaryColor,
    loading = false
}) => {

    const [constructedData, setConstructedData] = useState([])
    const [tableSource, setTableSource] = useState([])
    const [totalDonation, setTotalDonation] = useState(0)
    const [totalDonors, setTotalDonors] = useState(0)
    const [pieChartData, setPieChartData] = useState([])
    
    useEffect(() => {
        if (type === 'membershipType' && primaryColor) {
            const filteredResult = groupedDonorData(dataSource, type).filter((value) => { return value.id !== 'Individual' && value.id !== 'Corporation' });
            setConstructedData(filteredResult)
        } else {
            const filteredResult = groupedDonorData(dataSource, type);
            setConstructedData(filteredResult)
        }
    }, [dataSource, type])

    useEffect(() => {
        if (constructedData.length > 0 && primaryColor) {
            setPieChartData(customColor(primaryColor, constructedData))
        }
    }, [constructedData, primaryColor])

    const constructedDonorData = (dataSource) => {
        const donor = []
        dataSource?.map((data) => {
            if (data.reviewid > 0 && !Object.keys(data).includes('membership_group_id')) {
                donor.push({
                    ...data,
                    type: 'Individual',
                    membershipType: "Individual"
                })
            }
            if (data.reviewid > 0 && (Object.keys(data).includes('membership_group_id') || data?.membership_group_id > 0)) {
                donor.push({
                    ...data,
                    type: 'Member',
                    membershipType: "Individual Membership"
                })
            }
            if (data.company_id > 0 && !Object.keys(data).includes('corp_membership_type_id')) {
                donor.push({
                    ...data,
                    type: 'Corporation',
                    membershipType: "Corporation"
                })
            }
            if (data.company_id > 0 && (Object.keys(data).includes('corp_membership_type_id') || data.corp_membership_type_id > 0)) {
                donor.push({
                    ...data,
                    type: 'Corporate Member',
                    membershipType: "Corporate Membership"
                })
            }
        })
        return donor
    }

    const groupedDonorData = (dataSource, type) => {

        const constructedData = constructedDonorData(dataSource);

        let totalDonation = 0
        let totalCount = 0

        const groupedArray = _map(_groupBy(constructedData, `${type}`), (groupArr) => {
            let id = ''
            let value = []
            let totalAmount = 0
            groupArr.map((group) => {
                id = group?.[type]
                totalAmount += group?.amount
                value.push(group)
            })

            return {
                id: id,
                count: value.length,
                value: totalAmount,
                data: value,
            }
        })

        groupedArray.forEach((group) => {
            totalDonation += group?.value;
            totalCount += group?.count
        })

        const constructTotalAmount = groupedArray.map((data) => {
            return {
                ...data,
                totalDonation: totalDonation,
                totalCount: totalCount,
            }
        })

        setTotalDonation(totalDonation)
        setTotalDonors(totalCount)

        if (dataSource?.length && type === 'country') {

            let otherAmount = 0;
            let otherDonation = [];

            const constructOtherDonation = constructTotalAmount.map((value) => {
                if ((value?.value / value.totalDonation) * 100 < 2) {
                    otherAmount += value.value
                    otherDonation.push(value.data)
                }
                return {
                    ...value,
                    amountPercentage: (value?.value / value.totalDonation) * 100
                }
            })

            const finalResult = constructOtherDonation.filter((value) => { return value.amountPercentage > 2 })

            finalResult.push({
                id: 'Others',
                count: otherDonation.length,
                value: otherAmount,
                data: otherDonation.flat(1),
            })

            setTableSource(constructTotalAmount)

            return finalResult;

        } else if (type === 'membershipType') {

            let totalDonation = 0;
            let totalCount = 0

            const filteredArray = groupedArray.filter((arr) => { return arr.id !== 'Individual' && arr.id !== 'Corporation' })

            filteredArray.forEach((value) => {
                totalDonation += value.value
                totalCount += value.count
            })

            const resultedArray = filteredArray.map((value) => {
                return {
                    ...value,
                    totalDonation: totalDonation,
                    totalCount: totalCount
                }
            })
            setTotalDonors(totalCount)
            setTotalDonation(totalDonation)
            setTableSource(resultedArray)
            return resultedArray;

        } else {

            const resultedArray = groupedArray.map((arr) => {
                return {
                    ...arr,
                    totalDonation: totalDonation,
                    totalCount: totalCount
                }
            })
            setTotalDonation(totalDonation)
            setTotalDonors(totalCount)
            setTableSource(resultedArray)
            return resultedArray;
        }

    }

    const handleTableClick = (data) => {
        setTableClickData(data)
        setShowModal(true)
    }

    const columnHeader = [
        {
            title: <Tooltip title={columnTitle}>{columnTitle}</Tooltip>,
            dataIndex: "id",
            key: 'id',
            width: 7,
            ellipsis: true,
            render: (_, data) => {
                return (
                    <div className="text-wrap">{data.id}</div>
                )
            }
        },
        {
            title: "COUNT",
            dataIndex: "count",
            key: 'count',
            width: 5,
            render: (_, data) => {
                return (
                    <div className="d-flex align-end">
                        <div className="mr-1">{data.count}</div>
                        <div className="font-s12 percentage">{((data.count / data.totalCount) * 100).toFixed(2)}%</div>
                    </div>
                )
            }
        },
        {
            title: "AMOUNT",
            dataIndex: 'value',
            key: 'value',
            width: 5,
            render: (_, data) => {
                return (
                    <div className="d-flex align-end ">
                        <div className="clickable-column custom-theme-color mr-1" onClick={() => handleTableClick(data)}>{currencyFormatter(data.value)} </div>
                        <div className="font-s12 percentage">{((data.value / data.totalDonation) * 100).toFixed(2)}%</div>
                    </div>
                )
            }
        }
    ]

    return (
        <CommonSpinner loading={loading}>
            <Row className="mt-4">
                <Col className="total-values mr-1">Total Donation: </Col>
                {
                // (totalDonation && totalDonors) ?
                    <>
                        <Col className="custom-theme-color total-count mr-1">
                            {currencyFormatter(totalDonation)}
                        </Col>
                        <Col className="total-count" >
                            - {totalDonors} units
                        </Col>
                    </> 
                    // :
                    // <Col flex={1} className="ml-1">Loading...</Col>
                }
            </Row>
            <Row>
                <Col span={12} className="text-center">
                    <div style={{ height: '400px', width: '100%', margin: 'auto' }}>
                        {pieChartData?.length ? <ResponsivePie
                            data={pieChartData}
                            margin={{ top: 40, right: 120, left: 100, bottom: 40 }}
                            innerRadius={0.5}
                            padAngle={1.5}
                            cornerRadius={3}
                            activeOuterRadiusOffset={8}
                            borderWidth={1}
                            colors={{
                                datum: 'data.color'
                            }}
                            valueFormat={value => `${currencyFormatter(value)}`}
                            arcLinkLabelsSkipAngle={0}
                            onClick={(e) => handleTableClick(e?.data)}
                            enableArcLinkLabels={true}
                            arcLinkLabelsTextColor="#333333"
                            arcLinkLabelsThickness={2}
                            arcLinkLabelsColor={{ from: 'color' }}
                            arcLabelsSkipAngle={10}
                            arcLabelsTextColor={{
                                from: 'color',
                                modifiers: [['darker', 2]]
                            }}
                        /> : ''}
                    </div>
                </Col>
                <Col span={12} className="col-6">
                    <Table
                        dataSource={tableSource}
                        columns={columnHeader}
                        pagination={false}
                        scroll={{ y: '380px' }}
                        bordered
                        size={"small"}
                    />
                </Col>
            </Row>
        </CommonSpinner>
    )
}
export default CommonPieChart;