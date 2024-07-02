// const fetch = require('node-fetch');

class HelperFCM {
    constructor() { }
    static validateTopicCredentials(server_key, tokens, topic) {
        return new Promise((resolve, reject) => {
            let error = null;
            //if(server_key){ server_key = server_key.trim();}
            if(tokens){ tokens = tokens.trim();}
            if(topic){ topic = topic.trim();}

            if(server_key == null || server_key == ""){
                error = {message:"Add Valid serverKey!"};
            }
            if(error == null && (tokens == "" || tokens == null)){
                error = {message:"Add Valid Tokens!"};
            }
            if(error == null && (topic == "" || topic == null)){
                error = {message:"Add Valid Topic!"};
            }
            if(error){
                reject(error);
            }else{
                let validCredentials = {
                    serverKey : server_key,
                };
                if(Array.isArray(tokens)){
                    validCredentials.tokens = tokens;
                }else{
                    validCredentials.tokens = [tokens];
                }
                if(topic.startsWith("/topics/")){
                    validCredentials.topic = topic;
                }else{
                    validCredentials.topic = "/topics/"+topic;
                }
                resolve(validCredentials);
            }
        });
    }

    static validatePushCredentials(server_key, to, pushMethod, notificationObj, condition) {
        return new Promise((resolve, reject) => {
            let validCredentials = {
                serverKey : server_key,
            };
            let error = null;
            if(server_key){ server_key = server_key.trim();}

            if(server_key == null || server_key == ""){
                error = {message:"Add Valid serverKey!"};
            }
            if(error == null && (notificationObj == "" || notificationObj == null)){
                error = {message:"Add Valid Notification Message!"};
            }
            
            if(error == null && (to == "" || to == null) && !condition){
                error = {message:"Add Valid Tokens/Topic!"};
            }
            if(error == null && notificationObj){
                if(notificationObj.title){
                    //VALID TITLE
                }else{
                    error = {message:"Add Valid Notification Title!"};
                }
                /*if(notificationObj.body){
                    //VALID body
                }else{
                    error = {message:"Add Valid Notification Body!"};
                }*/
            }
            if(pushMethod == 'topic'){
                if(to.startsWith("/topics/")){
                    validCredentials.topic = to;
                }else{
                    validCredentials.topic = "/topics/"+to;
                }
            }
            if(pushMethod == 'token'){
                if(Array.isArray(to)){
                    validCredentials.tokens = to;
                }else{
                    validCredentials.tokens = [to];
                }
            }
            if(error){
                reject(error);
            }else{
                resolve(validCredentials);
            }
        });
    }

    static subscribeToTopic(server_key, tokens, topic) {
        return new Promise((resolve, reject) => {
            HelperFCM.subscribeUnSubscribeToFCMTopic(server_key, tokens, topic, 'subscribe')
                .then(async(res) => {
                    resolve(res);
                })
                .catch((err) => {
                    reject(err);
                });
        });
    }

    static unSubscribeToTopic(server_key, tokens, topic) {
        return new Promise((resolve, reject) => {
            HelperFCM.subscribeUnSubscribeToFCMTopic(server_key, tokens, topic, 'unsubscribe')
                .then(async(res) => {
                    resolve(res);
                })
                .catch((err) => {
                    reject(err);
                });
        });
    }

    static sendPushToTokens(server_key, tokens, notificationObj, payloadObj, platform) {
        return new Promise((resolve, reject) => {
            HelperFCM.validatePushCredentials(server_key, tokens, 'token', notificationObj)
                .then(async(credentials) => {
                    await HelperFCM.sendFCMPush(credentials, 'token', notificationObj, payloadObj, platform.toLowerCase())
                        .then(async(res) => {
                            resolve(res);
                        }).catch((err) => {
                            reject(err);
                        });
                }).catch((err) => {
                    reject(err);
                });
        });
    }

    static sendPushToTopic(server_key, topic, notificationObj, payloadObj, condition) {
        return new Promise((resolve, reject) => {
            HelperFCM.validatePushCredentials(server_key, topic, 'topic', notificationObj, condition)
                .then(async(credentials) => {
                    await HelperFCM.sendFCMPush(credentials, 'topic', notificationObj, payloadObj, 'web', condition)
                        .then(async(res) => {
                            resolve(res);
                        }).catch((err) => {
                            reject(err);
                        });
                }).catch((err) => {
                    reject(err);
                });
        });
    }

