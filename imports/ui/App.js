import React from 'react'
import { useQuery } from '@apollo/react-hooks'
import { gql } from "apollo-boost"

import ResolutionForm from './ResolutionForm'
import RegisterForm from './RegisterForm'
import LoginForm from './LoginForm'
import LogoutButton from './LogoutButton'

const getResolutions = gql`
query Resolutions{
    resolutions{
        _id
        name
    }
}
`;

export default App = () => {
    const { loading, error, data, client } = useQuery(getResolutions);

    if (loading) return <span>&nbsp;</span>;
    if (error) return <span>Error :(</span>;

    return (
        <div>
            <LogoutButton client={ client } />
            <RegisterForm client={ client } />
            <LoginForm client={ client } />
            <ResolutionForm />
            <ul>
                { data.resolutions.map(resolution => (
                    <li key={ resolution._id }>{ resolution.name }</li>
                )) }
            </ul>
        </div>
    )
};