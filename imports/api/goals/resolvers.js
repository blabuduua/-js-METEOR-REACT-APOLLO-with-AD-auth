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
        },
        toggleGoal(obj, { goalId }) {
            const goal = Goal.findOne(goalId);

            Goal.update(goalId, {
                $set: {
                    completed: !goal.completed
                }
            });

            return Goal.findOne(goalId)
        },
    }
};