import React from 'react'
import { useQuery } from '@apollo/react-hooks';
import { gql } from "apollo-boost"

import ResolutionForm from './ResolutionForm'

const getResolutions = gql`
{
    resolutions{
        _id
        name
    }
}
`;

export default App = () => {
    const { loading, error, data, refetch } = useQuery(getResolutions);

    if (loading) return <span>&nbsp;</span>;
    if (error) return <span>Error :(</span>;

    return (
        <div>
            <ResolutionForm refetch={ refetch }/>
            <ul>
                { data.resolutions.map(resolution => (
                    <li key={ resolution._id }>{ resolution.name }</li>
                )) }
            </ul>
        </div>
    )
};