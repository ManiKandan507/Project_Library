import { useState, useEffect } from 'react'

export const useMostActiveUserHook = (appdir,dates) => {

    const [mostActiveUser, setMostActiveUser] = useState([])
    const [loading, setLoading] = useState(false)

    const baseApi = "https://bm6uvz69il.execute-api.us-east-1.amazonaws.com/dev/api";
    const getTopUsers = async () => {
        try {
            setLoading(true)
            let fetchMostActiveUserUuids = await fetch(`${baseApi}?module=ecommerce&component=reports&function=top_users&appdir=${appdir}&start_date=${dates[0]}&end_date=${dates[1]}`)
            let resultJson = await fetchMostActiveUserUuids.json();
            let constructedUuids = resultJson?.data?.users.map((data) => data?.contact_uuid);
            
            if (resultJson?.success && resultJson?.data?.users?.length > 0) {
                let options = {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ contact_uuids: constructedUuids })
                }
                try {
                let fetchMostActiveUserInfo = await fetch(`${baseApi}?module=ecommerce&component=reports&function=get_active_user_details&appdir=${appdir}&start_date=${dates[0]}&end_date=${dates[1]}`, options);
                let result = await fetchMostActiveUserInfo.json();
                if (result?.success) {
                    setLoading(false)
                    setMostActiveUser([...result?.data]);
                } else {
                    setLoading(false)
                    setMostActiveUser([]);
                }
                } catch (err) {
                    console.log("err", err);
                }
            } else {
                setMostActiveUser([]);
                setLoading(false)
            }
        } catch(err) {
                console.log("err",err);
                setLoading(false)
            }

    }

    useEffect(() => {
        getTopUsers()
    }, [dates])

    return {mostActiveUser, loading }
}
