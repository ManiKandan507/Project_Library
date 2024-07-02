import { useState, useEffect } from 'react'

export const useStatistics = (appdir) => {
    const [statistics, setStatistics] = useState({})
    const [loading,setLoading] = useState(false)
    const baseApi = "https://bm6uvz69il.execute-api.us-east-1.amazonaws.com/dev/api";

    const getInsightdata = async () => {
    try {
        setLoading(true)
        let insightsResult = await fetch(`${baseApi}?module=ecommerce&component=reports&function=insights&appdir=${appdir}`)
        let resultJson = await insightsResult.json();
        if (resultJson?.success) {
            setStatistics(resultJson?.data);
            setLoading(false)
        } else {
            setStatistics({});
            setLoading(false)
        }
    } catch(err) {
        setLoading(false)
        console.log("err",err);
    }
    };

    useEffect(() => {
        getInsightdata()
    }, [])
    return { statistics, loading }
}