import { useState, useEffect } from 'react'
const baseApi = "https://bm6uvz69il.execute-api.us-east-1.amazonaws.com/dev/api";

export const useBandwithChart = (appdir,dates) => {
    const [bandWidthUsageData, setbandWidthUsageData] = useState([])
    const [loading, setLoading] = useState(false)

    const getMonthlyActiveUserData = async () => {
    try {
        setLoading(true)
        let fetchMonthlyUser = await fetch(`${baseApi}?module=ecommerce&component=reports&function=monthly_bandwidth&appdir=${appdir}&start_date=${dates[0]}&end_date=${dates[1]}`)
        const resultJson = await fetchMonthlyUser.json();
        if (resultJson?.success) {
            setbandWidthUsageData(resultJson?.data);
            setLoading(false)
        } else {
            setbandWidthUsageData({});
            setLoading(false)
        }
    } catch(err) {
        setLoading(false)
        console.log("err",err);
    }
      }

    useEffect(() => {
        getMonthlyActiveUserData()
    }, [dates])

    return { bandWidthUsageData, loading }
}