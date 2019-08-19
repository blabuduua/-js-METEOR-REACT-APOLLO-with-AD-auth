import Goals from "../goals/goals";
import Resolutions from "../resolutions/resolutions";

export default {
    Query: {
        user(obj, args, { user }) {
            return user || {};
        }
    },
    User: {
        email: user => user.emails[0].address,
        resolutions: user => Resolutions.find({userId: user._id}).fetch(),
        goals: user => Goals.find({userId: user._id}).fetch()
    }
};