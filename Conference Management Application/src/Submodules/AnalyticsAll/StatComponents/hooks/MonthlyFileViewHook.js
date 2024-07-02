import { useState, useEffect } from 'react'

export const useMonthlyFileViewHook = (appdir, dates) => {
  const [fileViewInfo, setFileViewInfo] = useState([]);
  const [isFileLoading,setIsFileLoading] = useState(false);
  const baseApi = "https://bm6uvz69il.execute-api.us-east-1.amazonaws.com/dev/api";

  const getFilesStatisticsData = async () => {
    try {
      setIsFileLoading(true)
      let userFilesDetails = await fetch(`${baseApi}?module=ecommerce&component=reports&function=monthly_file_views&appdir=${appdir}&start_date=${dates[0]}&end_date=${dates[1]}`)
      const resultJson = await userFilesDetails.json();
      if (resultJson?.success) {
        setFileViewInfo(resultJson?.data);
        setIsFileLoading(false);
      } else {
        setFileViewInfo([]);
        setIsFileLoading(false);
      }
    } catch (err) {
      console.log("error", err);
      setIsFileLoading(false);
    }
  }

  useEffect(() => {
    getFilesStatisticsData()
  }, [dates])
  
  return {fileViewInfo,isFileLoading}
}
