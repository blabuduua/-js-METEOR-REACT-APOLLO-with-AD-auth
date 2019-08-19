import React from 'react';

export default Goal = (props) => {
    return (
        <li>
            <input type="checkbox" />
            { props.goal.name }
        </li>
    )
}