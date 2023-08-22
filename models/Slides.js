const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const Slide_schema = new Schema({
    heading: String,
    description:String,
    image_url :String,
    categories:String,
    story_id :String,
    bookmarks:Boolean,
    likes :Number,
})
const Slides = mongoose.model('slide' , Slide_schema)
module.exports = Slides