import { ApolloServer, gql } from 'apollo-server-express'
import { WebApp } from 'meteor/webapp'
import { getUser } from 'meteor/apollo'

import UserSchema from '../../api/users/User.graphql'
import UserResolvers from '../../api/users/resolvers'

import ResolutionSchema from '../../api/resolutions/Resolution.graphql'
import ResolutionResolvers from '../../api/resolutions/resolvers'

// Ref4433

const typeDefs = [
    UserSchema,
    ResolutionSchema
];

const resolvers = {
    ResolutionSchema,
    ...UserResolvers
};

console.log(resolvers);

const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({ req }) => ({
        user: await getUser(req.headers.authorization)
    })
});

server.applyMiddleware({
    app: WebApp.connectHandlers,
    path: '/graphql'
});

WebApp.connectHandlers.use('/graphql', (req, res) => {
    if (req.method === 'GET') {
        res.end()
    }
});