const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const Story_schema = new Schema({
    user_name :String,
})
const Stories = mongoose.model('story' , Story_schema)
module.exports = Stories;