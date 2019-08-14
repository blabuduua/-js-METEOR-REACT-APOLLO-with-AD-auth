import React from 'react'
import { useQuery } from '@apollo/react-hooks';
import { gql } from "apollo-boost"

const MY_QUERY = gql`
{
   hi
}
`;

const App = () => {
    const { loading, error, data } = useQuery(MY_QUERY);

    if (loading) return <span>&nbsp;</span>;
    if (error) return <span>Error :(</span>;

    return <h1>{ data.hi }</h1>
};

export default App