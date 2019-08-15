import React, { Component } from 'react'

export default LogoutButton = (props) => {
    logoutUser = e => {
        e.preventDefault();

        Meteor.logout(error => {
            props.client.resetStore();
            console.log('cb logout ' + error)
        });
    };

    return (
        <button onClick={ logoutUser }>Выход</button>
    )
}