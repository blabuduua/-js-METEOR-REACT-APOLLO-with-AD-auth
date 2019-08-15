import React, { Component } from 'react'

export default LogoutButton = () => {
    logoutUser = e => {
        e.preventDefault();

        Meteor.logout(error => {
            console.log('cb logout ' + error)
        });
    };

    return (
        <button onClick={ logoutUser }>Выход</button>
    )
}