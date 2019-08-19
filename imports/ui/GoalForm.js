import React from 'react'
import { useMutation } from '@apollo/react-hooks';
import { gql } from "apollo-boost"

import Goal from "./resolutions/Goal";

const createGoal = gql`
mutation createGoal($name: String!, $resolutionId: String!){
    createGoal(name: $name, resolutionId: $resolutionId){
        _id
    }
}
`;

export default GoalForm = (props) => {
    let name;
    const [createGoalFunction] = useMutation(createGoal);

    handleGoalForm = e => {
        e.preventDefault();

        createGoalFunction({
            refetchQueries: [
                "Resolutions"
            ],
            variables: {
                name: name.value,
                resolutionId: props.resolutionId,
            }
        }).then(({ data }) => {
            console.log(data);
        }).catch(error => {
            console.log(error);
        });

        name.value = '';
    };

    return (
        <div>
            <form onSubmit={ handleGoalForm }>
                <input type="text" ref={ (input) => name = input } />
                <button type="submit">Добавить задачу</button>
            </form>
            <ul>
                { props.goals.map(goal => (
                    <Goal key={ goal._id } goal={ goal } />
                )) }
            </ul>
        </div>
    )
}