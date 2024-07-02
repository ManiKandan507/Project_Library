import React, { useEffect, useState } from 'react';
import { Button, Col, Modal, Row, Select, Table, Tooltip } from 'antd';
import { DeleteOutlined, FileAddOutlined, SaveOutlined } from '@ant-design/icons';
import CommonSpinner from '../../common/CommonSpinner';


const ConfigWidget = ({ demographicsConfig, configModalAfterClose, configData, setConfigData }) => {
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [loading, setLoading] = useState(false)
    const [chartTypes, setChartTypes] = useState(["pie", "bar"])
    const [constructedData, setConstructedData] = useState(demographicsConfig.charts);
    const [toggleChart, setToggleChart] = useState([])
    const [addCustomModal, setAddCustomModal] = useState(false)
    const [customFields, setCustomField] = useState([])
    const [selectedCustomField, setSelectedCustomField] = useState([])
    const [filteredCustomFields, setFilteredCustomFields] = useState([])
    const { Option } = Select;
    const [addCustomField, setAddCustomField] = useState({ customFieldType: "", chartDisplay: "" })

    useEffect(() => {
        if (demographicsConfig.charts.length) {
            const filteredChart = demographicsConfig.charts.filter((value) =>
                value.field.includes('Custom')).map((data, index) => (
                    {
                        key: index,
                        ...data
                    }))
            const chartType = demographicsConfig.charts.map((value) => value.chart_display)
            setChartTypes(pre => [...new Set([...pre, ...chartType])])
            setConstructedData(filteredChart)
        }
    }, [demographicsConfig.charts, configModalAfterClose])

    useEffect(() => {
        if (constructedData.length) {
            const isVisible = []
            constructedData.forEach((data) => {
                if (data.visible) {
                    isVisible.push(data.key)
                }
            })
            setSelectedRowKeys(isVisible)
        }
    }, [constructedData])

    useEffect(() => {
        if (addCustomModal) {
            getCustomField()
        }
    }, [addCustomModal])

    useEffect(() => {
        if (customFields.length) {
            const filteredField = customFields.filter((obj, index) => {
                return index === customFields.findIndex(o => obj.FieldContentType === o.FieldContentType)
            });
            setFilteredCustomFields(filteredField)
        }
    }, [customFields])

    useEffect(() => {
        if (customFields.length) {
            const filteredField = customFields.filter((obj, index) => {
                return index === customFields.findIndex(o => obj.FieldContentType === o.FieldContentType)
            });
            setFilteredCustomFields(filteredField)
        }
    }, [customFields])

    useEffect(() => {
        // if (!addCustomModal) {
        const updateChartConfig = configData.charts.map(configChart => {
            if (configChart.chart_type.includes("custom_field")) {
                const updateCustomField = constructedData?.find((chartValues) => configChart.field === chartValues.field)
                return updateCustomField
            }
            else {
                return configChart
            }
        }).filter(Boolean)
        setConfigData(pre => ({ ...pre, charts: updateChartConfig }))
        // }
    }, [constructedData])

    const getCustomField = async () => {
        try {
            setLoading(true)
            const response = await fetch(`https://bm6uvz69il.execute-api.us-east-1.amazonaws.com/dev/api?appdir=dfi&module=client&component=member_directory&function=get_custom_fields&conferenceid=0`)
            const result = await response.json()
            if (result.data.length) {
                setLoading(false)
                setCustomField(result.data)
            } else {
                setLoading(false)
                setCustomField([])
            }
        }
        catch (e) {
            setLoading(false)
            console.log("error", e);
        }
    }

    const handleCustomModalClose = () => { setAddCustomModal(false) }

    const handleCustomModalAdd = () => {
        const value = Object.values(addCustomField).filter(Boolean)
        if (value.length) {
            const getCustomField = filteredCustomFields.find(data => data.FieldContentType === value[0])
            const constructChart = {
                key: constructedData.length,
                field: getCustomField.FieldContentType,
                chart_type: "custom_field",
                chart_display: value[1],
                label: getCustomField.Fieldlabel,
                visible: true
            }
            setConfigData(pre => ({ ...pre, charts: [...pre.charts, constructChart] }))
            setConstructedData(pre => [...pre, constructChart])
            setAddCustomField({ customFieldType: "", chartDisplay: "" })
            setAddCustomModal(false)
        }
    }

    const handleCustomField = (customField) => { setSelectedCustomField(customField); setAddCustomField(pre => ({ ...pre, customFieldType: customField })) }

    const handleChartDisplay = (chartView) => { setAddCustomField(pre => ({ ...pre, chartDisplay: chartView })) }

    const chartTypeSelection = () => {
        const chartTypes = [
            {
                label: 'Members By Age',
                value: 'members_by_age'
            },
            {
                label: 'Members By Location',
                value: 'members_by_location'
            }
        ]

        const handleOnChange = (charts) => {
            const defaultChart = charts.map((value) => { return {} })
            setConfigData((prev) => {
                return {
                    ...prev,
                    default_charts: []
                }
            })
        }

        return (
            <Row align={'middle'} className='mb-4'>
                <Col className='config-title'>Toggle Chart Display :</Col>
                <Col flex={"auto"}>
                    <Select mode="multiple" allowClear className='w-100' placeholder="Please select" onChange={handleOnChange} defaultValue={toggleChart} >
                        {chartTypes.map((chart, index) => {
                            return <Option key={index} value={chart?.value} label={chart?.label}>{chart?.label}</Option>
                        })}
                    </Select>
                </Col>
            </Row>
        )
    }

    const defaultMapView = () => {

        const handleDefaultMapView = (map) => {
            setConfigData((prev) => ({ ...prev, default_map_view: map }))
        }

        return (
            <Row align={'middle'}>
                <Col className='config-title'>Default Map View :</Col>
                <Col flex={"auto"}>
                    <Select
                        className='w-100' placeholder="Select" optionFilterProp="children"
                        value={configData.default_map_view} onChange={handleDefaultMapView} >
                        {['World Region', 'Country'].map((value, index) => {
                            return <Option key={index} value={value} label={value} >{value}</Option>
                        })}
                    </Select>
                </Col>
            </Row>

        )
    }

    const onChartViewChange = (index, e) => {
        const changeChartView = constructedData.map((data, chartIndex) => (
            { ...data, chart_display: index === chartIndex ? e : data.chart_display }
        ))
        setConstructedData(changeChartView)
    }

    const customFieldDemographics = () => {
        const tableColumn = [
            {
                title: 'Chart Label',
                dataIndex: 'label',
                key: 'label',
            },
            {
                title: 'Chart Display',
                dataIndex: 'chart_display',
                key: 'chart_display',
                render: (_, data, index) => {
                    return (
                        <div>
                            <Select value={data.chart_display} onChange={(e) => onChartViewChange(index, e)} >
                                {chartTypes.map((chart, index) => {
                                    return <Option key={index} label={chart} value={chart} >
                                        {chart.charAt(0).toUpperCase() + chart.slice(1)}
                                    </Option>
                                })}
                            </Select>
                        </div>
                    )
                }
            },
            {
                title: 'Custom Field',
                dataIndex: 'field',
                key: 'field'
            },
            {
                title: "Actions",
                width: 0.5,
                render: (_, data) => {
                    return (
                        <div className='text-center'>
                            <Tooltip title={"Delete"} placement='top'>
                                <DeleteOutlined
                                    onClick={() => {
                                        const deleteChart = constructedData.filter((chart) => data.key !== chart.key)
                                        setConstructedData(deleteChart)
                                    }}
                                />
                            </Tooltip>
                        </div>
                    )
                }
            }
        ];

        const onSelectChange = (newSelectedRowKeys) => {
            const charts = constructedData.map((data, index) => ({ ...data, visible: newSelectedRowKeys.includes(index) }))
            setConstructedData(charts)
            setSelectedRowKeys(newSelectedRowKeys);
        };

        const rowSelection = {
            selectedRowKeys,
            onChange: onSelectChange
        };

        const handleAddCustomField = () => {
            setAddCustomModal(true)
        }
        return (
            <div className='mt-5'>
                <div className='d-flex align-center mt-2 mb-3'>
                    <div className='config-title mr-3'> Custom Field Demographics </div>
                    <div className='mr-0 ml-auto'>
                        <Button 
                            onClick={handleAddCustomField}
                        > + Add </Button>
                    </div>
                </div>
                <Table 
                    className='customchart-table w-100'
                    rowSelection={rowSelection} 
                    dataSource={constructedData} 
                    columns={tableColumn}
                    size='small' 
                    pagination={false} 
                    bordered 
                />
            </div>
        )
    }

    const onFilter = (input, option) => {
        return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0 ||
            option.key.toLowerCase().indexOf(input.toLowerCase()) >= 0
    }

    return (
        <div>
            {chartTypeSelection()}
            {defaultMapView()}
            {customFieldDemographics()}
            <Modal open={addCustomModal} title='Add Custom Demographics'
                onCancel={handleCustomModalClose}
                footer={
                    <div>
                        <Button onClick={handleCustomModalClose}>
                            Cancel
                        </Button>
                        <Button type='primary' onClick={handleCustomModalAdd} icon={<FileAddOutlined />}>
                            Add
                        </Button>
                    </div>
                }
            >
                <CommonSpinner loading={loading}>
                    <Row align={'middle'} className='mb-5'>
                        <Col className='config-title' style={{ minWidth: "7rem" }}> Custom Field :</Col>
                        <Col flex={"auto"}>
                            <Select showSearch className='w-100' onChange={handleCustomField}
                                value={addCustomField.customFieldType} filterOption={onFilter}>
                                {filteredCustomFields.map((field) => {
                                    return <Option key={field.Fieldlabel} value={field.FieldContentType} label={field.FieldContentType}>
                                        <div>{field.Fieldlabel}</div>
                                    </Option>
                                })}
                            </Select>
                        </Col>
                    </Row>
                    <Row align={'middle'}>
                        <Col className='config-title' style={{ minWidth: "7rem" }}>Chart Display :</Col>
                        <Col flex={"auto"}>
                            <Select className='w-100'
                                value={addCustomField.chartDisplay}
                                onChange={handleChartDisplay}
                            >
                                {['Bar', 'Pie'].map((types, index) => {
                                    return <Option key={index} label={types} value={types.toLocaleLowerCase()}>{types}</Option>
                                })}
                            </Select>
                        </Col>
                    </Row>

                    <>
                        {/* <div className='d-flex align-center mb-5'>
                        <div className='config-title mr-3'> Custom Field :</div>
                        <Select showSearch className='w-100' onChange={handleCustomField}
                            value={selectedCustomField} filterOption={onFilter}>
                            {filteredCustomFields.map((field) => {
                                return <Option key={field.Fieldlabel} value={field.FieldContentType} label={field.FieldContentType}>
                                    <div>{field.Fieldlabel}</div>
                                </Option>
                            })}
                        </Select>
        </div>
<div className='d-flex align-center'>
                        <div className='config-title mr-3'>Chart Display :</div>
                        <Select className='w-100'
                        // onChange={handleAddChart} 
                        >
                            {['Bar', 'Pie'].map((types, index) => {
                                return <Option key={index} label={types} value={types}>{types}</Option>
                            })}
                        </Select>
                    </div> */}
                    </>

                </CommonSpinner>
            </Modal>
        </div >
    )
}

export default ConfigWidget