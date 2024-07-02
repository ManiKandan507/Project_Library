import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Statistic, Badge, Spin, Button, Result } from "antd";
import CustomResponsiveBarCanvas from "../Common/ResponsiveBarCanvas";
import _slice from 'lodash/slice'
import _map from 'lodash/map'
import _uniq from 'lodash/uniq';
import _filter from 'lodash/filter';

import { barChartData } from "../Utils";
import { get15PriorDate, getCurrentDate, getRoundValue } from "../Common/Utils";
import {
    showModal,
    fetchProductDataRequest,
    fetchUserCustomerIdRequest,
    fetchUserContactDetailsRequest
} from "../../../appRedux/actions";
import LabelOutside from "../LabelOutside";
import { PAGE_SIZE, CURRENT_PAGE, LEGENDS_KEYS } from "../../../constants";
import HeaderContainer from "../Common/HeaderContainer";
import CardWrapper from "../Common/CardWrapper";
import { formatDate } from "../Common/Utils";

const ActiveUserByUsers = ({ appdir, sourceHex }) => {
    const dispatch = useDispatch();
    const [dates, setDates] = useState([get15PriorDate(), getCurrentDate()]);
    const [customerUuid, setCustomerUuid] = useState('');
    const [userBarChartData, setUserBarChartData] = useState({});
    const [dataSource, setDataSource] = useState([]);
    const [modalTitle, setModalTitle] = useState('');
    const [productDetails, setProductDetails] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [constructUids, setConstructUids] = useState([]);


    const productViewData = useSelector(
        (state) => state.reporting.productViewData
    );

    const userCustomerLoading = useSelector(
        (state) => state.reporting.userCustomerLoading
    );

    const isUserDetailsSuccess = useSelector(
        (state) => state.reporting.isUserDetailsSuccess
    );

    const activeUserLoading = useSelector(
        (state) => state.reporting.activeUserLoading
    );

    const activeCustomerData = useSelector(
        (state) => {
            const { users } = state.reporting?.activeCustomerData
            return users;
        }
    );

    const userContactDetails = useSelector(
        (state) => state.reporting?.userContactDetails
    );

    const loading = useSelector(
        (state) => state.reporting.productViewChartLoading
    );

    const fetchUserUuidFailed = useSelector(
        (state) => state.reporting.fetchUserUuidFailed
    );

    const fetchUserDataFailed = useSelector(
        (state) => state.reporting.fetchUserDataFailed
    );

    const fetchProductDataFailed = useSelector(
        (state) => state.reporting.fetchProductDataFailed
    );

    useEffect(() => {
        dispatch(fetchUserCustomerIdRequest({
            appDir: appdir,
            startDate: dates[0],
            endDate: dates[1],
        }))
    }, [dates]);

    useEffect(() => {
        if (isUserDetailsSuccess && activeCustomerData && activeCustomerData.length) {
            let constructedUids = _uniq(_map(activeCustomerData, (data) => data.contact_uuid));

            dispatch(fetchUserContactDetailsRequest({
                sourceHex,
                constructedUids
            }));
            setConstructUids(constructedUids);
        }
    }, [isUserDetailsSuccess, activeCustomerData]);

    useEffect(() => {
        if (customerUuid) {
            dispatch(fetchProductDataRequest({
                appDir: appdir,
                startDate: dates[0],
                endDate: dates[1],
                customer_uuid: customerUuid
            }));
        }
    }, [dates, customerUuid]);

    useEffect(() => {
        if (productViewData && productViewData?.product_details) {
            setDataSource(constructByUserData(productViewData?.product_details[0], CURRENT_PAGE, PAGE_SIZE));
            setProductDetails(productViewData?.product_details[0]?.product_details)
        }
    }, [productViewData]);

    const handleDateChange = (value, dateStrings) => {
        setDates([
            dateStrings?.[0] ? formatDate(dateStrings?.[0]) : "",
            dateStrings?.[1] ? formatDate(dateStrings?.[1]) : ""
        ]);
    }

    const constructByUserData = (userData, startPageIndex, endPageIndex) => {
        let constructedData = []
        if (userData) {
            let filteredData = _slice(userData?.product_details, startPageIndex, endPageIndex);
            constructedData = _map(filteredData, (data, index) => {
                return ({
                    key: index,
                    product_label: data?.product_label,
                    product_id: data?.product_id
                });
            })
            return constructedData;
        }
        return constructedData;
    }

    const handleUserData = (selectedUser) => {
        setModalTitle(selectedUser);
        let filterUserData = _filter(userContactDetails, (data) => `${data.Firstname} ${data.Lastname}` === selectedUser)[0];
        setCustomerUuid(filterUserData.UUID);
    }

    const handleBarChart = (data) => {
        setUserBarChartData(data)
        dispatch(showModal(true));
    }

    const handlePagination = (val) => {
        setCurrentPage(val)
        const indexOfLastData = val * PAGE_SIZE;
        const indexOfFirstData = indexOfLastData - PAGE_SIZE;
        if (productViewData && productViewData?.product_details) {
            setDataSource(constructByUserData(productViewData?.product_details[0], indexOfFirstData, indexOfLastData));
        }
    }

    const handleonCloseModal = () => {
        setCurrentPage(1)
    }

    const handleTryAgain = () => {
        if (fetchUserUuidFailed) {
            dispatch(fetchUserCustomerIdRequest({
                appDir: appdir,
                startDate: dates[0],
                endDate: dates[1],
            }));
        } else if (fetchUserDataFailed) {
            dispatch(fetchUserContactDetailsRequest({
                sourceHex,
                constructedUids: constructUids
            }));
        } else if (fetchProductDataFailed) {
            dispatch(fetchProductDataRequest({
                appDir: appdir,
                startDate: dates[0],
                endDate: dates[1],
                customer_uuid: customerUuid
            }));
        }
    }

    return (
        <>
            <Spin spinning={userCustomerLoading} size="large">
                <CardWrapper isNavigation={false}>
                    <HeaderContainer
                        screen="by_user"
                        userSelectField={{
                            key: '',
                            onChange: handleUserData,
                            data: userContactDetails
                        }}
                        style={{ width: '85%' }}
                        handleDateChange={handleDateChange}
                    />
                    <div style={{ marginTop: '3rem' }}>
                        {loading
                            ? <Spin size="large" />
                            : (!fetchUserUuidFailed && !fetchUserDataFailed && !fetchProductDataFailed)
                                ? (<div className="d-flex flex-row">
                                    <Badge status="error" />
                                    <Statistic
                                        title="Bandwidth Consumed"
                                        value={productViewData?.bandwidth_consumed
                                            ? `${getRoundValue(productViewData?.bandwidth_consumed, 2)} GB`
                                            : '0 GB'
                                        }
                                        valueStyle={{ fontSize: 20, fontWeight: 'bold' }}
                                    />
                                </div>) : null
                        }
                        <div>
                            {fetchUserUuidFailed || fetchUserDataFailed || fetchProductDataFailed
                                ? <div className="d-flex justify-center align-center h-500">
                                    <Result
                                        status="warning"
                                        title="Sorry, something went wrong."
                                        extra={
                                            <Button type="primary" onClick={handleTryAgain}>
                                                Try Again
                                            </Button>
                                        }
                                    />
                                </div>
                                : <CustomResponsiveBarCanvas
                                    data={barChartData(
                                        'active_month_user',
                                        productViewData?.product_details,
                                        { xAxisValue: 'month', yAxisValue: 'product views' }
                                    )}
                                    appdir={appdir}
                                    indexBy="month"
                                    axisBottom={{ legendOffset: 50 }}
                                    axisLeft={{ legend: 'Product Views' }}
                                    keys={LEGENDS_KEYS.BY_USERS}
                                    colors={{ scheme: 'category10' }}
                                    margin={{ top: 80, right: 130, bottom: 80, left: 80 }}
                                    layers={['grid', 'axes', 'bars', 'markers', 'legends', 'annotations', (props) => <LabelOutside {...props} />]}
                                    handleClick={handleBarChart}
                                    loader={loading}
                                    modelTitle={`${modalTitle}'s Product Views`}
                                    barChartData={userBarChartData}
                                    tableColumnKey="By_User"
                                    tableData={dataSource}
                                    tableLoading={activeUserLoading}
                                    paginationTotalCount={productDetails.length}
                                    handlePagination={handlePagination}
                                    page={currentPage}
                                    handleonCloseModal={handleonCloseModal}
                                />
                            }
                        </div>
                    </div>
                </CardWrapper>
            </Spin>
        </>
    )
}

export default ActiveUserByUsers;