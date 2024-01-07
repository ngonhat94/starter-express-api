const mongoose = require('mongoose');

const { Schema } = mongoose;

const storySchema = new Schema({
  categories: [String],
  title: String,
  author: String,
  thumb: String,
  full: Boolean,
  chapter_count: Number,
  created: Number,
  updated: Number,
  view_count: Number,
  like_count: Number,
  review_count: Number,
  star: Number,
  score: Number,
  description: String,
  _id: String
})
const story = mongoose.model('Story', storySchema)

const chapterSchema = new Schema({
  title: String,
  number: Number,
  published: Boolean,
  updated: Number,
  content: String,
  story_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Story' },
  _id: String
})
chapterSchema.index({ story_id: 1 })
const chapter = mongoose.model('Chapter', chapterSchema)

module.exports = {story, chapter}