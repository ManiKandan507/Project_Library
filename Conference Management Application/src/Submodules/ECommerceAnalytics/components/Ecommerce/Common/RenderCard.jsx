import React, { useEffect, useState, Fragment } from "react";
import { Spin, Statistic, Divider, Tooltip } from 'antd';
import _map from 'lodash/map';
import _isEmpty from 'lodash/isEmpty';

import { cardData, filesCardData } from "../Utils";
import { DEFAULT_PRIMARY_COLOR } from "../../../constants";
import { InfoCircleFilled, InfoCircleOutlined } from "@ant-design/icons";


const RenderCard = ({ type, data, isSubContent = false, primary_color = DEFAULT_PRIMARY_COLOR }) => {
    const [constructData, setConstructData] = useState([]);

    useEffect(() => {
        if (!_isEmpty(data)) {
            if (type === 'home') {
                setConstructData(cardData(data))
            }
            else if (type === 'files') {
                setConstructData(filesCardData(data))
            }
        }
    }, [type, data]);
    return (
        <div className="d-flex justify-space-between" style={{flexWrap:"wrap"}} >
            {!_isEmpty(constructData)
                ? _map(constructData, (data, index) => {
                    return (
                        <Fragment key={index}>
                            <div className="d-flex pb-4 mr-4" style={{flexWrap:"wrap",width:"150px"}}>
                                <div style={{flexWrap:"wrap",}}>
                                    <div className="d-flex card-title">{data.title}
                                    <span className="ml-2">
                                        <Tooltip title={data.title} placement="right">
                                            <InfoCircleFilled style={{fontSize:"14px", color:"#808080"}} />
                                        </Tooltip>
                                    </span>
                                    </div>
                                    <div style={{ color: primary_color, fontSize: "18px", fontWeight: 'bold' }}>{data.value}</div>
                                </div>    
                            </div>
                            {/* {isSubContent && <div className="mt-2" style={{ fontWeight: 'bold' }}>{data.size}</div>} */}
                        </Fragment>
                    )
                })
                : null
            }
        </div>
    )
}
export default RenderCard