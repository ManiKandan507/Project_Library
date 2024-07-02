import React, { useState } from "react";
import { Button } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import moment from "moment";
const DownloadChart = ({
    chartRef,
    buttonText = "Download Image",
    fileName = {},
    className = "",
    disabled = false
}) => {
    const [img, setImg] = useState({
        src: "",
        width: 0,
        height: 0
    });
    const createChartName = () => {
        let chartName = "";
        for (const key in fileName) {
            if(key === 'name'){
                chartName += chartName?'-':''+fileName[key]
            } else if(key === 'startDate' || key === 'endDate'){
                chartName += `-${moment(fileName[key]).format("MMM-DD-YYYY")}`
            }
        }
        return chartName ? chartName.toLocaleLowerCase() : "chart"
    }
    const contextFilltext = () => {
        let contextText = "";
        for (const key in fileName) {
            if (key === 'startDate') {
                contextText += `${moment(fileName[key]).format("MMM DD, YYYY")}`
            }
            if (key === 'endDate') {
                contextText += ` - ${moment(fileName[key]).format("MMM DD, YYYY")}`
            }
        }
        return contextText
    }
    const downloadSvg = () => {
        const svg = chartRef.current.querySelector("svg");
        const { width, height } = svg.getBBox();
        const clone = svg.cloneNode(true);
        const outerHTML = clone.outerHTML;
        const blob = new Blob([outerHTML], { type: "image/svg+xml;charset=utf-8" });
        const blobURL = window.URL.createObjectURL(blob);
        const image = new Image();
        image.src = blobURL;
        image.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;
            const context = canvas.getContext("2d");
            context.drawImage(image, 0, 0, width, height);
            context.font = "14px Helvetica Neue,Helvetica, Arial,sans-serif";
            context.fillText(contextFilltext(), width - 200, 30);
            setImg({
                width,
                height,
                src: canvas.toDataURL()
            });
            const link = document.createElement("a");
            link.href = canvas.toDataURL();
            link.download = `${createChartName()}.png`
            document.body.append(link);
            link.click();
            link.remove();
        };
    };
    return (
        <>
            {!disabled && 
                <div className={`download-chart-button ml-3 ${className}`}>
                    <Button icon={<DownloadOutlined />} onClick={downloadSvg} disabled={disabled}>{buttonText}</Button>
                </div >
            }
        </>
    )
}

export default DownloadChart