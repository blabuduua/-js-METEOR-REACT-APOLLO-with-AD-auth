import React from 'react'

export default LogoutButton = (props) => {
    handleLogoutUser = e => {
        e.preventDefault();

        Meteor.logout(error => {
            props.client.resetStore();
            console.log('cb logout ' + error)
        });
    };

    return (
        <button onClick={ handleLogoutUser }>Выход</button>
    )
}