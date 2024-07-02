import moment from "moment";
import _round from 'lodash/round';

export const get30PriorDate = () => {
    return moment().subtract(30, 'days').format("DD/MM/YYYY");
}

export const get15PriorDate = () => {
    return moment().subtract(15, 'days').format("DD/MM/YYYY");
}

export const getCurrentDate = () => {
    return moment(new Date()).format("DD/MM/YYYY");
}

export const getRoundValue = (value, points = 1) => {
    return _round(value, points)
}

export const formatDate = (dateString = "") => {
    return moment(dateString).format('DD/MM/YYYY');
}
