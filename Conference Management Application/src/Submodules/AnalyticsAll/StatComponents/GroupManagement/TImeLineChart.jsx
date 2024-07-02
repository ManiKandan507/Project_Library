import React, { useEffect, useState } from 'react';
import { Bar } from "react-chartjs-2";
import { de } from "date-fns/locale";
import { format } from "date-fns";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    Title,
    Tooltip,
    TimeScale,
    BarElement,
} from "chart.js";
import "chartjs-adapter-date-fns";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { customColor, timeLineChartDataConstruct } from './common/helper';
import CommonSpinner from './common/CommonSpinner';
import moment from 'moment';
import { timeLineData } from './TestData';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    TimeScale,
    ChartDataLabels,
);

const TImeLineChart = (props) => {

    const [userGroupData, setUserGroupData] = useState([])
    const [dataSource, setDataSource] = useState([])
    const [constructedData, setConstructedData] = useState([])
    const [chartConfig, setChartConfig] = useState({})
    const [loading, setLoading] = useState(false)

    const { appDir, options, contact_uuid, primary_color } = props;

    useEffect(() => {
        if (Object.keys(userGroupData).length > 0) {
            setDataSource(timeLineChartDataConstruct(userGroupData))
        }
    }, [userGroupData])

    useEffect(() => {
        if (constructedData.length > 0) {
            setChartConfig(timeChartConfig(constructedData))
        }
    }, [constructedData])

    useEffect(() => {
        if (dataSource.length > 0) {
            setConstructedData(customColor(primary_color, dataSource))
        }
    }, [dataSource])

    useEffect(() => {
        getUserGroupData(appDir, options, contact_uuid)
    }, [appDir, options, contact_uuid])

    const getUserGroupData = async (appDir, options, contact_uuid) => {
        try {
            setLoading(true)
            const result = await fetch(`${appDir}?module=contact&component=groups&function=see_contact_group_history&otheruuid=${contact_uuid}`, options)
            const values = await result.json();
            if (Object.keys(values).length) {
                setLoading(false)
                setUserGroupData(values)
            }
        }
        catch (e) {
            console.log('error', e);
            setLoading(false)
        }
    }

    const timeChartConfig = (dataSource) => {

        const labels = [...new Set(dataSource.map((event) => event.sources))];
        const groupNames = [...new Set(dataSource.map((event) => event.group_name))];
        const eventColors = dataSource.map((values) => values.color)
        const labelGrouping = [];

        const sortedData = dataSource.sort(
            (a, b) => a.start_date.getTime() - b.start_date.getTime()
        );

        const datasets = sortedData.map((event, index) => {
            let start = event.start_date.getTime();
            let end = event.end_date.getTime();

            let stack = undefined;
            let firstStackEntry = false;

            if (labelGrouping[event.sources] === undefined) {
                stack = { Stack: "Stack0", LastDate: event.end_date };
                labelGrouping[event.sources] = [stack];
                firstStackEntry = true;
            } else {
                labelGrouping[event.sources].forEach((item, index) => {
                    if (
                        stack === undefined &&
                        item.LastDate.getTime() <= event.start_date.getTime()
                    ) {
                        stack = { ...item };
                        item.LastDate = event.end_date;
                    }
                });
                if (stack === undefined) {
                    const stackIndex = labelGrouping[event.sources].length;
                    stack = { Stack: "Stack" + stackIndex, LastDate: event.end_date };
                    labelGrouping[event.sources].push(stack);
                    firstStackEntry = true;
                }
            }

            let data = labels.map(() => null);

            if (!firstStackEntry) {
                start -= stack.LastDate.getTime();
                end -= stack.LastDate.getTime();
            }
            data[labels.indexOf(event.sources)] = [
                start,
                end,
                format(event.start_date, "yyyy") +
                " - " +
                format(event.end_date, "yyyy")
            ];

            return {
                label: event.group_name,
                borderRadius: 8,
                borderSkipped: false,
                maxBarThickness: 30,
                data: data,
                skipNull: true,
                backgroundColor: eventColors[groupNames.indexOf(event.group_name)],
                stack: event.sources + "_" + stack.Stack,
                order: index + 1,
                month: [moment(event.start_date).format('MMM YYYY'), moment(event.end_date).format('MMM YYYY')]
            };
        });

        const data = {
            labels,
            datasets: datasets
        };

        Tooltip.positioners.myCustomPositioner = (elements, eventPosition) => {
            return {
                x: eventPosition.x,
                y: eventPosition.y
            };
        }

        const options = {
            aspectRatio: 18 / data?.labels.length,
            scales: {
                x: {
                    min: Math.min(...dataSource.map((event) => event.start_date.getTime())),
                    max: Math.max(...dataSource.map((event) => event.end_date.getTime())),
                    ticks: {
                        autoSkip: true,
                        maxTicksLimit: 10
                    },
                    position: "top",
                    type: "time",
                    time: {
                        displayFormats: {
                            year: "yyyy"
                        },
                        unit: "year"
                    },
                    adapters: {
                        date: {
                            locale: de
                        }
                    },
                    stacked: true
                },
                y: {
                    stacked: true,
                    display: false,
                }
            },
            indexAxis: "y",
            plugins: {
                tooltip: {
                    callbacks: {
                        title: () => "",
                        afterBody: (items) => {
                            const date = data.datasets[items[0].datasetIndex]
                            return `${date.month[0]} - ${date.month[1]}`

                        },
                        label: (item) => {
                            return data.datasets[item.datasetIndex].label
                        },
                    },
                    position: 'myCustomPositioner'
                },
                legend: {
                    display: false
                },
                datalabels: {
                    color: "#36454F",
                    anchor: "start",
                    align: "right",
                    labels: {
                        padding: { top: 1 },
                        title: {
                            font: {
                                weight: "bold",
                                size: 16,

                            }
                        },
                    },
                    formatter: (context, values) => {
                        return values.dataset.label
                    },
                    display: (context) => {
                        return context.dataset.data[context.dataIndex] !== null
                            ? "auto"
                            : false;
                    },
                    clip:true
                },
            },
        };
    
        return {
            data: data,
            options: options
        }
    }
    

    return (
        <>
            <CommonSpinner loading={loading}>
                {Object.keys(chartConfig).length > 0 &&
                    <Bar options={chartConfig.options} data={chartConfig.data} />
                }
            </CommonSpinner>
        </>
    )
}

export default TImeLineChart;