import Goals from "../goals/goals";
import Resolutions from "../resolutions/resolutions";
import Authenticate from "../authenticate/authenticate";

const ActiveDirectory = require('activedirectory2');

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

const checkPassUserAdminTrue = (user, admin, login, password) => {
    if(user === true && admin === true){
        // ДЛЯ НАЗНАЧЕНИЯ ДОСТУПА АДМИНА, ОБНОВЛЕНИЯ ИНФЫ И СОЗДАНИЯ НОВОГО АКК АДМИНА

        Accounts.createUser(
        {
            email: login + '@flyuia.com',
            password: password
        }, Meteor.bindEnvironment((error, result) => {
                console.log(result);
        }));

        return true;
    }

    return false;
};

const checkPassUserTrue = (user) => {
    if(user === true){

    }

    return true;
};

const checkPassAdminTrue = (admin) => {
    if(admin === true){

    }

    return true;
};

const checkAllPasses = (user, admin, block, login, password) => {
    if(checkPassBlockTrue(block)){
        return 1;
    }

    if(checkPassUserAdminBlockFalse(user, admin, block)){
        return 2;
    }

    if(checkPassUserAdminTrue(user, admin, login, password)){
        return 3;
    }
};

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

                    let admin_async = false;
                    let user_async = false;
                    let block_async = false;

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

                                                    admin_async = false;
                                                    user_async = false;
                                                    block_async = false;
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

                                                admin_async = false;
                                                user_async = false;
                                                block_async = false;
                                            }
                                        });
                                    }
                                }

    // =======================================================================================================

                                if(exploaded_userGroupsNames === '' && exploaded_adminGroupsNames === '' && exploaded_blockGroupsNames === ''){
                                    throw new Error("Authenticate data is required, all groups is empty!")
                                }

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

                                                user = isMember;
                                                user_async = true;

                                                console.log(login + "@flyuia.com" + ' isMemberOf ' + exploaded_userGroupsNames[t] + ': ' + isMember);

                                                if(user_async === true && admin_async === true && block_async === true){
                                                    console.log('all async done!');

                                                    switch(checkAllPasses(user, admin, block, login, password)) {
                                                        case 1:
                                                            if(authenticateDataLength === i){
                                                                // return "Block Group!"
                                                                throw new Error("Block Group!")
                                                            }else{
                                                                admin = false;
                                                                user = false;
                                                                block = false;

                                                                admin_async = false;
                                                                user_async = false;
                                                                block_async = false;
                                                            }
                                                            break;
                                                        case 2:
                                                            if(authenticateDataLength === i){
                                                                // return "All miss!"
                                                                throw new Error("All miss!")
                                                            }else{
                                                                admin = false;
                                                                user = false;
                                                                block = false;

                                                                admin_async = false;
                                                                user_async = false;
                                                                block_async = false;
                                                            }
                                                            break;
                                                        case 3:
                                                            // ALL OK, RETURN TO REACT
                                                            console.log('Auth DONE! Admin and User');
                                                            break;
                                                    }
                                                }
                                            });
                                        }
                                    }
                                }else{
                                    if(exploaded_userGroupsNames !== ''){

                                        console.log('string userGroup');

                                        ad.isUserMemberOf(login + "@flyuia.com", exploaded_userGroupsNames, function(err, isMember) {
                                            if (err) {
                                                console.log('ERROR: ' +JSON.stringify(err));
                                                return;
                                            }

                                            user = isMember;
                                            user_async = true;

                                            console.log(user + "@flyuia.com" + ' isMemberOf ' + exploaded_userGroupsNames + ': ' + isMember);

                                            if(user_async === true && admin_async === true && block_async === true){
                                                console.log('all async done!');

                                                switch(checkAllPasses(user, admin, block, login, password)) {
                                                    case 1:
                                                        if(authenticateDataLength === i){
                                                            // return "Block Group!"
                                                            throw new Error("Block Group!")
                                                        }else{
                                                            admin = false;
                                                            user = false;
                                                            block = false;

                                                            admin_async = false;
                                                            user_async = false;
                                                            block_async = false;
                                                        }
                                                        break;
                                                    case 2:
                                                        if(authenticateDataLength === i){
                                                            // return "All miss!"
                                                            throw new Error("All miss!")
                                                        }else{
                                                            admin = false;
                                                            user = false;
                                                            block = false;

                                                            admin_async = false;
                                                            user_async = false;
                                                            block_async = false;
                                                        }
                                                        break;
                                                    case 3:
                                                        // ALL OK, RETURN TO REACT
                                                        console.log('Auth DONE! Admin and User');
                                                        break;
                                                }
                                            }
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

                                                admin = isMember;
                                                admin_async = true;

                                                console.log(login + "@flyuia.com" + ' isMemberOf ' + exploaded_adminGroupsNames[r] + ': ' + isMember);

                                                if(user_async === true && admin_async === true && block_async === true){
                                                    console.log('all async done!');

                                                    switch(checkAllPasses(user, admin, block, login, password)) {
                                                        case 1:
                                                            if(authenticateDataLength === i){
                                                                // return "Block Group!"
                                                                throw new Error("Block Group!")
                                                            }else{
                                                                admin = false;
                                                                user = false;
                                                                block = false;

                                                                admin_async = false;
                                                                user_async = false;
                                                                block_async = false;
                                                            }
                                                            break;
                                                        case 2:
                                                            if(authenticateDataLength === i){
                                                                // return "All miss!"
                                                                throw new Error("All miss!")
                                                            }else{
                                                                admin = false;
                                                                user = false;
                                                                block = false;

                                                                admin_async = false;
                                                                user_async = false;
                                                                block_async = false;
                                                            }
                                                            break;
                                                        case 3:
                                                            // ALL OK, RETURN TO REACT
                                                            console.log('Auth DONE! Admin and User');
                                                            break;
                                                    }
                                                }
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

                                            admin = isMember;
                                            admin_async = true;

                                            console.log(login + "@flyuia.com" + ' isMemberOf ' + exploaded_adminGroupsNames + ': ' + isMember);

                                            if(user_async === true && admin_async === true && block_async === true){
                                                console.log('all async done!');

                                                switch(checkAllPasses(user, admin, block, login, password)) {
                                                    case 1:
                                                        if(authenticateDataLength === i){
                                                            // return "Block Group!"
                                                            throw new Error("Block Group!")
                                                        }else{
                                                            admin = false;
                                                            user = false;
                                                            block = false;

                                                            admin_async = false;
                                                            user_async = false;
                                                            block_async = false;
                                                        }
                                                        break;
                                                    case 2:
                                                        if(authenticateDataLength === i){
                                                            // return "All miss!"
                                                            throw new Error("All miss!")
                                                        }else{
                                                            admin = false;
                                                            user = false;
                                                            block = false;

                                                            admin_async = false;
                                                            user_async = false;
                                                            block_async = false;
                                                        }
                                                        break;
                                                    case 3:
                                                        // ALL OK, RETURN TO REACT
                                                        console.log('Auth DONE! Admin and User');
                                                        break;
                                                }
                                            }
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

                                                block = isMember;
                                                block_async = true;

                                                console.log(login + "@flyuia.com" + ' isMemberOf ' + exploaded_blockGroupsNames[w] + ': ' + isMember);

                                                if(user_async === true && admin_async === true && block_async === true){
                                                    console.log('all async done!');

                                                    switch(checkAllPasses(user, admin, block, login, password)) {
                                                        case 1:
                                                            if(authenticateDataLength === i){
                                                                // return "Block Group!"
                                                                throw new Error("Block Group!")
                                                            }else{
                                                                admin = false;
                                                                user = false;
                                                                block = false;

                                                                admin_async = false;
                                                                user_async = false;
                                                                block_async = false;
                                                            }
                                                            break;
                                                        case 2:
                                                            if(authenticateDataLength === i){
                                                                // return "All miss!"
                                                                throw new Error("All miss!")
                                                            }else{
                                                                admin = false;
                                                                user = false;
                                                                block = false;

                                                                admin_async = false;
                                                                user_async = false;
                                                                block_async = false;
                                                            }
                                                            break;
                                                        case 3:
                                                            // ALL OK, RETURN TO REACT
                                                            console.log('Auth DONE! Admin and User');
                                                            break;
                                                    }
                                                }
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

                                            block = isMember;
                                            block_async = true;

                                            console.log(login + "@flyuia.com" + ' isMemberOf ' + exploaded_blockGroupsNames + ': ' + isMember);

                                            if(user_async === true && admin_async === true && block_async === true){
                                                console.log('all async done!');

                                                switch(checkAllPasses(user, admin, block, login, password)) {
                                                    case 1:
                                                        if(authenticateDataLength === i){
                                                            // return "Block Group!"
                                                            throw new Error("Block Group!")
                                                        }else{
                                                            admin = false;
                                                            user = false;
                                                            block = false;

                                                            admin_async = false;
                                                            user_async = false;
                                                            block_async = false;
                                                        }
                                                        break;
                                                    case 2:
                                                        if(authenticateDataLength === i){
                                                            // return "All miss!"
                                                            throw new Error("All miss!")
                                                        }else{
                                                            admin = false;
                                                            user = false;
                                                            block = false;

                                                            admin_async = false;
                                                            user_async = false;
                                                            block_async = false;
                                                        }
                                                        break;
                                                    case 3:
                                                        // ALL OK, RETURN TO REACT
                                                        console.log('Auth DONE! Admin and User');
                                                        break;
                                                }
                                            }
                                        });
                                    }
                                }

    // =======================================================================================================

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

                                    admin_async = false;
                                    user_async = false;
                                    block_async = false;
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