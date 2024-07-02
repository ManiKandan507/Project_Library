import React, { useState, useEffect, useContext } from "react";
import { Badge, Button, Checkbox, Col, Divider, Input, Modal, Row, Tag, Tooltip } from "antd";
import { CaretDownOutlined, CaretUpOutlined, ReloadOutlined, SaveFilled, SearchOutlined } from "@ant-design/icons";
import _sortBy from "lodash/sortBy";
import _map from 'lodash/map';
import _groupBy from 'lodash/groupBy';
import { convertLowercaseFormat } from "../../util";
import GlobalContext from "../context/DonationContext";
import CommonSearchBox from "./CommonSearchBox";

const MultiSelectWidget = ({ CategoryTypes }) => {

    const {
        donationCategory,
        donationTypes,
        setSelectedDonationTypes,
        filteredCategory,
        setFilteredCategory,
        donationCategoryData,
        setDonationCategoryData,
        selectedDonation,
        setSelectedDonation,
        orderCategory,
        setOrderCategory,
        showMore,
        setShowMore,
        showCategoryFilter,
        setShowCategoryFilter

    } = useContext(GlobalContext)


    const [onChangeDonationCategory, setOnChangeDonationCategory] = useState(donationTypes)
    const [constructedDonation, setConstructedDonation] = useState([])
    const [selectedValue, setSelectedValue] = useState([])
    const [searchValue, setSearchValue] = useState('')


    useEffect(() => {
        if (donationTypes?.length > 0) {
            setOnChangeDonationCategory(donationTypes)
        }
    }, [donationTypes])

    const handleOnClick = () => {
        setSelectedDonationTypes(onChangeDonationCategory)
        setOrderCategory(filteredCategory)
        setShowCategoryFilter(false)
        setSearchValue('')
    }

    const constructedData = () => {
        const resultedData = donationCategory?.map((value, index) => {
            let orderBy = selectedDonation.includes(value.donation_name) ? 1 : 0;
            return {
                ...value,
                orderBy
            }
        })
        const finalResult = _map(_groupBy(resultedData, 'orderBy'))
        const sortedData = finalResult?.length === 1 ? finalResult[0] : [...finalResult[1], ...finalResult[0]];
        return sortedData
    }

    useEffect(() => {
        setConstructedDonation(constructedData())
    }, [donationCategory, selectedDonation])

    useEffect(() => {
        if (constructedDonation.length) {
            setDonationCategoryData(constructedDonation)
        }
    }, [constructedDonation])

    const handleCancel = () => {
        setShowCategoryFilter(false)
        setFilteredCategory([])
        setSelectedDonation([])
        setSelectedValue([])
        setSelectedDonationTypes(donationTypes)
    }

    const handleFilter = () => {
        setShowCategoryFilter(true)
    }

    const handleReset = () => {
        setFilteredCategory([])
        setSelectedDonation([])
        setSelectedValue([])
        if (CategoryTypes?.length) {
            const donationOptions = CategoryTypes.map((value) => {
                return value.donation_name
            })
            setOnChangeDonationCategory(donationOptions)
        }
    }

    const clearFilter = () => {
        setFilteredCategory([])
        setOrderCategory([])
        setSelectedDonation([])
        setSelectedValue([])
        if (CategoryTypes?.length) {
            const donationOptions = CategoryTypes.map((value) => {
                return value.donation_name
            })
            setSelectedDonationTypes(donationOptions)
        }
    }

    const handleUnCheck = (e) => {
        if (selectedValue.includes(e.target.value)) {
            const checkedValues = selectedValue.filter((data) => data !== e.target.value)
            setSelectedValue(checkedValues)
        } else {
            setSelectedValue((prev) => {
                return [...prev, e.target.value]
            })
        }
    }

    useEffect(() => {
        if (selectedValue.length) {
            setSelectedDonation(selectedValue)
        } else {
            setSelectedDonation([])
        }
    }, [selectedValue])

    useEffect(() => {
        if (selectedDonation.length) {
            setOnChangeDonationCategory(selectedDonation)
            setFilteredCategory(selectedDonation)
        } else {
            setOnChangeDonationCategory([])
            setFilteredCategory([])
            if (CategoryTypes?.length) {
                const donationOptions = CategoryTypes.map((value) => {
                    return value.donation_name
                })
                setOnChangeDonationCategory(donationOptions)
            }
        }
    }, [selectedDonation, CategoryTypes])

    const onCategorySearch = searchValue => {
        searchValue = searchValue.target.value;
        let searchResult = []
        if (searchValue) {
            searchResult = constructedDonation?.filter((donation) => { return convertLowercaseFormat(`${donation.donation_name}`).includes(convertLowercaseFormat(searchValue)) })
        } else {
            searchResult = constructedDonation
        }
        setDonationCategoryData(searchResult)
        setSearchValue(searchValue)
    }

    const handleShowMore = () => {
        setShowMore(true)
    }

    const handleShowLess = () => {
        setShowMore(false)
    }

    const showMoreVisible = () => {
        const innerWidth = window.innerWidth;
        if (innerWidth > 2300) {
            return 78.00
        } else if (innerWidth > 1440) {
            return 74.25
        } else if (innerWidth > 1024) {
            return 55.80
        } else {
            return 30.20
        }
    }

    const content = document.getElementById('content-holder')?.offsetWidth;
    const tagWidth = document.getElementById('tagWidth')?.offsetWidth;
    const showButtonVisible = ((tagWidth / content) * 100).toFixed(2);

    return (
        <>
            <div id="content-holder" className="d-flex vertical-divider" >
                <div id="filter-area" className="filter-button" >
                    <Row style={{ gap: '12px' }} className="mb-1">
                        <Col>
                            <Badge count={orderCategory?.length}>
                                <Button
                                    onClick={handleFilter}
                                    shape="round"
                                    type="primary"
                                >
                                    Filter by Donation Type
                                </Button>
                            </Badge>
                        </Col>
                        {!orderCategory.length ? "" : <Col>
                            <Button
                                onClick={clearFilter}
                                shape="round"
                            >
                                Clear Filter
                            </Button>
                        </Col>}
                        {!orderCategory.length ? '' : <Col>
                            <Divider style={{ marginLeft: '5px' }} type="vertical" />
                        </Col>}
                    </Row>
                </div>
                <div id='tagWidth' className={showMore ? 'show-more-tags' : 'filter-tag'}>
                    {orderCategory.map((value) => {
                        return <>
                            <Tooltip title={value} >
                                <Tag className="filter-category-name" >{value}</Tag>
                            </Tooltip>
                        </>
                    })}
                </div>
                <div id='show-more'>
                    {(orderCategory.length && showButtonVisible > showMoreVisible()) ? !showMore ? <div className="show-more-button">
                        <Button icon={<CaretDownOutlined />} onClick={handleShowMore} shape="round" >
                            Show More
                        </Button>
                    </div> : <div>
                        <Button icon={<CaretUpOutlined />} onClick={handleShowLess} shape="round" >
                            Show Less
                        </Button>
                    </div> : ''}
                </div>
            </div>

            <Modal
                open={showCategoryFilter}
                onCancel={handleCancel}
                width="40%"
                title="Filter by Donation Type"
                className="checkbox-filter filter-modal"
                bodyStyle={{ height: 'calc(100vh - 300px)' }}
                maskClosable={false}
                footer={[
                    <Button icon={<ReloadOutlined />} onClick={handleReset} >
                        Reset
                    </Button>,
                    <Button type="primary" icon={<SaveFilled />} onClick={handleOnClick}>
                        Apply
                    </Button>
                ]}
            >
                <div className="search-input">
                    <CommonSearchBox
                        prefix={<SearchOutlined />}
                        placeholder="Search Donation Types"
                        allowClear
                        value={searchValue}
                        onChange={onCategorySearch}
                    />
                </div>
                <div className="checkbox-padding scroll-container">
                    {donationCategoryData?.map((data, index) => {
                        return (
                            <div key={index} >
                                <Divider />
                                <Checkbox checked={selectedDonation.includes(data.donation_name) ? true : false} value={data.donation_name} onClick={(e) => handleUnCheck(e)} > {data?.donation_name} </Checkbox>
                            </div>
                        )
                    })}
                </div>
            </Modal>
        </>
    )
}
export default MultiSelectWidget;