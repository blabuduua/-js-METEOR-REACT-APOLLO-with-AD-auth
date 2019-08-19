import Goal from './goals'

export default {
    Mutation: {
        createGoal(obj, { name, resolutionId }, { user }) {
            const goalId = Goal.insert({
                userId: user._id,
                resolutionId,
                name,
                completed: false
            });

            return Goal.findOne(goalId)
        }
    }
};