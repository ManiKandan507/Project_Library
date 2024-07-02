export default {
    "AuthorFixed_Withdrawn":(queryObj) => {
        let res = "Abstract"
        let temp = queryObj.value == 1
        temp = queryObj.operator == "equal" ? temp : !temp
        res += temp ? " is " : " is not "
        res += "withdrawn"
        return res
    } 
}