import Goals from "../goals/goals";
import Resolutions from "../resolutions/resolutions";
import Authenticate from "../authenticate/authenticate";

const ActiveDirectory = require('activedirectory2');

export default {
    Query: {
        user(obj, args, { user }) {
            return user || {};
        }
    },
    User: {
        email: user => user.emails[0].address,
        resolutions: user => Resolutions.find({userId: user._id}).fetch(),
        goals: user => Goals.find({userId: user._id}).fetch()
    },
    Mutation: {
        authenticate(obj, { login, password }) {
            if(login !== '' && password !== ''){

                const authenticateData = Authenticate.find({}).fetch();

                if(authenticateData.length !== 0){

                    // ЛОГИН В АД
                    const sAMAccountName = login;

                    // ДЛЯ ПОНИМАНИЯ КУДА МОЖНО ПОЛЬЗОВАТЕЛЯ ПУСТИТЬ
                    let admin = false;
                    let user = false;
                    let block = false;

                    // ДЛЯ ХРАНЕНИЯ МАССИВОВ ИЛИ СТРОК ГРУПП ДОСТУПОВ ИЗ БАЗЫ ДАННЫХ
                    let exploaded_userGroupsNames;
                    let exploaded_adminGroupsNames;
                    let exploaded_blockGroupsNames;
                    let exploaded_forbiddenDN;

                    // ДЛЯ ХРАНЕНИЯ ДАННЫХ АВТОРИЗИРОВАННОГО ПОЛЬЗОВАТЕЛЯ, ДЛЯ РЕГИСТРАЦИИ ИЛИ ОБНОВЛЕНИЯ ИНФЫ
                    let user_data;

                    // ДЛЯ ОПРЕДЕЛЕНИЯ ПОСЛЕДНЕГО ЭЕЛЕМЕНТА МАССИВА С ДАННЫМИ ДЛЯ ПОДКЛЮЧЕНИЯ
                    let authenticateDataLength = authenticateData.length;

                    for (let i = 0; i < authenticateDataLength; i++) {

                        // КОМПАНИЯ
                        const company = authenticateData[i].company;

                        // УРЛ
                        const url = authenticateData[i].url;

                        // ПАПКИ
                        const baseDN = authenticateData[i].baseDN;
                        const forbiddenDN = authenticateData[i].forbiddenDN;

                        // ГРУППЫ
                        const userGroupsNames = authenticateData[i].userGroupsNames;
                        const adminGroupsNames = authenticateData[i].adminGroupsNames;
                        const blockGroupsNames = authenticateData[i].blockGroupsNames;

                        // ДЛЯ ПОНИМАНИЯ МНОГО ГРУПП В КАЖДОЙ СТРОКЕ ИЛИ ТОЛЬКО ОДНА
                        if(userGroupsNames.indexOf('|') !== -1){
                            // ДЛЯ РАЗДЕЛЕНИЯ ГРУПП ОТДЕЛЬНОЙ КАТЕГОРИИ ЕСЛИ ИХ БОЛЬШЕ ОДНОЙ
                            exploaded_userGroupsNames = userGroupsNames.split('|')
                        }else{
                            // ДЛЯ ЗАПИСИ ГРУППЫ В ПЕРЕМЕННУЮ ЕСЛИ ОНА ОДНА
                            exploaded_userGroupsNames = userGroupsNames
                        }

                        if(adminGroupsNames.indexOf('|') !== -1){
                            // ДЛЯ РАЗДЕЛЕНИЯ ГРУПП ОТДЕЛЬНОЙ КАТЕГОРИИ ЕСЛИ ИХ БОЛЬШЕ ОДНОЙ
                            exploaded_adminGroupsNames = adminGroupsNames.split('|')
                        }else{
                            // ДЛЯ ЗАПИСИ ГРУППЫ В ПЕРЕМЕННУЮ ЕСЛИ ОНА ОДНА
                            exploaded_adminGroupsNames = adminGroupsNames
                        }

                        if(blockGroupsNames.indexOf('|') !== -1){
                            // ДЛЯ РАЗДЕЛЕНИЯ ГРУПП ОТДЕЛЬНОЙ КАТЕГОРИИ ЕСЛИ ИХ БОЛЬШЕ ОДНОЙ
                            exploaded_blockGroupsNames = blockGroupsNames.split('|')
                        }else{
                            // ДЛЯ ЗАПИСИ ГРУППЫ В ПЕРЕМЕННУЮ ЕСЛИ ОНА ОДНА
                            exploaded_blockGroupsNames = blockGroupsNames
                        }

                        if(forbiddenDN.indexOf('|') !== -1){
                            // ДЛЯ РАЗДЕЛЕНИЯ ГРУПП ОТДЕЛЬНОЙ КАТЕГОРИИ ЕСЛИ ИХ БОЛЬШЕ ОДНОЙ
                            exploaded_forbiddenDN = forbiddenDN.split('|')
                        }else{
                            // ДЛЯ ЗАПИСИ ГРУППЫ В ПЕРЕМЕННУЮ ЕСЛИ ОНА ОДНА
                            exploaded_forbiddenDN = forbiddenDN
                        }

                        const config = {
                            url: url,
                            baseDN: baseDN,
                            username: login + "@flyuia.com",
                            password: password
                        };

                        const ad = new ActiveDirectory(config);

                        ad.authenticate(login + "@flyuia.com", password, function(err, auth) {
                            if (err) {
                                console.log('ERROR: ' + JSON.stringify(err));
                            }
                            if (auth) {
                                console.log('Authenticated!');

    // =======================================================================================================

                                // ДЛЯ ПОИСКА ПОЛЬЗОВАТЕЛЯ В УВОЛЕННЫХ
                                if(Array.isArray(exploaded_forbiddenDN)){
                                    console.log('exploaded_forbiddenDN array!');

                                    let exploaded_forbiddenDNLength = exploaded_forbiddenDN.length;

                                    for (let u = 0; u < exploaded_forbiddenDNLength; u++) {
                                        if(exploaded_forbiddenDN[u] !== ''){
                                            const forbidden_config = {
                                                url: url,
                                                baseDN: exploaded_forbiddenDN[u],
                                                username: login + "@flyuia.com",
                                                password: password
                                            };

                                            const forbidden_ad = new ActiveDirectory(forbidden_config);

                                            forbidden_ad.authenticate(login + "@flyuia.com", password, function(err, auth) {
                                                if (err) {
                                                    // return "Login or password is invalid!"
                                                    throw new Error("exploaded_forbiddenDN auth try ERROR!")
                                                }
                                                if (auth) {
                                                    console.log('Authenticated exploaded_forbiddenDN!');

                                                    if(authenticateDataLength === i){
                                                        // return "Authentication BLOCKED!"
                                                        throw new Error("Authentication BLOCKED!")
                                                    }
                                                }
                                                else {
                                                    console.log('Authentication failed exploaded_forbiddenDN!');

                                                    admin = false;
                                                    user = false;
                                                    block = false;
                                                }
                                            });
                                        }
                                    }
                                }else{
                                    console.log('exploaded_forbiddenDN string or empty!');

                                    if(exploaded_forbiddenDN !== ''){
                                        const forbidden_config = {
                                            url: url,
                                            baseDN: exploaded_forbiddenDN,
                                            username: login + "@flyuia.com",
                                            password: password
                                        };

                                        const forbidden_ad = new ActiveDirectory(forbidden_config);

                                        forbidden_ad.authenticate(login + "@flyuia.com", password, function(err, auth) {
                                            if (err) {
                                                // return "Login or password is invalid!"
                                                throw new Error("exploaded_forbiddenDN auth try ERROR!")
                                            }
                                            if (auth) {
                                                console.log('Authenticated exploaded_forbiddenDN!');

                                                if(authenticateDataLength === i){
                                                    // return "Authentication BLOCKED!"
                                                    throw new Error("Authentication BLOCKED!")
                                                }
                                            }
                                            else {
                                                console.log('Authentication failed exploaded_forbiddenDN!');

                                                admin = false;
                                                user = false;
                                                block = false;
                                            }
                                        });
                                    }
                                }

    // =======================================================================================================

                                // ДЛЯ БЫСТРОГО ПРОПУСКА ПОЛЬЗОВАТЕЛЕЙ ПРОВЕРЕМ ПРИНАДЛЕЖНОСТЬ К ПОЛЬЗОВАТЕЛЯМ
                                if(Array.isArray(exploaded_userGroupsNames)){

                                    let exploaded_userGroupsNamesLength = exploaded_userGroupsNames.length;

                                    for (let t = 0; t < exploaded_userGroupsNamesLength; t++) {
                                        if(exploaded_userGroupsNames[t] !== '' && user !== true){
                                            ad.isUserMemberOf(login + "@flyuia.com", exploaded_userGroupsNames[t], function(err, isMember) {
                                                if (err) {
                                                    console.log('ERROR: ' +JSON.stringify(err));
                                                    return;
                                                }

                                                user = true;
                                                console.log(login + "@flyuia.com" + ' isMemberOf ' + exploaded_userGroupsNames[t] + ': ' + isMember);
                                            });
                                        }
                                    }
                                }else{
                                    if(exploaded_userGroupsNames !== ''){
                                        ad.isUserMemberOf(login + "@flyuia.com", exploaded_userGroupsNames, function(err, isMember) {
                                            if (err) {
                                                console.log('ERROR: ' +JSON.stringify(err));
                                                return;
                                            }

                                            user = true;
                                            console.log(login + "@flyuia.com" + ' isMemberOf ' + exploaded_userGroupsNames + ': ' + isMember);
                                        });
                                    }
                                }

                                // ДЛЯ БЫСТРОГО ПРОПУСКА АДМИНИСТРАТОРОВ ПРОВЕРЕМ ПРИНАДЛЕЖНОСТЬ К АДМИНИСТРАТОРАМ
                                if(Array.isArray(exploaded_adminGroupsNames)){

                                    let exploaded_adminGroupsNamesLength = exploaded_adminGroupsNames.length;

                                    for (let r = 0; r < exploaded_adminGroupsNamesLength; r++) {

                                        console.log(exploaded_adminGroupsNames[r]);

                                        if(exploaded_adminGroupsNames[r] !== '' && admin !== true){
                                            ad.isUserMemberOf(login + "@flyuia.com", exploaded_adminGroupsNames[r], function(err, isMember) {
                                                if (err) {
                                                    console.log('ERROR: ' +JSON.stringify(err));
                                                    return;
                                                }

                                                admin = true;
                                                console.log(login + "@flyuia.com" + ' isMemberOf ' + exploaded_adminGroupsNames[r] + ': ' + isMember);
                                            });
                                        }
                                    }
                                }else{
                                    if(exploaded_adminGroupsNames !== ''){
                                        ad.isUserMemberOf(login + "@flyuia.com", exploaded_adminGroupsNames, function(err, isMember) {
                                            if (err) {
                                                console.log('ERROR: ' +JSON.stringify(err));
                                                return;
                                            }

                                            admin = true;
                                            console.log(login + "@flyuia.com" + ' isMemberOf ' + exploaded_adminGroupsNames + ': ' + isMember);
                                        });
                                    }
                                }

                                // ДЛЯ БЫСТРОГО ОТБОЙНИКА ПРОВЕРЯЕМ КОНТР-ГРУППЫ
                                if(Array.isArray(exploaded_blockGroupsNames)){

                                    let exploaded_blockGroupsNamesLength = exploaded_blockGroupsNames.length;

                                    for (let w = 0; w < exploaded_blockGroupsNamesLength; w++) {

                                        console.log(exploaded_blockGroupsNames[w]);

                                        if(exploaded_blockGroupsNames[w] !== '' && block !== true){
                                            ad.isUserMemberOf(login + "@flyuia.com", exploaded_blockGroupsNames[w], function(err, isMember) {
                                                if (err) {
                                                    console.log('ERROR: ' +JSON.stringify(err));
                                                    return;
                                                }

                                                block = true;
                                                console.log(login + "@flyuia.com" + ' isMemberOf ' + exploaded_blockGroupsNames[w] + ': ' + isMember);
                                            });
                                        }
                                    }
                                }else{
                                    if(exploaded_blockGroupsNames !== ''){
                                        ad.isUserMemberOf(login + "@flyuia.com", exploaded_blockGroupsNames, function(err, isMember) {
                                            if (err) {
                                                console.log('ERROR: ' +JSON.stringify(err));
                                                return;
                                            }

                                            block = true;
                                            console.log(login + "@flyuia.com" + ' isMemberOf ' + exploaded_blockGroupsNames + ': ' + isMember);
                                        });
                                    }
                                }

    // =======================================================================================================

                                // ДЛЯ ПРОВЕРКИ КАКИЕ УРОВНИ ДОСТУПА БЫЛИ ПРОЙДЕНЫ
                                if(block === true){

                                }else if(user === false && admin === false && block === false){

                                }else if(user === true && admin === true){

                                }else if(user === true){

                                }else if(admin === true){

                                }
                            }
                            else {
                                console.log('Authentication failed!');

                                if(authenticateDataLength === i){
                                    // return "Login or password is invalid!"
                                    throw new Error("Login or password is invalid!")
                                }else{
                                    admin = false;
                                    user = false;
                                    block = false;
                                }
                            }
                        });
                    }

                    return login;
                }else{
                    // return "Authenticate data is required!"
                    throw new Error("Authenticate data is required!")
                }
            }else{
                // return "Login and password is required!"
                throw new Error("Login and password is required!")
            }
        }
    }
};