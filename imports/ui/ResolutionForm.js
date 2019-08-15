import React, { Component } from 'react'
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

    addResolution = e => {
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
        });

        name.value = '';
    };

    return (
        <form onSubmit={ addResolution }>
            <input type="text" ref={ (input) => name = input } />
            <button type="submit">Добавить</button>
        </form>
    )
}