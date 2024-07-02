import { useState, useEffect } from 'react'

export const useFileDetails = (appdir) => {
    const [fileDetails, setFileDetails] = useState({})
    const [isFileStatisticLoading, setIsFileStatisticLoading] = useState(false);
    const baseApi = "https://bm6uvz69il.execute-api.us-east-1.amazonaws.com/dev/api";

    const getFilesStatisticsData = async () => {
        try{
            setIsFileStatisticLoading(true);
            let userFilesDetails = await fetch(`${baseApi}?module=ecommerce&component=reports&function=file_insights&appdir=${appdir}`)
            const resultJson = await userFilesDetails.json();
            if (resultJson?.success) {
                setFileDetails(resultJson?.data);
                setIsFileStatisticLoading(false);
            } else {
                setFileDetails({});
                setIsFileStatisticLoading(false);
            }
        } catch (err) {
            console.log("error",err);
            setIsFileStatisticLoading(false);
        }
      }

    useEffect(() => {
        getFilesStatisticsData()
    }, [])

    return {fileDetails,isFileStatisticLoading}
}