import React from 'react'
import { useQuery } from '@apollo/react-hooks';
import { gql } from "apollo-boost"

const MY_QUERY = gql`
{
    resolutions{
        _id
        name
    }
}
`;

const App = () => {
    const { loading, error, data } = useQuery(MY_QUERY);

    if (loading) return <span>&nbsp;</span>;
    if (error) return <span>Error :(</span>;

    return (
        <div>
            <ul>
                { data.resolutions.map(resolution => (
                    <li key={ resolution._id }>{ resolution.name }</li>
                )) }
            </ul>
        </div>
    )
};

export default App