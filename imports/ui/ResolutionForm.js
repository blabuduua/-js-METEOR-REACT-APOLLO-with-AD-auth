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

export default ResolutionForm = (props) => {
    let name;
    const [createResolutionFunction] = useMutation(createResolution);

    submitForm = () => {
        createResolutionFunction({
            refetchQueries: [
                "Resolutions"
            ],
            variables: {
                name: name.value
            }
        }).then(() => {
            /*props.refetch()*/
        }).catch(error => {
            console.log(error);
        });

        name.value = ''
    };

    return (
        <div>
            <input type="text" ref={ (input) => name = input } />
            <button onClick={ submitForm }>Отправить</button>
        </div>
    )
}