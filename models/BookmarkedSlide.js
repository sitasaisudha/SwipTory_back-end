const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const BookmarkedSlidesSchema = new Schema({
    userId: String,
    slideId: String,
  });
  const BookmarkedSlides = mongoose.model('BookmarkedSlides', BookmarkedSlidesSchema);

  module.exports = BookmarkedSlides;  