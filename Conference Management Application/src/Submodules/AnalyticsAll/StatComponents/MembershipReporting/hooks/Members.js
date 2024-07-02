import { useState, useEffect } from 'react'

const useCurrentMemberInfoHook = (sourceHex, groupids, load, signal) => {

    const [currentMembersInfo, setCurrentMembersInfo] = useState([])
    const [loading, setLoading] = useState(false)

    console.log('signal', signal)

    const getCurrentMembersInfo = async () => {
        const baseApi = "https://bm6uvz69il.execute-api.us-east-1.amazonaws.com/dev/api";

        try {
            setLoading(true)
            let currentMemInfo = await fetch(`${baseApi}?module=dues&component=reports&function=current_members&source=${sourceHex}&new=1&groupid=${groupids}`, {signal});
            const result = await currentMemInfo.json();

            if (result?.success) {
                setCurrentMembersInfo(result?.data);
                setLoading(false)
            } else {
                setCurrentMembersInfo([]);
                setLoading(true)
            }
        } catch (error) {
            setLoading(false)
            console.log("error", error);
        }
    }

    useEffect(() => {
        if(load){
            console.log('render')
            getCurrentMembersInfo();
        }
    }, [])

    return { currentMembersInfo, loading }
}

const useCurrentMemberDetails = (sourceHex, groupids, load, signal) => {
    const [currentMembersDetails, setCurrentMembersDetails] = useState([])
    const [memberLoading, setMemberLoading] = useState(false)

    const getCurrentMembersDetails = async () => {
        const baseApi = "https://bm6uvz69il.execute-api.us-east-1.amazonaws.com/dev/api";
        let currentMemInfo;
        let result;
        try {
            setMemberLoading(true)
            if(groupids){
                currentMemInfo = await fetch(`${baseApi}?module=dues&component=reports&function=current_members_details&source=${sourceHex}&groupid=${groupids}`, {signal}); 
                result = await currentMemInfo.json();
            }

            if (result?.success) {
                setCurrentMembersDetails(result?.data);
                setMemberLoading(false)
            } else {
                setCurrentMembersDetails([]);
                setMemberLoading(true)
            }
        } catch (error) {
            setMemberLoading(false)
            console.log("error", error);
        }
    }

    useEffect(() => {
        if(load){
            getCurrentMembersDetails();
        }
    }, [groupids])

    return { currentMembersDetails, memberLoading }
}

const useExpiredMemberHook = (sourceHex, groupid, date, identifyDatePicker, load, signal) => {
    const [expiredMembers, setExpiredMembers] = useState([])
    const [loading, setLoading] = useState(false)

    const getExpMemberInfo = async () => {
        const baseApi = "https://bm6uvz69il.execute-api.us-east-1.amazonaws.com/dev/api";
        
        try {
            setLoading(true)
            let expMemberInfo;
            if (identifyDatePicker === "expiryasof") {
                expMemberInfo = await fetch(`${baseApi}?module=dues&component=reports&function=expired_members&source=${sourceHex}&groupid=${groupid}&expiry_as_of=${date}&new=1`, {signal})
            } else {
                expMemberInfo = await fetch(`${baseApi}?module=dues&component=reports&function=expired_members_between&source=${sourceHex}&groupid=${groupid}&start_date=${date[0]}&end_date=${date[1]}`, {signal})
            }
            const result = await expMemberInfo.json()

            if (result?.success) {
                setExpiredMembers(result?.data)
                setLoading(false)
            }
            else {
                setExpiredMembers([])
                setLoading(true)
            }
        } catch (error) {
            setLoading(false)
            console.log('error', error)
        }
    }

    useEffect(() => {
        if(load){
            getExpMemberInfo()
        }
    }, [date])

    return { expiredMembers, loading }
}

const useExpiredMemDetailsHook =(sourceHex, groupid, date, identifyDatePicker,load, signal)=>{
    const [ expMemberDetails, setExpMemberDetails ] = useState([])
    const [ memLoading, setMemLoading ] = useState(false)

    const getExpMemDetails = async () =>{
        const baseApi = "https://bm6uvz69il.execute-api.us-east-1.amazonaws.com/dev/api";
        try{
            setMemLoading(true)
            let expMemInfo;
            let result ;

            if(groupid){
                if (identifyDatePicker === "expiryasof") {
                    expMemInfo = await fetch(`${baseApi}?module=dues&component=reports&function=expired_members_details&source=${sourceHex}&groupid=${groupid}&expiry_as_of=${date}`, {signal})
                } else {
                    expMemInfo = await fetch(`${baseApi}?module=dues&component=reports&function=expired_members_between_details&source=${sourceHex}&groupid=${groupid}&start_date=${date[0]}&end_date=${date[1]}`, {signal})
                }
                result = await expMemInfo.json();
            }

            if(result?.success){
                setExpMemberDetails(result?.data)
                setMemLoading(false)
            }
            else{
                setExpMemberDetails([])
                setMemLoading(true)
            }
        } catch (err){
            setMemLoading(false)
            console.log("error",err)
        }
    }

    useEffect(()=>{
        if(load){
            getExpMemDetails()
        }
    },[groupid, date])
    
    return { expMemberDetails, memLoading }
}

