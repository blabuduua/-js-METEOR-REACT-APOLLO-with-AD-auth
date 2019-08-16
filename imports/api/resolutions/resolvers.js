import Resolutions from './resolutions'

export default {
    Query: {
        resolutions(obj, data, { user }) {
            if(user){

                console.log(user._id);

                return Resolutions.find({
                    userId: user._id
                }).fetch();
            }

            return Resolutions.find({}).fetch();
        }
    },
    Mutation: {
        createResolution(obj, { name }, { user }) {
            const resolutionId = Resolutions.insert({
                name,
                userId: user._id
            });

            return Resolutions.findOne(resolutionId)
        }
    }
};