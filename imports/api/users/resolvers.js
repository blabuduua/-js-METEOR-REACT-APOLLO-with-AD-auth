export default {
    Query: {
        user(obj, arg, { user }) {
            console.log('123');

            return '123';

            if(user){

                console.log(user._id);

                return user._id || {}
            }
        }
    }
};