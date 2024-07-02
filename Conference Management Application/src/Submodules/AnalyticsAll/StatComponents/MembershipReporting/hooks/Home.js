import { useState, useEffect } from 'react'

const useCurrentTotalMembersHook = (sourceHex, signal) => {
    const [currentTotalMembers, setCurrentTotalMembers] = useState([])
    const [loading, setLoading] = useState(false)

    const getCurrentTotalMembersInfo = async () => {
        const baseApi = "https://bm6uvz69il.execute-api.us-east-1.amazonaws.com/dev/api";

        try {
            setLoading(true)
            let currentMemInfo = await fetch(`${baseApi}?module=dues&component=reports&function=total_current_members&source=${sourceHex}`, {signal});
            const result = await currentMemInfo.json();

            if (result?.success) {
                setCurrentTotalMembers(result?.data);
                setLoading(false)
            } else {
                setCurrentTotalMembers([]);
                setLoading(true)
            }
        } catch (error) {
            setLoading(false)
            console.log("error", error);
        }
    }

    useEffect(() => {
        getCurrentTotalMembersInfo();
    }, [])

    return { currentTotalMembers, loading }
}

const useRecentNewMemberHook =(sourceHex, start_date, end_date, signal, isReload, setIsReload)=>{
    const [ recentNewMember, setRecentNewMembers ] = useState([])
    const [ loading, setLoading ] = useState(false)
    const [ isApiFail, setIsApiFail] = useState(false)

    const getRecentNewMembersInfo = async () =>{
        const baseApi = "https://bm6uvz69il.execute-api.us-east-1.amazonaws.com/dev/api";
        
        try{
            setLoading(true)
            setIsApiFail(false)
            let newMemberInfo = await fetch(`${baseApi}?module=dues&component=reports&function=new_members_by_period&source=${sourceHex}&period=month`, {signal});

            const result = await newMemberInfo.json();
            setIsReload(false)

            if(result?.success){
                setRecentNewMembers(result?.data)
                setLoading(false)
            } else{
                setRecentNewMembers([])
                setLoading(false)
            }
        } catch (err){
            setIsReload(false)
            setLoading(false)
            setIsApiFail(true)
            console.log("error",err)
        }
    }

    useEffect(()=>{
        getRecentNewMembersInfo()
    },[start_date, end_date, isReload])
    
    return { recentNewMember, loading, isApiFail }
}

const useRecentRenewMemberHook=( sourceHex, start_date, end_date, signal, isRenewReload, setIsRenewReload)=>{
    const [ recentRenewMembers, setRecentRenewMembers ] = useState([])
    const [ loading, setLoading ] = useState(false)
    const [ isApiFail, setIsApiFail] = useState(false)

    const getRecentRenewMemberInfo = async() => {
        const  baseApi = "https://bm6uvz69il.execute-api.us-east-1.amazonaws.com/dev/api";

        try {
            setLoading(true)
            setIsApiFail(false)
            let renewMembInfo = await fetch(`${baseApi}?module=dues&component=reports&function=renewing_members_by_period&source=${sourceHex}&start_date=${start_date}&end_date=${end_date}&period=month`, {signal});

            const result = await renewMembInfo.json();
            setIsRenewReload(false)

            if (result?.success) {
                setRecentRenewMembers(result?.data);
                setLoading(false)
            } else {
                setRecentRenewMembers([]);
                setLoading(false)
            }
        } catch (err) {
            setLoading(false)
            setIsApiFail(true)
            setIsRenewReload(false)
            console.log("error", err);
        }
    }

    useEffect(() => {
        getRecentRenewMemberInfo();
    }, [isRenewReload])

    return { recentRenewMembers, loading }
}

const useExpiredTotalMemberHook = (sourceHex, signal) => {
    const [expiredTotalMembers, setExpiredTotalMembers] = useState([])
    const [loading, setLoading] = useState(false)

    const getExpTotalMemberInfo = async () => {
        const baseApi = "https://bm6uvz69il.execute-api.us-east-1.amazonaws.com/dev/api";

        try {
            setLoading(true)
            let expMemberInfo = await fetch(`${baseApi}?module=dues&component=reports&function=total_expired_members&source=${sourceHex}`, {signal})

            const result = await expMemberInfo.json()

            if (result?.success) {
                setExpiredTotalMembers(result?.data)
                setLoading(false)
            } else {
                setExpiredTotalMembers([])
                setLoading(true)
            }
        } catch (error) {
            setLoading(false)
            console.log("error",error);
        }
    }

    useEffect(() => {
        getExpTotalMemberInfo()
    }, [])

    return { expiredTotalMembers, loading }
}

