import { Mongo } from 'meteor/mongo'

const Authenticate = new Mongo.Collection('authenticate');

const authenticateData = Authenticate.find({}).fetch();

if(authenticateData.length === 0){
    console.log('data  required');
}else{
    console.log('data isset');
}

export default Authenticate;