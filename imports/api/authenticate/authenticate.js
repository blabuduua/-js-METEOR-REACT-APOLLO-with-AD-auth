import { Mongo } from 'meteor/mongo'

const Authenticate = new Mongo.Collection('authenticate');

const authenticateData = Authenticate.find({}).fetch();

//12

if(authenticateData.length === 0){
    console.log('data  required');

    Authenticate.insert({
        company: "",
        url: "",
        baseDN: "",
        approvedDN: "",
        forbiddenDN: "",
        userGroupsNames: "",
        adminGroupsNames: "",
        blockGroupsNames: ""
    });
}else{
    console.log('data isset');
}

export default Authenticate;