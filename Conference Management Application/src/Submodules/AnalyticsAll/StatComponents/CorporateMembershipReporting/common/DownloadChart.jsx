import React, { useState } from "react";
import { Button } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import moment from "moment";
import * as htmlToImage from 'html-to-image';

const DownloadChart = ({
    buttonText = "Download Image",
    fileName = {},
    className = "",
    disabled = false,
    chartRef
}) => {
    const [img, setImg] = useState({
        src: "",
        width: 0,
        height: 0
    });
    const createChartName = () => {
        let chartName = "";
        for (const key in fileName) {
            if (key === 'name') {
                chartName += chartName ? '-' : '' + fileName[key]
            } else if (key === 'startDate' || key === 'endDate') {
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

    const downloadImage = async() => {

        const chartLegends = [...document.querySelectorAll('.chartLegends')];
        if(chartLegends?.length){
            chartLegends.map(chart => {
                chart.classList.remove("chartLegends");
                chart.classList.add("downloadChartLegends");
            })
        }

        const dataUrl = await htmlToImage.toPng(chartRef.current);
        let image = new Image();
        image.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = image.width;
            canvas.height = image.height;
            const context = canvas.getContext("2d");
            context.drawImage(image, 0, 0, image.width, image.height);
            context.font = "18px Helvetica Neue,Helvetica, Arial,sans-serif";
            context.fillText(contextFilltext(),image.width - (image.height > 700 ? image.width - 120 : image.width - 60), 20);
            setImg({
                width:500,
                height:500,
                src: canvas.toDataURL()
            });
            const link = document.createElement("a");
            link.href = canvas.toDataURL();
            link.download = `${createChartName()}.png`
            document.body.append(link);
            link.click();
            link.remove();
        }

        image.src = dataUrl

        const downloadChartLegends = [...document.querySelectorAll('.downloadChartLegends')];

        if(downloadChartLegends?.length){
            downloadChartLegends.map(chart => {
                chart.classList.remove("downloadChartLegends");
                chart.classList.add("chartLegends");
            })
        }
    }

    return (
        <>
            {!disabled &&
                <div className={`download-chart-button ${className}`}>
                    <Button icon={<DownloadOutlined />} onClick={downloadImage} disabled={disabled}>{buttonText}</Button>
                </div >
            }
        </>
    )
}

export default DownloadChart