import React from 'react'
import { useQuery } from '@apollo/react-hooks'
import { gql } from "apollo-boost"

import ResolutionForm from './ResolutionForm'
import GoalForm from './GoalForm'
import RegisterForm from './RegisterForm'
import LoginForm from './LoginForm'
import LogoutButton from './LogoutButton'

const getResolutions = gql`
query Resolutions{
    user{
        _id
        resolutions {
            _id
            name
            completed
            goals {
                _id
                name
                completed
            }
        }
    }
}
`;

export default App = () => {
    const { loading, error, data, client } = useQuery(getResolutions);

    if (loading) return <span>&nbsp;</span>;
    if (error) return <span>Error :(</span>;

    return (
        <div>
            { !data.user._id && <RegisterForm client={client} /> }

            { data.user._id ? (
                <div>
                    <LogoutButton client={ client } />
                    <ResolutionForm />
                    <ul>
                        { data.user.resolutions.map(resolution => (
                            <li key={ resolution._id }>
                                <span style= {{
                                    textDecoration: resolution.completed ? 'line-through' : 'none'
                                }}>
                                    { resolution.name }
                                </span>
                                <GoalForm resolutionId={ resolution._id } goals={ resolution.goals } />
                            </li>
                        ))}
                    </ul>
                </div>
                ) : (
                <div>
                    <LoginForm client={client} />
                </div>
            )}
        </div>
    )
};