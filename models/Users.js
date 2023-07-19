const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const User_schema = new Schema({
    username :String,
    
    password :String
})
const Users = mongoose.model('person' , User_schema)
module.exports = Users