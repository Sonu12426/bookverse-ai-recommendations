const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
  isbn: {
    type: String,
    unique: true,
  },
  genre: [String],
  description: String,
  publishedYear: Number,
  coverImage: String,
  averageRating: {
    type: Number,
    default: 0,
  },
  ratingsCount: {
    type: Number,
    default: 0,
  },
  features: {
    // ML features for recommendation
    genreVector: [Number],
    popularityScore: Number,
    textFeatures: [Number],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Book', BookSchema);