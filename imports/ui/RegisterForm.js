import React, { Component } from 'react'

export default RegisterForm = () => {
    let login;
    let password;

    registerUser = e => {
        e.preventDefault();

        Accounts.createUser(
        {
            email: login.value + '@flyuia.com',
            password: password.value
        },
        error => {
            console.log('cb register ' + error)
        });

        login.value = '';
        password.value = '';
    };

    return (
        <form onSubmit={ registerUser }>
            <input type="text" ref={ (input) => login = input } />
            <input type="password" ref={ (input) => password = input } />
            <button type="submit">Регистрация</button>
        </form>
    )
}