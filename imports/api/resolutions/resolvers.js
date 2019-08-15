import Resolutions from './resolutions'

export default {
    Query: {
        resolutions(obj, data, { user }) {
            console.log(user._id);

            return Resolutions.find({}).fetch();
        }
    },
    Mutation: {
        createResolution(obj, { name }, context) {
            const resolutionId = Resolutions.insert({
                name
            });

            return Resolutions.findOne(resolutionId)
        }
    }
};