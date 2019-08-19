import React from 'react';
import { useMutation } from '@apollo/react-hooks';
import {gql} from "apollo-boost";

const toggleGoal = gql`
    mutation toggleGoal($goalId: String!){
        toggleGoal(goalId: $goalId){
            _id
        }
    }
`;

export default Goal = (props) => {

    const [toggleGoalFunction] = useMutation(toggleGoal);

    handleToggleGoal = e => {
        e.preventDefault();

        toggleGoalFunction({
            refetchQueries: [
                "Resolutions"
            ],
            variables: {
                goalId: props.goal._id,
            }
        }).then(({ data }) => {
            console.log(data);
        }).catch(error => {
            console.log(error);
        });
    };

    return (
        <li>
            <input
                type="checkbox"
                onChange={ handleToggleGoal }
                checked={ props.goal.completed }
            />

            { props.goal.name }
        </li>
    )
}