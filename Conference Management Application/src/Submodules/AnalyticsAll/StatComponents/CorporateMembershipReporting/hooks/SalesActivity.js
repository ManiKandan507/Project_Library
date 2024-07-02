import { useState, useEffect } from "react";

export const useSalesActivityHook = (sourceHex) => {
    const [salesActivity, setSalesActivity] = useState([])
    const [loading, setLoading] = useState(false)

    const getSalesActivityInfo = async () => {
        const baseApi = "https://bm6uvz69il.execute-api.us-east-1.amazonaws.com/dev/api";

        try {
            setLoading(true)
            let salesActivityInfo = await fetch(`${baseApi}?module=dues&component=corp_reports&function=corp_sales_summary&source=${sourceHex}`);
            const result = await salesActivityInfo.json();

            if (result?.success) {
                setLoading(false)
                setSalesActivity(result?.data);
            } else {
                setSalesActivity([]);
                setLoading(false)
            }
        } catch (err) {
            setLoading(false)
            console.log("error", err);

        }
    }

    useEffect(() => {
        getSalesActivityInfo();
    }, [])

    return { salesActivity, loading }
}