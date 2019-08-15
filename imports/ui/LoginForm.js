import React, { Component } from 'react'

export default LoginForm = () => {
    let login;
    let password;

    loginUser = e => {
        e.preventDefault();

        Meteor.loginWithPassword(login.value + '@flyuia.com', password.value,
            error => {
                console.log('cb login ' +error)
            });

        login.value = '';
        password.value = '';
    };

    return (
        <form onSubmit={ loginUser }>
            <input type="text" ref={ (input) => login = input } />
            <input type="password" ref={ (input) => password = input } />
            <button type="submit">Авторизация</button>
        </form>
    )
}