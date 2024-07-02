import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import CustomResponsiveBarCanvas from "../Common/ResponsiveBarCanvas";
import _map from 'lodash/map';
import _slice from 'lodash/slice'

import { barChartData } from "../Utils";
import { get30PriorDate, getCurrentDate } from "../Common/Utils";
import { fetchMonthlyActiveUsersRequest, fetchActiveUsersDataRequest, showModal } from "../../../appRedux/actions";
import LabelOutside from "../LabelOutside";
import { PAGE_SIZE, CURRENT_PAGE, LEGENDS_KEYS } from "../../../constants";
import HeaderContainer from "../Common/HeaderContainer";
import CardWrapper from "../Common/CardWrapper";
import { formatDate } from "../Common/Utils";

const ActiveUserByMonth = ({ appdir }) => {
    const dispatch = useDispatch();

    const [dates, setDates] = useState([get30PriorDate(), getCurrentDate()]);
    const [userBarChartData, setUserBarChartData] = useState({});
    const [dataSource, setDataSource] = useState([]);
    const [totalUuid, setTotalUuid] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);

    const monthlyActiveUserLoading = useSelector(
        (state) => state.reporting.monthlyActiveUserLoading
    );

    const monthlyActiveUserData = useSelector(
        (state) => state.reporting.monthlyActiveUserData
    );

    const activeUsersData = useSelector(
        (state) => state.reporting.activeUsersData
    );

    const activeUserLoading = useSelector(
        (state) => state.reporting.activeUserLoading
    );

    useEffect(() => {
        dispatch(fetchMonthlyActiveUsersRequest({
            appDir: appdir,
            startDate: dates[0],
            endDate: dates[1]
        }))
    }, [dates]);

    useEffect(() => {
        if (activeUsersData) {
            setDataSource(constructByMonthData(activeUsersData));
        }
    }, [activeUsersData]);

    const handleDateChange = (value, dateStrings) => {
        setDates([
            dateStrings?.[0] ? formatDate(dateStrings?.[0]) : "",
            dateStrings?.[1] ? formatDate(dateStrings?.[1]) : ""
        ]);
    }

    const handleBarChart = (chartData) => {
        let constructedUidData = [];
        if (chartData?.data && chartData?.data?.contactUUIDs.length) {
            setTotalUuid(chartData?.data?.contactUUIDs);
            constructedUidData = _slice(chartData?.data?.contactUUIDs, CURRENT_PAGE, PAGE_SIZE)
        }
        setUserBarChartData(chartData);
        dispatch(showModal(true));
        dispatch(fetchActiveUsersDataRequest({
            appDir: appdir,
            startDate: dates[0],
            endDate: dates[1],
            constructedUids: constructedUidData,
        }));
    }

    const handlePagination = (val) => {
        setCurrentPage(val);
        const startIdx = ((val - 1) * PAGE_SIZE);
        const remaining = (totalUuid.length - ((val - 1) * PAGE_SIZE));
        const limit = totalUuid.length > (startIdx + PAGE_SIZE) ? (startIdx + PAGE_SIZE) : (startIdx + remaining);
        dispatch(fetchActiveUsersDataRequest({
            appDir: appdir,
            startDate: dates[0],
            endDate: dates[1],
            constructedUids: _slice(totalUuid, ((val - 1) * PAGE_SIZE), limit)
        }));
    }

    const constructByMonthData = (userData) => {
        let constructData = [];
        if (userData && userData.length) {
            constructData = _map(userData, (data, index) => {
                const {
                    Picture,
                    Firstname,
                    Lastname,
                    Company,
                    product_views,
                    Email,
                    ReviewIDThisCustID
                } = data;
                return ({
                    key: index,
                    Picture,
                    Firstname,
                    Lastname,
                    Company,
                    product_views,
                    Email,
                    ReviewIDThisCustID,
                });
            });
        }
        return constructData;
    }

    const handleonCloseModal = () => {
        setCurrentPage(1)
    }
    return (
        <CardWrapper isNavigation={false}>
            <HeaderContainer
                screen="by_month"
                handleDateChange={handleDateChange}
            />
            <div>
                <CustomResponsiveBarCanvas
                    data={barChartData(
                        'active_user',
                        monthlyActiveUserData,
                        { xAxisValue: 'month', yAxisValue: 'user' }
                    )}
                    appdir={appdir}
                    indexBy="month"
                    axisBottom={{ legendOffset: 50 }}
                    axisLeft={{ legend: 'Active Users' }}
                    keys={LEGENDS_KEYS.BY_MONTH}
                    colors={{ scheme: 'accent' }}
                    margin={{ top: 80, right: 130, bottom: 80, left: 80 }}
                    layers={['grid', 'axes', 'bars', 'markers', 'legends', 'annotations', (props) => <LabelOutside {...props} />]}
                    handleClick={handleBarChart}
                    loader={monthlyActiveUserLoading}
                    modelTitle="Active Users"
                    barChartData={userBarChartData}
                    tableColumnKey="By_Month"
                    tableData={dataSource}
                    tableLoading={activeUserLoading}
                    paginationTotalCount={totalUuid.length}
                    handlePagination={handlePagination}
                    page={currentPage}
                    handleonCloseModal={handleonCloseModal}
                />
            </div>
        </CardWrapper>
    )
}

export default ActiveUserByMonth;