import React, { useContext, useState, useEffect } from "react";
import { SearchOutlined } from "@ant-design/icons";
import { Col, DatePicker, Row, Button } from "antd";
import GlobalContext from "../../context/MemberContext";
import moment from "moment/moment";

const MultiYearRangePicker = ({ configDates, minimumYear }) => {

    const { multiYear, setMultiYear, setSelectedDates } = useContext(GlobalContext)

    const [multiYearDates, setMultiYearDates] = useState({
        startDate: '',
        startMonth: '',
        startYear: '',
        endDate: '',
        endMonth: '',
        endYear: ''
    })

    useEffect(() => {
        setMultiYearDates((prev) => (
            {
                ...prev,
                startDate: moment(configDates[0]).startOf('month').format('DD'),
                endDate: moment(configDates[1], 'DD/MM/YYYY').endOf('month').format('DD'),
                startMonth: moment(configDates[0]).format('MM'),
                endMonth: moment(configDates[1], 'DD/MM/YYYY').format('MM'),
                startYear: moment(configDates[0]).format('YYYY'),
                endYear: moment(configDates[1], 'DD/MM/YYYY').format('YYYY')
            }
        ))
        setMultiYear(configDates)
        // setSelectedDates([configDates[0],configDates[1]])
    }, [configDates])

    const handleDate = (value, dateString, type) => {
        if (type === 'startYear') {
            setMultiYearDates((prev) => (
                {
                    ...prev,
                    startDate: moment(value).startOf('month').format('DD'),
                    endDate: moment(value).endOf('month').format('DD'),
                    startMonth: moment(value).startOf('year').format('MM'),
                    endMonth: moment(value).add(11, 'months').format('MM'),
                    startYear: dateString
                }
            ))
        }
        if (type === 'endYear') {
            setMultiYearDates((prev) => (
                {
                    ...prev,
                    endYear: dateString
                }
            ))
        }
    }
    const onCompareDateSubmit = () => {
        let endYear;
        if (multiYearDates.startYear === multiYearDates.endYear) {
            endYear = moment(multiYearDates.startYear).add(1, 'year').format('YYYY')
        } else {
            endYear = multiYearDates.endYear
        }
        let endMonth = moment(multiYearDates.startMonth).add(11, 'months').format('MM')
        let dates = [`${multiYearDates.startDate}/${multiYearDates.startMonth}/${multiYearDates.startYear}`,
        `${multiYearDates.endDate}/${endMonth}/${endYear}`]
        setMultiYear(dates)
    }

    const disabledStartYear = (current) => {
        let period = current.year() < minimumYear || current > moment().endOf('year')
        return period
    }

    const disabledEndYear = (current) => {
        let period = current.year() < multiYearDates.startYear || current > moment().endOf('year')
        return period
    }

    return (
        <Row>
            <>
                <Col>
                    <h4>Start Year</h4>
                    <DatePicker
                        picker="year"
                        value={moment(multiYearDates.startYear)}
                        disabledDate={disabledStartYear}
                        onChange={(value, dateString) => handleDate(value, dateString, 'startYear')}
                        allowClear={false}
                    />
                </Col>
                <Col className="pl-3">
                    <h4>End Year</h4>
                    <DatePicker
                        picker="year"
                        value={moment(multiYearDates.endYear)}
                        disabledDate={disabledEndYear}
                        onChange={(value, dateString) => handleDate(value, dateString, 'endYear')}
                        allowClear={false}
                    />
                </Col>
                <Col className="pl-3" style={{ paddingTop: '29px' }}>
                    <Button
                        onClick={onCompareDateSubmit}
                        icon={<SearchOutlined />}
                    // disabled={(multiDates.startMonth && multiDates.startYear && multiDates.endYear) ? false : true}
                    >
                        Search
                    </Button>
                </Col>
            </>
        </Row>
    )
}
export default MultiYearRangePicker;