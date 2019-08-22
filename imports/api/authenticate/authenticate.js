import { Mongo } from 'meteor/mongo'

const Authenticate = new Mongo.Collection('authenticate');

const authenticateData = Authenticate.find({}).fetch();

if(authenticateData.length === 0){
    console.log('data  required');


}else{
    console.log('data isset');

    Authenticate.update({ baseDN: "dc=flyuia,dc=com" }, {
        $set:{
            'adminGroupsNames': "gr_portal_Slave_Admin"
        }
    });
}

export default Authenticate;