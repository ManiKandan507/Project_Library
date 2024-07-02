import React, { useRef, useState, useEffect, useContext } from "react";
import { Button, Col, DatePicker, Row, Select } from "antd";
import moment from "moment";
import { SearchOutlined } from "@ant-design/icons";
import GlobalContext from "../../context/MemberContext";
import { isEmpty } from "lodash";
const { Option } = Select;

const SingleMonthMultiYear = ({ minimumYear, dateFormat, configDates, membershipType }) => {

    const { multiYearDates, setMultiYearDates, setSelectedDates, setViewBy, viewBy, setIsTouched } = useContext(GlobalContext)
    const [multiDates, setMultiDates] = useState({
        startDate: '',
        endDate: '',
        // startMonth: '',
        // endMonth: '',
        // startYear: '',
        // endYear: '',
    })
    const [type, setType] = useState(isEmpty(viewBy) ? 'month' : viewBy)

    useEffect(() => {
        if (multiYearDates.length > 0 && membershipType) {
            let DifferenceInTime = new Date(`${moment(multiYearDates[1], 'DD/MM/YYYY').format('MM/DD/YYYY')}`).getTime() - new Date(`${moment(multiYearDates[0], 'DD/MM/YYYY').format('MM/DD/YYYY')}`).getTime()
            let DifferenceInDays = Math.round(DifferenceInTime / (1000 * 3600 * 24))
            if (DifferenceInDays > 365) {
                setType("year")
            }
        }
    }, [multiYearDates, membershipType])
    useEffect(() => {
        if (!multiYearDates.length) {
            setMultiYearDates(configDates)
        }
        setMultiDates((prev) => (
            {
                ...prev,
                startDate: moment(multiYearDates[0] ?? configDates[0], 'DD/MM/YYYY'),
                endDate: moment(multiYearDates[1] ?? configDates[1], 'DD/MM/YYYY'),
                // startMonth: moment(configDates[0]).format('MM'),
                // endMonth: moment(configDates[1], 'DD/MM/YYYY').format('MM'),
                // startYear: moment(configDates[0]).format('YYYY'),
                // endYear: moment(configDates[1], 'DD/MM/YYYY').format('YYYY')
            }
        ))
        // setSelectedDates([configDates[0],configDates[1]])
    }, [])

    const handleDate = (value, dateString, dateType) => {
        // if(type === 'startMonth'){
        //     setMultiDates((prev)=>(
        //         {
        //             ...prev,
        //             startDate: moment(value).startOf('month').format('DD'),
        //             endDate: moment(value).subtract(1,'month').endOf('month').format('DD'),
        //             startMonth: moment(value).format('MM'),
        //             endMonth: moment(value).add(11, 'months').format('MM'),
        //         }
        //     ))
        // }
        // if(type === 'startYear'){
        //     setMultiDates((prev)=>(
        //         {
        //             ...prev,
        //             startYear: dateString
        //         }
        //     ))
        // }
        // if(type === 'endYear') {
        //     setMultiDates((prev) => (
        //         {
        //             ...prev,
        //             endYear: dateString
        //         }
        //     ))
        // }
        if (dateType === 'startDate') {

            if (type === 'month') {
                setMultiDates((prev) => (
                    {
                        ...prev,
                        startDate: moment(value).startOf('month'),
                    }
                ))
            }
            if (type === 'quarter') {
                setMultiDates((prev) => (
                    {
                        ...prev,
                        startDate:moment(value).startOf('quarter'),
                    }
                ))
            }
            if (type === 'year') {
                setMultiDates((prev) => (
                    {
                        ...prev,
                        startDate: moment(value).startOf('year'),
                    }
                ))

            }

        }
        if (dateType === 'endDate') {
            if (type === 'month') {
                setMultiDates((prev) => (
                    {
                        ...prev,
                        endDate: moment(value).endOf('month')
                    }
                ))

            }
            if (type === 'quarter') {

                setMultiDates((prev) => (
                    {
                        ...prev,
                        endDate: moment(value).endOf('quarter')
                    }
                ))
            }
            if (type === 'year') {

                setMultiDates((prev) => (
                    {
                        ...prev,
                        endDate: moment(value).endOf('year')
                    }
                ))
            }

        }
    }
    useEffect(() => {

        if (type && !isEmpty(multiDates.startDate) && !isEmpty(multiDates.endDate)) {
            if (type === 'month') {
                setMultiDates((prev) => (
                    {
                        ...prev,
                        startDate: moment(multiDates.startDate).startOf('month'),
                        endDate: moment(multiDates.endDate).endOf('month')
                    }
                ))
            }
            if (type === 'quarter') {
                setMultiDates((prev) => (
                    {
                        ...prev,
                        startDate: moment(multiDates.startDate).startOf('quarter'),
                        endDate: moment(multiDates.endDate).endOf('quarter')
                    }
                ))
            }
            if (type === 'year') {
                setMultiDates((prev) => (
                    {
                        ...prev,
                        startDate: moment(multiDates.startDate).startOf('year'),
                        endDate: moment(multiDates.endDate).endOf('year')
                    }
                ))

            }
        }
    }, [type])
    const onCompareDateSubmit = () => {
        // let endYear;
        // if((multiDates.startMonth === moment().startOf('year').format('MM'))){
        //     endYear = multiDates.endYear
        // } else {
        //     endYear = moment(multiDates.endYear).add(1,'years').format('YYYY')
        // }
        // let endMonth = moment(multiDates.startMonth).add(11, 'months').format('MM')
        // let dates = [`${multiDates.startDate}/${multiDates.startMonth}/${multiDates.startYear}`,
        //  `${multiDates.endDate}/${endMonth}/${endYear}`]
        let dates = [moment(multiDates.startDate).format('DD/MM/YYYY'), moment(multiDates.endDate).format('DD/MM/YYYY')]
        setViewBy(type)
        setMultiYearDates(dates)
        setIsTouched(true)
    }


    const disabledStartDate = (current) => {
        return current && current > multiDates.endDate;
        // let period;
        // if(multiDates.startDate > moment().format('MM')){
        //     period = current.year() < minimumYear || current.isAfter(moment().subtract(1,'year'))
        // }else{
        //     period = current.year() < minimumYear || current > moment().endOf('year')
        // }
        // return period
    }
    const disabledEndDate = (current) => {
        return current && (current < multiDates.startDate || current > Date.now())
        // return current && current < multiDates.startDate;

        // let period;
        // if(multiDates.startMonth > moment().format('MM') ){
        //     period = current.year() < multiDates.startYear || current.isAfter(moment().subtract(1,'year'))
        // }else{
        //     period = current.year() < multiDates.startYear || current > moment().endOf('year')
        // }
        // return period
    }

    return (
        <div className="d-flex minWidth-max" >
            <div>
                <h4>Date Range</h4>
                <Select value={type} onChange={setType}>
                    <Option value="month">Month</Option>
                    <Option value="quarter">Quarter</Option>
                    {/* TODO add function to support Year in all charts */}
                    <Option value="year">Year</Option>
                </Select>
            </div>
            <div className="pl-3">
                <h4>Start Date</h4>
                <DatePicker
                    picker={type}
                    value={moment(multiDates.startDate)}
                    disabledDate={disabledStartDate}
                    onChange={(value, dateString) =>
                        handleDate(value, dateString, "startDate")
                    }
                    allowClear={false}
                />
            </div>

            <div className="pl-3">
                <h4>End Date</h4>
                <DatePicker
                    picker={type}
                    value={moment(multiDates.endDate)}
                    disabledDate={disabledEndDate}
                    onChange={(value, dateString) =>
                        handleDate(value, dateString, "endDate")
                    }
                    allowClear={false}
                />
            </div>
            <div className="pl-3 mr-2" style={{ paddingTop: "29px" }}>
                <Button
                    onClick={onCompareDateSubmit}
                    icon={<SearchOutlined />}
                    disabled={
                        multiDates.startDate && multiDates.endDate ? false : true
                    }
                >
                    Search
                </Button>
            </div>
            <>
                {/* <Row>
                <>
                <Col>
                    <h4>Start Month</h4>
                    <DatePicker
                        picker="month"
                        format={'MMM'}
                        value={moment(multiDates.startMonth)}
                        popupClassName='month-picker'
                        onChange={(value, dateString)=>handleDate(value, dateString, 'startMonth')}
                        allowClear={false}
                    />
                </Col>
                <Col className="pl-3">
                    <h4>Start Year</h4>
                    <DatePicker
                        picker="year"
                        value={moment(multiDates.startYear)}
                        disabledDate={disabledStartYear}
                        onChange={(value, dateString)=>handleDate(value, dateString, 'startYear')}
                        allowClear={false}
                    />
                </Col>
                <Col className="pl-3">
                    <h4>End Year</h4>
                    <DatePicker
                        picker="year"
                        value={moment(multiDates.endYear)}
                        disabledDate={disabledEndYear}
                        onChange={(value, dateString)=>handleDate(value, dateString, 'endYear')}
                        allowClear={false}
                    />
                </Col>
                <Col className="pl-3" style={{ paddingTop: '29px' }}>
                    <Button 
                        onClick={onCompareDateSubmit} 
                        icon={<SearchOutlined />}
                        disabled={(multiDates.startMonth && multiDates.startYear && multiDates.endYear) ? false : true}
                    > 
                        Search 
                    </Button>
                </Col>
                </>
            </Row> */}
            </>
        </div>
    );
}

export default SingleMonthMultiYear;