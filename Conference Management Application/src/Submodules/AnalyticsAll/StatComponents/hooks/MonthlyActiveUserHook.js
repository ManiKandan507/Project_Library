import { useState, useEffect } from 'react'

export const useMonthlyActiveUser = (appdir,dates,period="month") => {
    const [activeUser, setActiveUser] = useState([])
    const [ChartLoading, setChartLoading] = useState(false)

    const baseApi = "https://bm6uvz69il.execute-api.us-east-1.amazonaws.com/dev/api";
    const getMonthlyActiveUserData = async () => {
    try {
        setChartLoading(true)
        let fetchMonthlyUser = await fetch(`${baseApi}?module=ecommerce&component=reports&function=monthly_active_users&appdir=${appdir}&start_date=${dates[0]}&end_date=${dates[1]}&period=${period ? period.toLowerCase() : period}`)
        const resultJson = await fetchMonthlyUser.json();
        if (resultJson?.success) {
        setChartLoading(false)
            setActiveUser(resultJson?.data);
        } else {
            setChartLoading(false)
            setActiveUser({});
        }
    } catch (err) {
            setChartLoading(false)
            console.log("error",err);
        }
    }
    useEffect(() => {
        getMonthlyActiveUserData()
    }, [dates])

    return {activeUser,ChartLoading}
}

