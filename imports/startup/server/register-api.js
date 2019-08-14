import { ApolloServer, gql } from 'apollo-server-express'
import { WebApp } from 'meteor/webapp'
import { getUser } from 'meteor/apollo'

import ResolutionsSchema from '../../api/resolutions/Resolutions.graphql'

const typeDefs = `
type Query {
    hi: String
}
`;

const resolvers = {
    Query: {
        hi() {
            return 'Matrix!'
        }
    }
};

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