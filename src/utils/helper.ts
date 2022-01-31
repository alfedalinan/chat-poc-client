import { constants } from "./constants";
import routes from "../router/routes";
import route from "../router/index";
import Vue from 'vue';
import VueRouter from 'vue-router';

export const appInfo = () => {
    return {
        version: '1.0.0',
        title: 'Mini-Chat POC'
    }
}

export const toDateTime = (date: any) => {
        
    let year = date.getFullYear();
    let month = (parseInt(date.getMonth()) + 1) > 9 ? ( parseInt(date.getMonth()) + 1) : "0" + parseInt(date.getMonth()) + 1;
    let day = date.getDate() > 9 ? date.getDate() : "0" + date.getDate();

    let hours = date.getHours() > 9 ? date.getHours() : "0" + date.getHours();
    let minutes = date.getMinutes() > 9 ? date.getMinutes() : "0" + date.getMinutes();
    let seconds = date.getSeconds() > 9 ? date.getSeconds() : "0" + date.getSeconds();

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

export const toTwelveHourString = (hour: any) => {

    let hourNumber = parseInt(hour);
    let placeholder = "";

    if (hourNumber > 12) {
        placeholder = (hourNumber - 12) > 9 ? `${(hourNumber - 12)}` : `0${(hourNumber - 12)}`;
    }
    else {
        placeholder = hour;
    }

    return placeholder;

};

export const toChatDateFormat = (date: any): string => {

    let year = date.getFullYear();
    let month = constants.MONTHS[date.getMonth()];
    let day = date.getDate() > 9 ? date.getDate() : "0" + date.getDate();

    let initialHour = date.getHours();

    let hours = initialHour > 9 ? initialHour : `0${initialHour}`;
    let minutes = date.getMinutes() > 9 ? date.getMinutes() : "0" + date.getMinutes();

    let amPM = initialHour >= 12 ? "PM" : "AM";

    return `${month} ${day} ${year} @${toTwelveHourString(hours)}:${minutes} ${amPM}`;
}

export const toChatDateStringFormat = (dateString: string): string => {

    if (dateString != null || dateString != "") {

        let date = dateString.split(" ")[0];
        let time = dateString.split(" ")[1];

        let monthIndex = parseInt( date.split("-")[1] ) - 1; // <--- minus 1 value as January is equal to 0

        let month = constants.MONTHS[monthIndex];
        let day = date.split("-")[2];
        let year = date.split("-")[0];

        let initialHour = parseInt( time.split(":")[0] );

        let hours = initialHour > 9 ? initialHour : `0${initialHour}`;
        let minutes = parseInt( time.split(":")[1] ) > 9 ? time.split(":")[1] : `0${ parseInt(time.split(":")[1]) }`;

        let amPM = initialHour >= 12 ? "PM" : "AM";

        return `${month} ${day} ${year} @${toTwelveHourString(hours)}:${minutes} ${amPM}`;

    }
    else {
        return "";
    }


};

export const getCurrentTS = () => {

    let dateNow = Date.now();
    let ts = module.exports.toDateTime(new Date(dateNow));
    let unixTs = Math.floor(dateNow / 1000);

    return {
        date: dateNow,
        timestamp: ts,
        unixTimestamp: unixTs
    };

};

export const scrollToBottom = (className: string) => {
    const scrollView = document.getElementsByClassName(className)[0];
    // scrollView.scrollTop = scrollView.scrollHeight - scrollView.clientHeight;
    window.setTimeout(() => {
        window.scrollTo(0, scrollView.scrollHeight);
    }, 10);
};

export const resizeWindow = (document: any, className: string) => {

    let difference = 98;
    let pageMinHeight = document.getElementsByClassName('q-page')[0].style.minHeight;
    let pageHeight = parseInt(pageMinHeight.split('p')[0]) - difference;
    // previousHeight = minHeight;
    document.getElementsByClassName(className)[0].style.minHeight = `${pageHeight}px`;
    
};

export const encryptText = (text: string) => {

    const crypto = require('crypto');

    let iv = crypto.randomBytes(constants.IV_LENGTH);
    let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(constants.ENCRYPTION_KEY), iv);
    let encrypted = cipher.update(text);

    encrypted = Buffer.concat([encrypted, cipher.final()]);

    return iv.toString('hex') + ':' + encrypted.toString('hex');

};

export const consumeApi = (options: any): Promise<any> => {
    
    let userDetails = JSON.parse( localStorage.getItem(process.env.USER_PREF_KEY) || '{}' );
    let tokenDetails = JSON.parse( localStorage.getItem(process.env.TOKEN_PREF_KEY) || '{}' );

    let axios = options['axios'];
    let router = options['router'];
    let method = options['method'];
    let url = options['url'];
    let data = options['data'] || {};
    let notify = options['notify'] || {};

    let accessToken = tokenDetails.access_token;
    let refreshToken = tokenDetails.refresh_token;
    
    let headers = { "Authorization": accessToken };
    
    let consumePromise = new Promise(() => {});

    switch (method) {
        case 'get':
            
            consumePromise = axios.get(url, {headers: headers });

            break;
        case 'post':

            consumePromise = axios.post(url, data, {headers:  headers });

            break;
        
        case 'put':

            consumePromise = axios.put(url, data, {headers:  headers });

            break;

        case 'delete':

            consumePromise = axios.delete(url, {headers:  headers }, data);

            break;
    
        default:

            break;
    }

    consumePromise.then((response: any) => {
        let result = response.data;
        
        switch (result.status) {
            case 412:

                axios.post(`${process.env.API}/refresh_token`, {
                    payload: { id: userDetails.id, marked: Math.ceil( Date.now() / 1000 ) }
                }, { headers: { Authorization: refreshToken } })
                .then((resp: any) => {
                    
                    let result = resp.data;

                    localStorage.removeItem(process.env.TOKEN_PREF_KEY);
                    localStorage.setItem(process.env.TOKEN_PREF_KEY, JSON.stringify(result.data));
                })
                .catch();

                notify({
                    color: 'negative',
                    message: 'Your session has expired. Please refresh the page.',
                    timeout: 1800
                });
                return;

                break;
            case 428:
                notify({
                    color: 'negative',
                    message: 'Something went wrong. Please logout and login again.',
                    timeout: 1800
                });

                return;
                break;
            case 200:
                // axios.post(`${process.env.API}/refresh_token`, {
                //     payload: { id: userDetails.id, marked: Math.ceil( Date.now() / 1000 ) }
                // }, { headers: { Authorization: refreshToken } })
                // .then((response) => {
                    
                //     let result = response.data;

                //     localStorage.removeItem(process.env.TOKEN_PREF_KEY);
                //     localStorage.setItem(process.env.TOKEN_PREF_KEY, JSON.stringify(result.data));

                // })
                // .catch();
                break;
            default:
                break;
        }

    });

    return consumePromise;

};