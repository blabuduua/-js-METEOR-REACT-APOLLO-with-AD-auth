import Goals from "../goals/goals";
import Resolutions from "../resolutions/resolutions";
import Authenticate from "../authenticate/authenticate";

const AD = require('activedirectory2').promiseWrapper;

import { Roles } from 'meteor/alanning:roles'

// ДЛЯ ПРОВЕРКИ КАКИЕ УРОВНИ ДОСТУПА БЫЛИ ПРОЙДЕНЫ
const checkPassBlockTrue = (block) => {
    if(block === true){
        console.log('Authentication failed! block === true');
        return true;
    }
    return false;
};

const checkPassUserAdminBlockFalse = (user, admin, block) => {
    if(user === false && admin === false && block === false){
        console.log('Authentication failed! user === false && admin === false && block === false');
        return true;
    }
    return false;
};

const checkPassUserAdminTrue = (user, admin) => {
    if(user === true && admin === true){
        console.log('Authentication DONE! user === true && admin === true');
        return true;
    }
    return false;
};

const checkPassAdminTrue = (admin) => {
    if(admin === true){
        console.log('Authentication DONE! admin === true');
        return true;
    }
    return false;
};

const checkPassUserTrue = (user) => {
    if(user === true){
        console.log('Authentication DONE! user === true');
        return true;
    }
    return false;
};

const checkAllPasses = (user, admin, block) => {
    if(checkPassBlockTrue(block)){
        return 1;
    }
    if(checkPassUserAdminBlockFalse(user, admin, block)){
        return 2;
    }
    if(checkPassUserAdminTrue(user, admin)){
        return 3;
    }
    if(checkPassAdminTrue(admin)){
        return 4;
    }
    if(checkPassUserTrue(user)){
        return 5;
    }
};

const totalCheck = (user, admin, block, authenticateDataLength, i, ad, login, password) => {
    switch(checkAllPasses(user, admin, block)) {
        case 1:
            if(authenticateDataLength === i){
                return "1" // Block Group!
            }
            break;
        case 2:
            if(authenticateDataLength === i){
                return "11" // All miss!
            }
            break;
        case 3:
            return ad.findUser(login).then((user) => {
                if (! user) {
                    console.log('User: ' + login + ' not found.');
                }else{
                    user.login = login;
                    user.password = password;
                    user.access = 3;
                    return JSON.stringify(user);
                }
            }).catch(() => {
                console.log('Error in find user query, ADMIN & USER');
            });
            break;
        case 4:
            return ad.findUser(login).then((user) => {
                if (! user) {
                    console.log('User: ' + login + ' not found.');
                }else{
                    user.login = login;
                    user.password = password;
                    user.access = 4;
                    return JSON.stringify(user);
                }
            }).catch(() => {
                console.log('Error in find user query, ADMIN');
            });
            break;
        case 5:
            return ad.findUser(login).then((user) => {
                if (! user) {
                    console.log('User: ' + login + ' not found.');
                }else{
                    user.login = login;
                    user.password = password;
                    user.access = 5;
                    return JSON.stringify(user);
                }
            }).catch(() => {
                console.log('Error in find user query, USER');
            });
            break;
    }
};

