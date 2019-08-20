import React from 'react'
import { useMutation } from '@apollo/react-hooks';
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
               login: login.value,
               password: password.value
            }
        }).then(({ data }) => {
            console.log(data.authenticate);

            /*Meteor.loginWithPassword(login.value + '@flyuia.com', password.value,
                error => {
                    if(!error){
                        props.client.resetStore();
                    }
                    console.log('cb login ' +error)
                });*/
        }).catch(error => {
            console.log(error);
            // Unauthorized error.message for form validation and API control
        });

        login.value = '';
        password.value = '';
    };

    return (
        <form onSubmit={ handleLoginUser }>
            <input type="text" ref={ (input) => login = input } />
            <input type="password" ref={ (input) => password = input } />
            <button type="submit">Авторизация</button>
        </form>
    )
}