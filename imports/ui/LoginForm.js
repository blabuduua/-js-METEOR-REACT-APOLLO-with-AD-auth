import React from 'react'
import { useMutation } from '@apollo/react-hooks'
import { gql } from "apollo-boost"

const authenticate = gql`
    mutation authenticate($login: String!, $password: String!){
        authenticate(login: $login, password: $password)
    }
`;

export default LoginForm = (props) => {
    let login;
    let password;

    const [authenticateFunction] = useMutation(authenticate);

    handleLoginUser = e => {
        e.preventDefault();

        console.log(login.value);

        authenticateFunction({
           variables: {
               login: login.value + "@flyuia.com",
               password: password.value
            }
        })
            .then(({ data }) => {

            if(data.authenticate !== '1' && data.authenticate !== '11' && data.authenticate !== '111' && data.authenticate !== '1111' && data.authenticate !== '11111'){
                const obj = JSON.parse(data.authenticate);

                if(obj.access === 3 || obj.access === 4){
                    Accounts.createUser(
                        {
                            username: obj.login,
                            password: obj.password,
                            email: obj.login,
                            profile: {
                                employeeID: obj.employeeID,
                                displayName: obj.displayName,
                                email: obj.mail,
                                admin: 1,
                                user: 1
                            }
                        },
                        error => {
                            if(!error){
                                props.client.resetStore();
                            }else{
                                console.log('cb register ' + error);

                                Meteor.loginWithPassword(obj.login, obj.password,
                                    error => {
                                        if(!error){
                                            const userId = Meteor.userId();

                                            // ОБНОВЛЯЕМ ИНФУ ЮЗЕРА
                                            Meteor.users.update({ _id: userId }, {
                                                $set:{
                                                    'profile': {
                                                        employeeID: obj.employeeID,
                                                        displayName: obj.displayName,
                                                        email: obj.mail,
                                                        admin: 1,
                                                        user: 1
                                                    }
                                                }
                                            });

                                            props.client.resetStore();
                                        }else{
                                            // ОБНОВИТЬ ПАРОЛЬ И ПОВТОРИТЬ ПОПЫТКУ ВХОДА
                                            
                                        }
                                        console.log('cb login ' +error)
                                    });
                            }
                        });
                }
                else if (obj.access === 5){
                    Accounts.createUser(
                        {
                            username: obj.login,
                            password: obj.password,
                            email: obj.login,
                            profile: {
                                employeeID: obj.employeeID,
                                displayName: obj.displayName,
                                email: obj.mail,
                                admin: 0,
                                user: 1
                            }
                        },
                        error => {
                            if(!error){
                                props.client.resetStore();
                            }else{
                                console.log('cb register ' + error);

                                // НАЗНАЧАЕМ ДОСТУПЫ МЕТЕОР
                                Meteor.loginWithPassword(obj.login, obj.password,
                                    error => {
                                        if(!error){
                                            const userId = Meteor.userId();

                                            // ОБНОВЛЯЕМ ИНФУ ЮЗЕРА
                                            Meteor.users.update({ _id: userId }, {
                                                $set:{
                                                    'profile': {
                                                        employeeID: obj.employeeID,
                                                        displayName: obj.displayName,
                                                        email: obj.mail,
                                                        admin: 0,
                                                        user: 1
                                                    }
                                                }
                                            });

                                            props.client.resetStore();
                                        }else{
                                            // ОБНОВИТЬ ПАРОЛЬ И ПОВТОРИТЬ ПОПЫТКУ ВХОДА

                                        }
                                        console.log('cb login ' +error)
                                    });
                            }
                        });
                }
            }else{
                // ПОКАЗАТЬ СООТВЕТСВУЮЩУЮ ОШИБКУ
                console.log(data.authenticate);
            }
        })
            .catch(error => {
            console.log(error);
            // Unauthorized error.message for form validation and API control
        });
    };

    return (
        <form onSubmit={ handleLoginUser }>
            <input type="text" ref={ (input) => login = input } />
            <input type="password" ref={ (input) => password = input } />
            <button type="submit">Авторизация</button>
        </form>
    )
}