const useNewMembersHook =(sourceHex, start_date, end_date,load, signal)=>{
    const [ newMembers, setNewMembers ] = useState([])
    const [ loading, setLoading ] = useState(false)

    const getNewMembersInfo = async () =>{
        const baseApi = "https://bm6uvz69il.execute-api.us-east-1.amazonaws.com/dev/api";
        
        try{
            setLoading(true)
            let newMemberInfo = await fetch(`${baseApi}?module=dues&component=reports&function=new_members&source=${sourceHex}&start_date=${start_date}&end_date=${end_date}&new=1`, {signal});

            const result = await newMemberInfo.json();

            if(result?.success){
                setNewMembers(result?.data)
                setLoading(false)
            }
            else{
                setNewMembers([])
                setLoading(true)
            }
        } catch (err){
            setLoading(false)
            console.log("error",err)
        }
    }

    useEffect(()=>{
        if(load){
            getNewMembersInfo()
        }
    },[start_date, end_date])
    
    return { newMembers, loading }
}

const useNewMemberDetails =(sourceHex, groupid, start_date, end_date, load, signal)=>{
    const [ newMembersDetails, setNewMembersDetails ] = useState([])
    const [ newMemLoading, setNewMemLoading ] = useState(false)

    const getNewMembersDetails = async () =>{
        const baseApi = "https://bm6uvz69il.execute-api.us-east-1.amazonaws.com/dev/api";
        let newMemberInfo;
        let result;
        try{
            setNewMemLoading(true)
            if (groupid) {
                newMemberInfo = await fetch(`${baseApi}?module=dues&component=reports&function=new_members_details&source=${sourceHex}&groupid=${groupid}&start_date=${start_date}&end_date=${end_date}`, {signal}); 
                result = await newMemberInfo.json();
            }

            if(result?.success){
                setNewMembersDetails(result?.data)
                setNewMemLoading(false)
            }
            else{
                setNewMembersDetails([])
                setNewMemLoading(true)
            }
        } catch (err){
            setNewMemLoading(false)
            console.log("error",err)
        }
    }

    useEffect(()=>{
        if(load){
            getNewMembersDetails()
        }
    },[groupid, start_date, end_date ])
    
    return { newMembersDetails, newMemLoading }
}

const useRenewMemberHook =( sourceHex,groupid, start_date, end_date, load, signal )=>{
    const [ renewMembers, setRenewMembers ] = useState([])
    const [ loading, setLoading ] = useState(false)

    const getRenewMemberInfo = async() => {
        const  baseApi = "https://bm6uvz69il.execute-api.us-east-1.amazonaws.com/dev/api";

        try {
            setLoading(true)
            let renewMembInfo = await fetch(`${baseApi}?module=dues&component=reports&function=renewing_members&source=${sourceHex}&start_date=${start_date}&end_date=${end_date}&groupid=${groupid}&new=1`, {signal});
            const result = await renewMembInfo.json();

            if (result?.success) {
                setRenewMembers(result?.data);
                setLoading(false)
            } else {
                setRenewMembers([]);
                setLoading(true)
            }
        } catch (err) {
            setLoading(false)
            console.log("error", err);
        }
    }

    useEffect(() => {
        if(load){
            getRenewMemberInfo()
        }
    }, [start_date, end_date])

    return { renewMembers, loading }
}

const useRenewMemberDetailsHook =(sourceHex, groupid, start_date, end_date, load, signal)=>{
    const [ renewMemDetails, setRenewMemDetails ] = useState([])
    const [ renewMemLoading, setRenewMemLoading ] = useState(false)

    const getRenewMembersDetails = async () =>{
        const baseApi = "https://bm6uvz69il.execute-api.us-east-1.amazonaws.com/dev/api";
        let result;
        try{
            setRenewMemLoading(true)
            if(groupid){
                let renewMembInfo = await fetch(`${baseApi}?module=dues&component=reports&function=renewing_members_details&source=${sourceHex}&groupid=${groupid}&start_date=${start_date}&end_date=${end_date}`, {signal});
                result = await renewMembInfo.json();
            }

            if(result?.success){
                setRenewMemDetails(result?.data)
                setRenewMemLoading(false)
            }
            else{
                setRenewMemDetails([])
                setRenewMemLoading(true)
            }
        } catch (err){
            setRenewMemLoading(false)
            console.log("error",err)
        }
    }

    useEffect(()=>{
        if(load){
            getRenewMembersDetails()
        }
    },[groupid, start_date, end_date])
    
    return { renewMemDetails, renewMemLoading }
}

export {
    useCurrentMemberInfoHook,
    useCurrentMemberDetails,
    useExpiredMemberHook,
    useExpiredMemDetailsHook,
    useNewMembersHook,
    useNewMemberDetails,
    useRenewMemberHook,
    useRenewMemberDetailsHook
}