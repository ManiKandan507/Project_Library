import { useState, useEffect } from "react";

const useRecentTotalDonor = ({appDir, options, start_date, end_date, donationCategory}) => {
    
    const [donations, setDonations] = useState([])
    const [loading, setLoading] = useState(false)

    const getRecentDonors = async() => {
        try {
            setLoading(true)
            let donation = await fetch(`${appDir}?module=donations&component=reports&function=see_donations&start_date=${start_date}&end_date=${end_date}&donationids=[${donationCategory}]&membership=true`, options)
            const result = await donation.json();

            if(result?.succes) {
                setDonations(result?.data)
                setLoading(false)
            }else {
                setDonations([])
                setLoading(false)
            }
        }
        catch (e) {
            console.log("error", e)
            setLoading(false)
        }
    }

    useEffect(() => {
        getRecentDonors();
    }, [start_date, end_date, donationCategory])   

    return { donations, loading }
}

export {
    useRecentTotalDonor
}