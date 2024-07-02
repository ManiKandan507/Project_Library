import { useState, useEffect } from 'react'

export const useActiveUserByMonthChart = ({ appdir, dates, contactUuid }) => {
  const [selectedBarChartUserData, setSelectedBarChartUserData] = useState([])
  const [loading, setLoading] = useState(false)
  const baseApi = "https://bm6uvz69il.execute-api.us-east-1.amazonaws.com/dev/api";
  const getbarChartTableData = async () => {
    try {
      setLoading(true)
      let options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ contact_uuids: contactUuid })
      }
      let fetchMostActiveUserInfo = await fetch(`${baseApi}?module=ecommerce&component=reports&function=get_active_user_details&appdir=${appdir}&start_date=${dates[0]}&end_date=${dates[1]}`, options);
      let result = await fetchMostActiveUserInfo.json();
      if (result?.success) {
        setLoading(true)
        setSelectedBarChartUserData(result?.data);
      } else {
        setLoading(false)
        setSelectedBarChartUserData([]);
      }
    } catch (err) {
      setLoading(false)
      console.log("error", err);
    }
  }

  useEffect(() => {
    if (contactUuid?.length) {
      getbarChartTableData()
    }else{
      setSelectedBarChartUserData([])
    }
  }, [dates, contactUuid])

  return { selectedBarChartUserData, loading }
}