    static subscribeUnSubscribeToFCMTopic(server_key, tokens, topic, method) {
        return new Promise((resolve, reject) => {
            HelperFCM.validateTopicCredentials(server_key, tokens, topic)
                .then(async(credentials) => {
                    try{
                        let payload = {
                            "to": credentials.topic,
                            "registration_tokens": credentials.tokens
                        };
                        let apiUrl = "https://iid.googleapis.com/iid/v1:batchAdd";
                        if(method =="unsubscribe"){
                            apiUrl = "https://iid.googleapis.com/iid/v1:batchRemove";
                        }
                        let options = {
                            method: "POST",
                            headers: {
                                Authorization: "key=" + credentials.serverKey,
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify(payload),
                        };
                        fetch(apiUrl, options)
                            .then(res => res.json())
                            .then(json => {
                                resolve(json);
                            })
                            .catch((err) => {
                                reject(err);
                            });
                    }catch(err){
                        reject(err);
                    }
                })
                .catch((err) => {
                    reject(err);
                });
        });
    }

    static sendFCMPush(credentials, pushMethod, notificationObj, payloadObj, platform, condition) {
        return new Promise((resolve, reject) => {
            try{
                let message = {
                    //data: payloadObj
                };
                let apiUrl = "https://fcm.googleapis.com/fcm/send";

                notificationObj.title = notificationObj.title ? notificationObj.title : 'Testing FCM Push Notificatiion';
                notificationObj.body = notificationObj.body ? notificationObj.body : '';

                if(pushMethod =="topic"){
                    //message.data = payloadObj;
                    if(condition){
                        message.condition = condition;
                    }
                    else{
                        message.to = credentials.topic;
                    }
                    
                    message.notification = {
                        title: notificationObj.title,
                        body: notificationObj.body
                    };
                    if(notificationObj.click_action){
                        message.notification.click_action = notificationObj.click_action;
                    }
                    if(notificationObj.image){
                        message.notification.image = notificationObj.image;
                    }
                }
                if(pushMethod =="token"){
                    message.registration_ids = credentials.tokens;
                    platform = platform.toLowerCase();
                    if(platform && platform =='web'){
                        message.notification = {
                            title: notificationObj.title,
                            body: notificationObj.body
                        };
                        message.data = payloadObj;
                        if(notificationObj.click_action){
                            message.notification.click_action = notificationObj.click_action;
                        }
                        if(notificationObj.image){
                            message.notification.image = notificationObj.image;
                        }
                    }else{
                        message.data = {
                            body: notificationObj.body,
                            title: notificationObj.title,
                            dataObj: payloadObj,
                        };
                        if(payloadObj.type){
                            message.data.type = payloadObj.type;
                        }
                        if(notificationObj.membershipid){
                            message.data.membershipid = notificationObj.membershipid;
                        }
                        if (notificationObj && notificationObj.badge) {
                            message.data.badge = notificationObj.badge;
                        }
                        if(notificationObj.image){
                            message.data.image = notificationObj.image;
                        }
                        if(platform && platform =='web'){
                            if(notificationObj.click_action){
                                message.data.click_action = notificationObj.click_action;
                            }
                        }
                        if(platform && platform =='ios'){
                            message.notification = {
                                title: notificationObj.title,
                                body: notificationObj.body
                            };
                            if (notificationObj && notificationObj.badge) {
                                message.notification.badge = notificationObj.badge;
                            }
                            if(notificationObj.image){
                                message.notification.image = notificationObj.image;
                            }
                        }
                    }
                }
                let options = {
                    method: "POST",
                    headers: {
                        Authorization: "key=" + credentials.serverKey,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(message),
                };
                fetch(apiUrl, options)
                    .then(res => res.json())
                    .then(json => {
                        resolve(json);
                    })
                    .catch((err) => {
                        reject(err);
                    });
            }catch(err){
                reject(err);
            }
        });
    }
}

export default HelperFCM;
