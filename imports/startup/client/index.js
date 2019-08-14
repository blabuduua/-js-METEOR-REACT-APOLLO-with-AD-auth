import React from 'react'
import { Meteor } from 'meteor/meteor'
import { render } from 'react-dom'

import { Accounts } from 'meteor/accounts-base'
import ApolloClient from 'apollo-boost'

import { ApolloProvider } from '@apollo/react-hooks';

import App from '../../ui/App'

const client = new ApolloClient({
    uri: '/graphql',
    request: operation =>
        operation.setContext(() => ({
            headers: {
                authorization: Accounts._storedLoginToken()
            }
        }))
});

const ApolloApp = () => (
  <ApolloProvider client={client}>
        <App />
  </ApolloProvider>
);

Meteor.startup(() => {
    render(<ApolloApp />, document.getElementById('app'))
});