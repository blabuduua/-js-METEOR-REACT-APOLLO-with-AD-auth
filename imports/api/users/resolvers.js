import Goals from "../goals/goals";
import Resolutions from "../resolutions/resolutions";
import Authenticate from "../authenticate/authenticate";

const ActiveDirectory = require('activedirectory2');

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
    },
    Mutation: {
        authenticate(obj, { login, password }) {
            /*console.log(login);*/

            const authenticateData = Authenticate.find({}).fetch();

            console.log(authenticateData);

            if(login && password){
                /*console.log(login);*/

                return login;
            }

            throw new Error("Login and password required!")
        }
    }
};