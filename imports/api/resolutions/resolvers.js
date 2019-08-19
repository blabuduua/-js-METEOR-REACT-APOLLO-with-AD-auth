import Resolutions from './resolutions'
import Goals from '../goals/goals'

export default {
    Query: {
        resolutions(obj, data, { user }) {
            if(user){
                return Resolutions.find({
                    userId: user._id
                }).fetch();
            }

            return [];
        }
    },
    Resolution: {
        goals: resolution => Goals.find({resolutionId: resolution._id}).fetch() || [],
        completed: resolution => {
            const goals = Goals.find({
                resolutionId: resolution._id
            }).fetch();

            if(goals.length === 0) return false;

            const completedGoals = goals.filter(goal => goal.completed);

            return goals.length === completedGoals.length;
        }
    },
    Mutation: {
        createResolution(obj, { name }, { user }) {
            const resolutionId = Resolutions.insert({
                name,
                userId: user._id,
                completed: false
            });

            return Resolutions.findOne(resolutionId)
        }
    }
};