const useLastMonthComparisonHook = (sourceHex, signal) => {
    const [lastMonthComparison, setLastMonthComparison] = useState([])
    const [loading, setLoading] = useState(false)

    const getLastMonthComparisonInfo = async () => {
        const baseApi = "https://bm6uvz69il.execute-api.us-east-1.amazonaws.com/dev/api";

        try {
            setLoading(true)
            let lastMonthComparisonInfo = await fetch(`${baseApi}?module=dues&component=reports&function=sales_comparison&source=${sourceHex}`, {signal});

            const result = await lastMonthComparisonInfo.json();

            if (result?.success) {
                setLoading(false)
                setLastMonthComparison(result?.data);
            } else {
                setLoading(true)
                setLastMonthComparison([]);
            }
        } catch (err) {
            setLoading(false)
            console.log("error", err);

        }
    }

    useEffect(() => {
        getLastMonthComparisonInfo();
    }, [])

    return { lastMonthComparison, loading }

}

const useCurrentMemberHook = (sourceHex, load, signal) => {

    const [currentMembers, setCurrentMembers] = useState([])
    const [loading, setLoading] = useState(false)

    const getCurrentMembersInfo = async () => {
        const baseApi = "https://bm6uvz69il.execute-api.us-east-1.amazonaws.com/dev/api";

        try {
            setLoading(true)
            let currentMemInfo = await fetch(`${baseApi}?module=dues&component=reports&function=current_members&source=${sourceHex}&new=1`, {signal});
            const result = await currentMemInfo.json();

            if (result?.success) {
                setCurrentMembers(result?.data);
                setLoading(false)
            } else {
                setCurrentMembers([]);
                setLoading(true)
            }
        } catch (error) {
            setLoading(false)
            console.log("error", error);
        }
    }

    useEffect(() => {
        if(load){
            getCurrentMembersInfo();
        }
    }, [])

    return { currentMembers, loading }
}

const usePopularMembershipTypeHook = (sourceHex, signal) => {
    const [popularMemberShip, setPopularMemberShip] = useState([])
    const [loading, setLoading] = useState(false)

    const getPopularMembershipIfo = async () => {
        const baseApi = "https://bm6uvz69il.execute-api.us-east-1.amazonaws.com/dev/api";

        try {
            setLoading(true)
            let currentMemInfo = await fetch(`${baseApi}?module=dues&component=reports&function=popular_membership_types&source=${sourceHex}&limit=5`, {signal});
            const result = await currentMemInfo.json();

            if (result?.success) {
                setPopularMemberShip(result?.data);
                setLoading(false)
            } else {
                setPopularMemberShip([]);
                setLoading(true)
            }
        } catch (error) {
            setLoading(false)
            console.log("error", error);
        }
    }

    useEffect(() => {
        getPopularMembershipIfo();
    }, [])

    return { popularMemberShip, loading }
}

const useRecentMemberHook = (source_hex, limit, signal) => {
    const [recentOrders, setRecentOrders] = useState([])
    const [loading, setLoading] = useState(false)

    const getRecentOrderInfo = async () => {
        const baseApi = "https://bm6uvz69il.execute-api.us-east-1.amazonaws.com/dev/api";
        try {
            setLoading(true)
            let recentOrderInfo = await fetch(`${baseApi}?module=dues&component=reports&function=get_orders&source=${source_hex}&limit=${limit}`, {signal});
            const result = await recentOrderInfo.json();

            if (result?.success) {
                setRecentOrders(result?.data);
                setLoading(false)
            } else {
                setRecentOrders([]);
                setLoading(true)
            }
        } catch (error) {
            setLoading(false)
            console.log("error", error);
        }
    }

    useEffect(() => {
        getRecentOrderInfo();
    }, [limit])

    return { recentOrders, loading }
}

export {
    useCurrentTotalMembersHook,
    useRecentNewMemberHook,
    useRecentRenewMemberHook,
    useExpiredTotalMemberHook,
    useLastMonthComparisonHook,
    usePopularMembershipTypeHook,
    useRecentMemberHook,
    useCurrentMemberHook,
}