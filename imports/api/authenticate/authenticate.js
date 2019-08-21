import { Mongo } from 'meteor/mongo'

const Authenticate = new Mongo.Collection('authenticate');

const authenticateData = Authenticate.find({}).fetch();

if(authenticateData.length === 0){
    console.log('data  required');

    Authenticate.insert({
        url: "ldap://vsrvdc1-kbp.flyuia.com",
        baseDN: "dc=flyuia,dc=com",
        forbiddenDN: "",
        userGroupsNames: "gr_portal_Slave_User",
        adminGroupsNames: "gr_portal_Slave_Admin",
        blockGroupsNames: "GR_PortalPlanner_Admin"
    });
}else{
    console.log('data isset');
}

export default Authenticate;