import React from 'react'

export default RegisterForm = (props) => {
    let login;
    let password;

    handleRegisterUser = e => {
        e.preventDefault();

        Accounts.createUser(
        {
            email: login.value + '@flyuia.com',
            password: password.value
        },
        error => {
            if(!error){
                props.client.resetStore();
            }
            console.log('cb register ' + error)
        });

        login.value = '';
        password.value = '';
    };

    return (
        <form onSubmit={ handleRegisterUser }>
            <input type="text" ref={ (input) => login = input } />
            <input type="password" ref={ (input) => password = input } />
            <button type="submit">Регистрация</button>
        </form>
    )
}