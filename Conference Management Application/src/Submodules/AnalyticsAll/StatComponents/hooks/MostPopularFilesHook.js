import { useState, useEffect } from 'react'
import {offset, limit} from "@/AnalyticsAll/constants/index"

export const useMostPopularFiles = (appdir,dates) => {
    
    const [mostPopularFiles, setMostPopulaeFiles] = useState([])
    const [loading, setLoading] = useState(false)

    const baseApi = "https://bm6uvz69il.execute-api.us-east-1.amazonaws.com/dev/api";
    const getMostPopularFiles = async () => {
        try {
            setLoading(true)
            let fetchMonthlyUser = await fetch(`${baseApi}?module=ecommerce&component=reports&function=most_viewed_files&appdir=${appdir}&start_date=${dates[0]}&end_date=${dates[1]}&offset=${offset}&limit=${limit}`)
            const resultJson = await fetchMonthlyUser.json();
            if (resultJson?.success) {
                setLoading(false)
                setMostPopulaeFiles(resultJson?.data?.files);
            } else {
                setLoading(false)
                setMostPopulaeFiles([]);
            }
        } catch (err) {
            setLoading(false)
            console.log("error",err); 
        }
    }
    
    useEffect(() => {
        getMostPopularFiles()
    }, [dates])

    return { mostPopularFiles, loading }
}

