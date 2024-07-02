import React, {useRef, useState, useEffect, useContext} from "react";
import { Button, Col, DatePicker, Row } from "antd";
import moment from "moment";
import { SearchOutlined } from "@ant-design/icons";
import GlobalContext from "../context/MemberContext";

const MultiYearSelect = ({minimumYear, dateFormat, configDates}) =>{

    const { multiYearDates ,setMultiYearDates } = useContext(GlobalContext)

    const [multiDates, setMultiDates] = useState({
        startDate: '',
        endDate: '',
        startMonth: '',
        endMonth: '',
        startYear: '',
        endYear: '',
    })

    useEffect(()=>{
        setMultiDates((prev)=>(
            {
                ...prev,
                startDate: moment(configDates[0]).startOf('month').format('DD'),
                endDate: moment(configDates[1], 'DD/MM/YYYY').endOf('month').format('DD'),
                startMonth: moment(configDates[0]).format('MM'),
                endMonth: moment(configDates[1],'DD/MM/YYYY').format('MM'),
                startYear: moment(configDates[0]).format('YYYY'),
                endYear: moment(configDates[1], 'DD/MM/YYYY').format('YYYY')
            }
        ))
    },[configDates])

    const handleDate = (value, dateString, type) => {
        if(type === 'startMonth'){
            setMultiDates((prev)=>(
                {
                    ...prev,
                    startDate: moment(value).startOf('month').format('DD'),
                    endDate: moment(value).subtract(1,'month').endOf('month').format('DD'),
                    startMonth: moment(value).format('MM'),
                    endMonth: moment(value).add(11, 'months').format('MM'),
                }
            ))
        }
        if(type === 'startYear'){
            setMultiDates((prev)=>(
                {
                    ...prev,
                    startYear: dateString
                }
            ))
        }
        if(type === 'endYear') {
            setMultiDates((prev) => (
                {
                    ...prev,
                    endYear: dateString
                }
            ))
        }
    }

    const onCompareDateSubmit = () => {
        let endYear;
        // if((multiDates.startYear === multiDates.endYear)){
        //     if((multiDates.endYear === moment().format('YYYY'))){
        //         endMonth = moment().format('MM')
        //         endYear = multiDates.endYear
        //     }else if(multiDates.startMonth === moment().startOf('year').format('MM')){
        //         endYear = multiDates.endYear
        //         endMonth = moment(multiDates.startMonth).add(11, 'months').format('MM')
        //     }else if((moment(multiDates.startYear).add(1, 'year').format('YYYY') === moment().format('YYYY')) && (multiDates.startMonth > moment().format('MM'))){
        //         endMonth = moment().format('MM')
        //         endYear = moment(multiDates.startYear).add(1, 'year').format('YYYY')
        //     }else{
        //         endYear = moment(multiDates.startYear).add(1, 'year').format('YYYY')
        //         endMonth = moment(multiDates.startMonth).add(11, 'months').format('MM')
        //     }
        // } else {
        //     if(multiDates.endYear === moment().format('YYYY')){
        //         endMonth = moment().format('MM')
        //         endYear = moment().format('YYYY')
        //     }else if(multiDates.startMonth === moment().startOf('year').format('MM')){
        //         endMonth = moment(multiDates.startMonth).add(11, 'months').format('MM')
        //         endYear = moment(multiDates.endYear).format('YYYY')
        //     }else{
        //         endMonth = moment(multiDates.startMonth).add(11, 'months').format('MM')
        //         endYear = moment(multiDates.endYear).add(1, 'year').format('YYYY')
        //     }
        // }
        if((multiDates.startMonth === moment().startOf('year').format('MM'))){
            endYear = multiDates.endYear
        } else {
            endYear = moment(multiDates.endYear).add(1,'years').format('YYYY')
        }

        let dates = [`${multiDates.startDate}/${multiDates.startMonth}/${multiDates.startYear}`,
         `${multiDates.endDate}/${multiDates.endMonth}/${endYear}`]
        setMultiYearDates(dates)
    }

    const disabledStartYear = (current) => {
        let period;
        if(multiDates.startMonth > moment().format('MM') ){
            period = current.year() < minimumYear || current.isAfter(moment().subtract(1,'year'))
        }else{
            period = current.year() < minimumYear || current > moment().endOf('year')
        }
        return period
    }

    const disabledEndYear = (current) => {
        let period;
        if(multiDates.startMonth > moment().format('MM') ){
            period = current.year() < multiDates.startYear || current.isAfter(moment().subtract(1,'year'))
        }else{
            period = current.year() < multiDates.startYear || current > moment().endOf('year')
        }
        return period
    }

    return(
        <div>
            <Row>
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
            </Row>
        </div>
    )
}

export default MultiYearSelect;