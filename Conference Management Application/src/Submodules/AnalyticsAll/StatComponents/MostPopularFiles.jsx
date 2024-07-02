import React, { useState, useEffect } from 'react'
import { Button, Tooltip, Tag } from 'antd'
import { ReactComponent as Information } from '@/AnalyticsAll/NativeDashboards/ProductsAnalytics/assets/icons/Information.svg';
import { useMostPopularFiles } from '@/AnalyticsAll/StatComponents/hooks/MostPopularFilesHook'
import CommonTable from '@/AnalyticsAll/StatComponents/common/CommonTable'
import { sortColumnData, sortNumbers } from '@/AnalyticsAll/StatComponents/utils'
import { DoubleRightOutlined } from '@ant-design/icons';

export const MostPopularFiles = (props) => {

    const { params: { appdir }, dates } = props
    const [dataSource, setDataSource] = useState([])
    let { mostPopularFiles, loading } = useMostPopularFiles(appdir, dates)

    useEffect(() => {
        if (mostPopularFiles?.length > 0) {
            let popularFileData = mostPopularFiles.map(data => {
                return { ...data, parent: data?.product_hierarchy?.parent.sort((rec1, rec2) => rec1.immediate_parent - rec2.immediate_parent) }
            })
            setDataSource(popularFileData);
        }
    }, [mostPopularFiles])

    const fileColumns = [
        {
            title: 'Product Name',
            dataIndex: 'product_name',
            key: 'product_name',
            className: 'text-left',
            width: '75%',
            ellipsis: true,
            render: (_, data) => {
                return (
                    <>
             
                    <Tag color={data.file_type=="Video"?"purple":data.file_type=="PDF"?"gold":data.file_type=="File"?"geekblue":data.file_type=="Image"?"cyan":"none"}>{data.file_type}</Tag>

                        <Tooltip placement="topLeft" title={data.product_name}>
                            <div style={{ fontSize: "16px" }} className='elipsis'>{data.product_name}</div>
                        </Tooltip>
                        <div className="d-flex">
                            {data?.product_hierarchy?.parent.length ? data?.product_hierarchy?.parent.map((item, i) => {
                                return (
                                    <div key={i} className="d-flex">
                                        {(item?.immediate_parent === 0 || item?.immediate_parent === 1) &&
                                            <div className="d-flex" style={{ flexWrap: "wrap" }}>
                                                {item?.immediate_parent === 0 ? <div className="ml-0 elipsis" style={{ width: "282px" }}><DoubleRightOutlined /> {`${item?.ProductLabel}`}</div> : <div style={{ width: "220px" }} className="ml-2 elipsis"><DoubleRightOutlined /> {item?.ProductLabel}</div>}
                                            </div>}
                                    </div>)
                            }) : null}
                        </div>

                    </>
                )
            },
        },

        {
            title: 'Views',
            dataIndex: 'views',
            key: 'views',
            className: 'text-right',
            width: '25%',
            render: (_, rec) => {
                return <div>{rec?.views}</div>
            },
        },
    ];

    return (
        <div className='mt-16'>
            <div className='d-flex'>
                <div className='mr-2 pb-3 card-title' >{"MOST POPULAR FILES"}</div>
                <Tooltip title={"Most Popular Files"} placement="right">
                    <Information className='mb-5' style={{ width: "1.3rem" }} />
                </Tooltip>
            </div>
            <div>
                <CommonTable
                    columns={fileColumns}
                    dataSource={dataSource}
                    pagination={false}
                    loading={loading}
                    className='tableHeader table-bg-color'
                    scroll={{ y: 265 }}
                />
            </div>
            <div className='d-flex mt-1'>
                <Button className='exploreBtn' onClick={() => props.handleExplore('file')}><span style={{ textDecoration: 'underline' }}>Explore More</span></Button>
            </div>
        </div>
    )
}
