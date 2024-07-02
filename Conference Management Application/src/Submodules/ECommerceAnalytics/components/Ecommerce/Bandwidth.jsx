import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { useDispatch, useSelector } from 'react-redux';

import CustomResponsiveBarCanvas from './Common/ResponsiveBarCanvas';
import {
    VIEW_BY_FILTERS,
    VIEW_BY_DAY,
    VIEW_BY_YEAR,
    VIEW_BY_QUARTER,
    VIEW_BY_MONTH,
    LEGENDS_KEYS
} from '../../constants';
import { barChartData } from './Utils';
import { fetchMonthlyBandwidthDataRequest } from '../../appRedux/actions';
import LabelOutside from './LabelOutside';
import HeaderContainer from './Common/HeaderContainer';
import CardWrapper from './Common/CardWrapper';

const Bandwidth = ({ appdir }) => {

    const dispatch = useDispatch();

    const [selectedChartView, setSelectedChartView] = useState(VIEW_BY_MONTH);
    const [chartViewOptions, setChartViewOptions] = useState([]);
    const [startDate, setStartDate] = useState(moment().subtract(30, 'days'));
    const [endDate, setEndDate] = useState(moment());

    const monthlyBandwidthData = useSelector(
        (state) => state.reporting.monthlyBandwidthData
    );

    const monthlyBandwidthLoading = useSelector(
        (state) => state.reporting.monthlyBandwidthLoading
    );

    useEffect(() => {
        let differenceInDays = endDate.diff(startDate, 'days') + 1;
        let filters = VIEW_BY_FILTERS;
        let showDay = differenceInDays <= 30;
        // let showYear = differenceInDays >= 365;
        // let showQuarter = differenceInDays >= 90;
        // if ((!showDay && selectedChartView === VIEW_BY_DAY) || (!showYear && selectedChartView === VIEW_BY_YEAR) || (!showQuarter && selectedChartView === VIEW_BY_QUARTER)) setSelectedChartView('Month')
        if ((!showDay && selectedChartView === VIEW_BY_DAY)) setSelectedChartView('Month')
        filters[VIEW_BY_DAY]['disabled'] = !(showDay);

        // filters[VIEW_BY_YEAR]['disabled'] = !(showYear);
        // filters[VIEW_BY_QUARTER]['disabled'] = !(showQuarter);
        dispatch(fetchMonthlyBandwidthDataRequest({
            appDir: appdir,
            startDate: startDate.format('DD/MM/YYYY'),
            endDate: endDate.format('DD/MM/YYYY')
        }))
        setChartViewOptions(filters)
    }, [startDate, endDate, selectedChartView])

    const handleDateChange = (dates) => {
        setStartDate(dates[0]);
        setEndDate(dates[1]);
    }

    const handleChartView = (value) => {
        setSelectedChartView(value)
    }

    return (
        <CardWrapper isNavigation={false}>
            <HeaderContainer
                screen="bandwidth"
                title="Bandwidth Usage"
                selectFieldValues={{
                    key: selectedChartView,
                    defaultValue: selectedChartView,
                    onChange: handleChartView,
                    data: chartViewOptions
                }}
                style={{ width: '100px', marginRight: '1rem' }}
                handleDateChange={handleDateChange}
            />
            <div style={{ paddingTop: '3rem' }}>
                <CustomResponsiveBarCanvas
                    data={barChartData(
                        'bandwidth',
                        monthlyBandwidthData,
                        {
                            xAxisValue: 'month',
                            yAxisValue: 'bandwidth',
                            viewChartType: selectedChartView.toLowerCase()
                        }
                    )}
                    appdir={appdir}
                    indexBy={selectedChartView.toLowerCase()}
                    axisBottom={{ legendOffset: 50 }}
                    keys={LEGENDS_KEYS.BANDWIDTH}
                    colors={{ scheme: 'pastel1' }}
                    margin={{ top: 80, right: 130, bottom: 80, left: 80 }}
                    layers={['grid', 'axes', 'bars', 'markers', 'legends', 'annotations', (props) => <LabelOutside {...props} />]}
                    axisLeft={{ legend: 'Bandwidth', legendOffset: -60 }}
                    loader={monthlyBandwidthLoading}
                    noDataLabel="No Bandwidth Used"
                />
            </div>
        </CardWrapper>
    )
}

export default Bandwidth;