import React from 'react'

import { useMutation } from '@apollo/react-hooks';
import { gql } from "apollo-boost"

const createResolution = gql`
mutation createResolution($name: String!){
    createResolution(name: $name){
        _id
    }
}
`;

export default ResolutionForm = () => {
    let name;
    const [createResolutionFunction] = useMutation(createResolution);

    handleAddResolution = e => {
        e.preventDefault();

        createResolutionFunction({
            refetchQueries: [
                "Resolutions"
            ],
            variables: {
                name: name.value
            }
        }).then(({ data }) => {
            /*console.log(data);*/
        }).catch(error => {
            console.log(error);
             // Unauthorized error.message for form validation and API control
        });

        name.value = '';
    };

    return (
        <form onSubmit={ handleAddResolution }>
            <input type="text" ref={ (input) => name = input } />
            <button type="submit">Добавить</button>
        </form>
    )
}
