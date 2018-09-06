const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema(
  {
    title: {
      type: String
    },
    body: {
      type: String
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    url: {
      type: String
    },
    status: {
      type: String,
      enum: ['published', 'draft'],
      required: true,
      default: 'published'
    },
    commentCount: {
      type: Number,
      default: 0
    },
    uploads: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Upload'
      }
    ]
  },
  {
    timestamps: true
  }
);

schema.statics = {
  incCommentCount(postId) {
    return this.findByIdAndUpdate(postId, {
      $inc: { commentCount: 1 },
      new: true
    });
  }
};

schema.set('toJSON', {
  virtuals: true
});

module.exports = mongoose.model('Post', schema);
