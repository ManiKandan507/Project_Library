import { useState, useEffect } from 'react'

export const useMonthlyFileViewsData = (appdir,dates) => {
    const [fileDetails, setFileDetails] = useState([])
    const baseApi = "https://bm6uvz69il.execute-api.us-east-1.amazonaws.com/dev/api"

    const getMonthlyFilesViewData = async () => {
        try{
            let userFilesDetails = await fetch(`${baseApi}?module=ecommerce&component=reports&function=monthly_file_views&appdir=${appdir}&start_date=${dates[0]}&end_date=${dates[1]}`)
            const resultJson = await userFilesDetails.json();
            if (resultJson?.success) {
                setFileDetails(resultJson?.data);
            } else {
                setFileDetails([]);
            }
        } catch(err) {
            console.log("error",err);
        }
      }

    useEffect(() => {
        getMonthlyFilesViewData()
    }, [dates])

    return fileDetails
}