export default {
    Query: {
        user(obj, args, { user }) {
            if(user){
                if(user.profile.admin === 1){
                    Roles.removeUsersFromRoles(user._id, 'user');
                    Roles.addUsersToRoles(user._id, 'super-admin')
                }
                else if(user.profile.user === 1) {
                    Roles.removeUsersFromRoles(user._id, 'super-admin');
                    Roles.addUsersToRoles(user._id, 'user')
                }
            }

            return user || {};
        }
    },
    User: {
        email: user => user.emails[0].address,
        resolutions: user => Resolutions.find({userId: user._id}).fetch(),
        goals: user => Goals.find({userId: user._id}).fetch()
    },
    Mutation: {
        async authenticate(obj, { login, password }) {
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

                    for (let i = 1, pp = 0; i <= authenticateDataLength; i++, pp++) {

                        // УРЛ
                        const url = authenticateData[pp].url;

                        // ПАПКИ
                        const baseDN = authenticateData[pp].baseDN;
                        const forbiddenDN = authenticateData[pp].forbiddenDN;

                        // ГРУППЫ
                        const userGroupsNames = authenticateData[pp].userGroupsNames;
                        const adminGroupsNames = authenticateData[pp].adminGroupsNames;
                        const blockGroupsNames = authenticateData[pp].blockGroupsNames;

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
                            username: login,
                            password: password,
                            attributes: {
                                user: [ 'mail', 'employeeID' , 'displayName' ]
                            }
                        };

                        const ad = new AD(config);

                        return await ad.authenticate(login, password).then((auth) => {
                            if(auth) {
                                console.log('Authenticated!');

                                // ДЛЯ ПОИСКА ПОЛЬЗОВАТЕЛЯ В УВОЛЕННЫХ
                                if(Array.isArray(exploaded_forbiddenDN)){
                                    console.log('exploaded_forbiddenDN array!');

                                    let exploaded_forbiddenDNLength = exploaded_forbiddenDN.length;

                                    for (let u = 0; u < exploaded_forbiddenDNLength; u++) {
                                        if(exploaded_forbiddenDN[u] !== ''){
                                            const forbidden_config = {
                                                url: url,
                                                baseDN: exploaded_forbiddenDN[u],
                                                username: login,
                                                password: password
                                            };

                                            const forbidden_ad = new AD(forbidden_config);

                                            return forbidden_ad.authenticate(login, password).then((auth) => {
                                                if (auth) {
                                                    console.log('Authenticated exploaded_forbiddenDN!');

                                                    if(authenticateDataLength === i){
                                                        return "111"
                                                    }
                                                }else{
                                                    console.log('Authentication failed exploaded_forbiddenDN!');

                                                    admin = false;
                                                    user = false;
                                                    block = false;
                                                }
                                            }).catch(() => {
                                                console.log('Authentication failed exploaded_forbiddenDN!');

                                                admin = false;
                                                user = false;
                                                block = false;
                                            });
                                        }
                                    }
                                }
                                else if(exploaded_forbiddenDN !== ''){
                                    console.log('exploaded_forbiddenDN string or empty!');

                                    if(exploaded_forbiddenDN !== ''){
                                        const forbidden_config = {
                                            url: url,
                                            baseDN: exploaded_forbiddenDN,
                                            username: login,
                                            password: password
                                        };

                                        const forbidden_ad = new AD(forbidden_config);

                                        return forbidden_ad.authenticate(login, password).then((auth) => {
                                            if (auth) {
                                                console.log('Authenticated exploaded_forbiddenDN!');

                                                if(authenticateDataLength === i){
                                                    return "111" // AUTH IS BLOCKED
                                                }
                                            }else{
                                                console.log('Authentication failed exploaded_forbiddenDN!');

                                                admin = false;
                                                user = false;
                                                block = false;
                                            }
                                        }).catch((error) => {
                                            console.log('Authentication failed exploaded_forbiddenDN! ' + error);

                                            admin = false;
                                            user = false;
                                            block = false;
                                        });
                                    }
                                }

                                // ДЛЯ ПРОВЕРКИ НАЛИЧИЯ ГРУПП
                                if(exploaded_userGroupsNames === '' && exploaded_adminGroupsNames === '' && exploaded_blockGroupsNames === '' || exploaded_adminGroupsNames === ''){
                                    throw new Error("Authenticate data is required, all groups is empty! Or Admin Group is empty!")
                                }

// =========================================================================================================================================

                                // ДЛЯ БЫСТРОГО ОТБОЙНИКА ПРОВЕРЯЕМ КОНТР-ГРУППЫ
                                if(Array.isArray(exploaded_blockGroupsNames)){

                                    let exploaded_blockGroupsNamesLength = exploaded_blockGroupsNames.length;

                                    for (let w = 0; w < exploaded_blockGroupsNamesLength; w++) {

                                        console.log(exploaded_blockGroupsNames[w]);

                                        if(exploaded_blockGroupsNames[w] !== '' && block !== true){
                                            return ad.isUserMemberOf(login, exploaded_blockGroupsNames[w]).then((isMember) => {
                                                block = isMember;

                                                console.log(user + "@flyuia.com" + ' isMemberOf ' + exploaded_blockGroupsNames[w] + ': ' + isMember);

                                                // ДЛЯ БЫСТРОГО ПРОПУСКА АДМИНИСТРАТОРОВ ПРОВЕРЕМ ПРИНАДЛЕЖНОСТЬ К АДМИНИСТРАТОРАМ
                                                if(Array.isArray(exploaded_adminGroupsNames)){

                                                    let exploaded_adminGroupsNamesLength = exploaded_adminGroupsNames.length;

                                                    for (let r = 0; r < exploaded_adminGroupsNamesLength; r++) {

                                                        console.log(exploaded_adminGroupsNames[r]);

                                                        if(exploaded_adminGroupsNames[r] !== '' && admin !== true){
                                                            return ad.isUserMemberOf(login, exploaded_adminGroupsNames[r]).then((isMember) => {
                                                                admin = isMember;

                                                                console.log(user + "@flyuia.com" + ' isMemberOf ' + exploaded_adminGroupsNames[r] + ': ' + isMember);

                                                                // ДЛЯ БЫСТРОГО ПРОПУСКА ПОЛЬЗОВАТЕЛЕЙ ПРОВЕРЕМ ПРИНАДЛЕЖНОСТЬ К ПОЛЬЗОВАТЕЛЯМ
                                                                if(Array.isArray(exploaded_userGroupsNames)){

                                                                    let exploaded_userGroupsNamesLength = exploaded_userGroupsNames.length;

                                                                    for (let t = 0; t < exploaded_userGroupsNamesLength; t++) {
                                                                        if(exploaded_userGroupsNames[t] !== '' && user !== true){
                                                                            return ad.isUserMemberOf(login, exploaded_userGroupsNames[t]).then((isMember) => {
                                                                                user = isMember;

                                                                                console.log(user + "@flyuia.com" + ' isMemberOf ' + exploaded_userGroupsNames[t] + ': ' + isMember);

                                                                                return totalCheck(user, admin, block, authenticateDataLength, i, ad, login, password);
                                                                            }).catch((error) => {
                                                                                console.log('ERROR! ' + error);
                                                                            });
                                                                        }
                                                                    }
                                                                }else{
                                                                    if(exploaded_userGroupsNames !== '' && user !== true){

                                                                        console.log('string userGroup');

                                                                        return ad.isUserMemberOf(login, exploaded_userGroupsNames).then((isMember) => {
                                                                            user = isMember;

                                                                            console.log(user + "@flyuia.com" + ' isMemberOf ' + exploaded_userGroupsNames + ': ' + isMember);

                                                                            return totalCheck(user, admin, block, authenticateDataLength, i, ad, login, password);
                                                                        }).catch((error) => {
                                                                            console.log('ERROR! ' + error);
                                                                        });
                                                                    }
                                                                }
                                                            }).catch((error) => {
                                                                console.log('ERROR! ' + error);
                                                            });
                                                        }
                                                    }
                                                }else{
                                                    if(exploaded_adminGroupsNames !== '' && admin !== true){
                                                        console.log('string adminGroup');

                                                        return ad.isUserMemberOf(login, exploaded_adminGroupsNames).then((isMember) => {
                                                            admin = isMember;

                                                            console.log(user + "@flyuia.com" + ' isMemberOf ' + exploaded_adminGroupsNames + ': ' + isMember);

                                                            // ДЛЯ БЫСТРОГО ПРОПУСКА ПОЛЬЗОВАТЕЛЕЙ ПРОВЕРЕМ ПРИНАДЛЕЖНОСТЬ К ПОЛЬЗОВАТЕЛЯМ
                                                            if(Array.isArray(exploaded_userGroupsNames)){

                                                                let exploaded_userGroupsNamesLength = exploaded_userGroupsNames.length;

                                                                for (let t = 0; t < exploaded_userGroupsNamesLength; t++) {
                                                                    if(exploaded_userGroupsNames[t] !== '' && user !== true){
                                                                        return ad.isUserMemberOf(login, exploaded_userGroupsNames[t]).then((isMember) => {
                                                                            user = isMember;

                                                                            console.log(user + "@flyuia.com" + ' isMemberOf ' + exploaded_userGroupsNames[t] + ': ' + isMember);

                                                                            return totalCheck(user, admin, block, authenticateDataLength, i, ad, login, password);
                                                                        }).catch((error) => {
                                                                            console.log('ERROR! ' + error);
                                                                        });
                                                                    }
                                                                }
                                                            }else{
                                                                if(exploaded_userGroupsNames !== '' && user !== true){

                                                                    console.log('string userGroup');

                                                                    return ad.isUserMemberOf(login, exploaded_userGroupsNames).then((isMember) => {
                                                                        user = isMember;

                                                                        console.log(user + "@flyuia.com" + ' isMemberOf ' + exploaded_userGroupsNames + ': ' + isMember);

                                                                        return totalCheck(user, admin, block, authenticateDataLength, i, ad, login, password);
                                                                    }).catch((error) => {
                                                                        console.log('ERROR! ' + error);
                                                                    });
                                                                }
                                                            }
                                                        }).catch((error) => {
                                                            console.log('ERROR! ' + error);
                                                        });
                                                    }
                                                }
                                            }).catch((error) => {
                                                console.log('ERROR! ' + error);
                                            });
                                        }
                                    }
                                }else{
                                    if(exploaded_blockGroupsNames !== ''){
                                        if(block !== true){
                                            console.log('string blockGroup');

                                            return ad.isUserMemberOf(login, exploaded_blockGroupsNames).then((isMember) => {
                                                block = isMember;

                                                console.log(user + "@flyuia.com" + ' isMemberOf ' + exploaded_blockGroupsNames + ': ' + isMember);

                                                // ДЛЯ БЫСТРОГО ПРОПУСКА АДМИНИСТРАТОРОВ ПРОВЕРЕМ ПРИНАДЛЕЖНОСТЬ К АДМИНИСТРАТОРАМ
                                                if(Array.isArray(exploaded_adminGroupsNames)){

                                                    let exploaded_adminGroupsNamesLength = exploaded_adminGroupsNames.length;

                                                    for (let r = 0; r < exploaded_adminGroupsNamesLength; r++) {

                                                        console.log(exploaded_adminGroupsNames[r]);
                                                        console.log(async);

                                                        if(exploaded_adminGroupsNames[r] !== '' && admin !== true){
                                                            return ad.isUserMemberOf(login, exploaded_adminGroupsNames[r]).then((isMember) => {
                                                                admin = isMember;

                                                                console.log(user + "@flyuia.com" + ' isMemberOf ' + exploaded_adminGroupsNames[r] + ': ' + isMember);

                                                                // ДЛЯ БЫСТРОГО ПРОПУСКА ПОЛЬЗОВАТЕЛЕЙ ПРОВЕРЕМ ПРИНАДЛЕЖНОСТЬ К ПОЛЬЗОВАТЕЛЯМ
                                                                if(Array.isArray(exploaded_userGroupsNames)){

                                                                    let exploaded_userGroupsNamesLength = exploaded_userGroupsNames.length;

                                                                    for (let t = 0; t < exploaded_userGroupsNamesLength; t++) {
                                                                        if(exploaded_userGroupsNames[t] !== '' && user !== true){
                                                                            return ad.isUserMemberOf(login, exploaded_userGroupsNames[t]).then((isMember) => {
                                                                                user = isMember;

                                                                                console.log(user + "@flyuia.com" + ' isMemberOf ' + exploaded_userGroupsNames[t] + ': ' + isMember);

                                                                                return totalCheck(user, admin, block, authenticateDataLength, i, ad, login, password);
                                                                            }).catch((error) => {
                                                                                console.log('ERROR! ' + error);
                                                                            });
                                                                        }
                                                                    }
                                                                }else{
                                                                    if(exploaded_userGroupsNames !== '' && user !== true){

                                                                        console.log('string userGroup');

                                                                        return ad.isUserMemberOf(login, exploaded_userGroupsNames).then((isMember) => {
                                                                            user = isMember;

                                                                            console.log(user + "@flyuia.com" + ' isMemberOf ' + exploaded_userGroupsNames + ': ' + isMember);

                                                                            return totalCheck(user, admin, block, authenticateDataLength, i, ad, login, password);
                                                                        }).catch((error) => {
                                                                            console.log('ERROR! ' + error);
                                                                        });
                                                                    }
                                                                }
                                                            }).catch((error) => {
                                                                console.log('ERROR! ' + error);
                                                            });
                                                        }
                                                    }
                                                }else{
                                                    if(exploaded_adminGroupsNames !== '' && admin !== true){
                                                        console.log('string adminGroup');

                                                        return ad.isUserMemberOf(login, exploaded_adminGroupsNames).then((isMember) => {
                                                            admin = isMember;

                                                            console.log(user + "@flyuia.com" + ' isMemberOf ' + exploaded_adminGroupsNames + ': ' + isMember);

                                                            // ДЛЯ БЫСТРОГО ПРОПУСКА ПОЛЬЗОВАТЕЛЕЙ ПРОВЕРЕМ ПРИНАДЛЕЖНОСТЬ К ПОЛЬЗОВАТЕЛЯМ
                                                            if(Array.isArray(exploaded_userGroupsNames)){

                                                                let exploaded_userGroupsNamesLength = exploaded_userGroupsNames.length;

                                                                for (let t = 0; t < exploaded_userGroupsNamesLength; t++) {
                                                                    if(exploaded_userGroupsNames[t] !== '' && user !== true){
                                                                        return ad.isUserMemberOf(login, exploaded_userGroupsNames[t]).then((isMember) => {
                                                                            user = isMember;

                                                                            console.log(user + "@flyuia.com" + ' isMemberOf ' + exploaded_userGroupsNames[t] + ': ' + isMember);

                                                                            return totalCheck(user, admin, block, authenticateDataLength, i, ad, login, password);
                                                                        }).catch((error) => {
                                                                            console.log('ERROR! ' + error);
                                                                        });
                                                                    }
                                                                }
                                                            }else{
                                                                if(exploaded_userGroupsNames !== '' && user !== true){

                                                                    console.log('string userGroup');

                                                                    return ad.isUserMemberOf(login, exploaded_userGroupsNames).then((isMember) => {
                                                                        user = isMember;

                                                                        console.log(user + "@flyuia.com" + ' isMemberOf ' + exploaded_userGroupsNames + ': ' + isMember);

                                                                        return totalCheck(user, admin, block, authenticateDataLength, i, ad, login, password);
                                                                    }).catch((error) => {
                                                                        console.log('ERROR! ' + error);
                                                                    });
                                                                }else{
                                                                    return totalCheck(user, admin, block, authenticateDataLength, i, ad, login, password);
                                                                }
                                                            }
                                                        }).catch((error) => {
                                                            console.log('ERROR! ' + error);
                                                        });
                                                    }
                                                }
                                            }).catch((error) => {
                                                console.log('ERROR! ' + error);
                                            });
                                        }
                                    }
                                    else{
                                        // ДЛЯ БЫСТРОГО ПРОПУСКА АДМИНИСТРАТОРОВ ПРОВЕРЕМ ПРИНАДЛЕЖНОСТЬ К АДМИНИСТРАТОРАМ
                                        if(Array.isArray(exploaded_adminGroupsNames)){

                                            let exploaded_adminGroupsNamesLength = exploaded_adminGroupsNames.length;

                                            for (let r = 0; r < exploaded_adminGroupsNamesLength; r++) {

                                                console.log(exploaded_adminGroupsNames[r]);
                                                console.log(async);

                                                if(exploaded_adminGroupsNames[r] !== '' && admin !== true){
                                                    return ad.isUserMemberOf(login, exploaded_adminGroupsNames[r]).then((isMember) => {
                                                        admin = isMember;

                                                        console.log(user + "@flyuia.com" + ' isMemberOf ' + exploaded_adminGroupsNames[r] + ': ' + isMember);

                                                        // ДЛЯ БЫСТРОГО ПРОПУСКА ПОЛЬЗОВАТЕЛЕЙ ПРОВЕРЕМ ПРИНАДЛЕЖНОСТЬ К ПОЛЬЗОВАТЕЛЯМ
                                                        if(Array.isArray(exploaded_userGroupsNames)){

                                                            let exploaded_userGroupsNamesLength = exploaded_userGroupsNames.length;

                                                            for (let t = 0; t < exploaded_userGroupsNamesLength; t++) {
                                                                if(exploaded_userGroupsNames[t] !== '' && user !== true){
                                                                    return ad.isUserMemberOf(login, exploaded_userGroupsNames[t]).then((isMember) => {
                                                                        user = isMember;

                                                                        console.log(user + "@flyuia.com" + ' isMemberOf ' + exploaded_userGroupsNames[t] + ': ' + isMember);

                                                                        return totalCheck(user, admin, block, authenticateDataLength, i, ad, login, password);
                                                                    }).catch((error) => {
                                                                        console.log('ERROR! ' + error);
                                                                    });
                                                                }
                                                            }
                                                        }else{
                                                            if(exploaded_userGroupsNames !== '' && user !== true){

                                                                console.log('string userGroup');

                                                                return ad.isUserMemberOf(login, exploaded_userGroupsNames).then((isMember) => {
                                                                    user = isMember;

                                                                    console.log(user + "@flyuia.com" + ' isMemberOf ' + exploaded_userGroupsNames + ': ' + isMember);

                                                                    return totalCheck(user, admin, block, authenticateDataLength, i, ad, login, password);
                                                                }).catch((error) => {
                                                                    console.log('ERROR! ' + error);
                                                                });
                                                            }
                                                        }
                                                    }).catch((error) => {
                                                        console.log('ERROR! ' + error);
                                                    });
                                                }
                                            }
                                        }else{
                                            if(exploaded_adminGroupsNames !== '' && admin !== true){
                                                console.log('string adminGroup');

                                                return ad.isUserMemberOf(login, exploaded_adminGroupsNames).then((isMember) => {
                                                    admin = isMember;

                                                    console.log(user + "@flyuia.com" + ' isMemberOf ' + exploaded_adminGroupsNames + ': ' + isMember);

                                                    // ДЛЯ БЫСТРОГО ПРОПУСКА ПОЛЬЗОВАТЕЛЕЙ ПРОВЕРЕМ ПРИНАДЛЕЖНОСТЬ К ПОЛЬЗОВАТЕЛЯМ
                                                    if(Array.isArray(exploaded_userGroupsNames)){

                                                        let exploaded_userGroupsNamesLength = exploaded_userGroupsNames.length;

                                                        for (let t = 0; t < exploaded_userGroupsNamesLength; t++) {
                                                            if(exploaded_userGroupsNames[t] !== '' && user !== true){
                                                                return ad.isUserMemberOf(login, exploaded_userGroupsNames[t]).then((isMember) => {
                                                                    user = isMember;

                                                                    console.log(user + "@flyuia.com" + ' isMemberOf ' + exploaded_userGroupsNames[t] + ': ' + isMember);

                                                                    return totalCheck(user, admin, block, authenticateDataLength, i, ad, login, password);
                                                                }).catch((error) => {
                                                                    console.log('ERROR! ' + error);
                                                                });
                                                            }
                                                        }
                                                    }else{
                                                        if(exploaded_userGroupsNames !== '' && user !== true){

                                                            console.log('string userGroup');

                                                            return ad.isUserMemberOf(login, exploaded_userGroupsNames).then((isMember) => {
                                                                user = isMember;

                                                                console.log(user + "@flyuia.com" + ' isMemberOf ' + exploaded_userGroupsNames + ': ' + isMember);

                                                                return totalCheck(user, admin, block, authenticateDataLength, i, ad, login, password);
                                                            }).catch((error) => {
                                                                console.log('ERROR! ' + error);
                                                            });
                                                        }else{
                                                            return totalCheck(user, admin, block, authenticateDataLength, i, ad, login, password);
                                                        }
                                                    }
                                                }).catch((error) => {
                                                    console.log('ERROR! ' + error);
                                                });
                                            }
                                        }
                                    }
                                }

// =========================================================================================================================================

                            }else{
                                console.log('Authentication failed!');

                                if(authenticateDataLength === i){
                                    return '11'; // AUTH IS FAILED / CLIENT PROBLEM
                                }else{
                                    admin = false;
                                    user = false;
                                    block = false;
                                }
                            }
                        }).catch((error) => {
                            console.log('Authentication failed! ' + error);

                            if(authenticateDataLength === i){
                                return '1'; // AUTH IS FAILED / SERVER OR CLIENT PROBLEM
                            }else{
                                admin = false;
                                user = false;
                                block = false;
                            }
                        });
                    }
                }else{
                    throw new Error("Authenticate data is required!")
                }
            }else{
                // throw new Error("Login and password is required!")
                return "11111"
            }
        }
    }
};