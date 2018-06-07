const mongoose = require('mongoose');

const pageTabSchema = new mongoose.Schema({
  fbUserId: {
    required: true,
    type: String,
    index: true,
  },
  name: {
    type: String,
    maxlength: 128,
    index: true,
    trim: true,
  },
  url: {
    type: String,
    unique: false,
    trim: true,
  },
  fbPageId: {
    type: String,
    index: true,
  },
  fbImageUrl: {
    type: String,
  },
  position: {
    type: String,
  },
  fbPageAccessToken: {
    type: String,
  },
  fbAppId: {
    type: String,
  },
}, {
  timestamps: true,
});

pageTabSchema.statics = {
  get({
    fbPageId,
    fbUserId,
    id,
  }) {
    console.log('get page tab', fbPageId, fbUserId, id);
    const query = {};
    if(fbPageId) query.fbPageId = fbPageId;
    if(fbUserId) query.fbUserId = fbUserId;
    if(id) query.id = id;

    return this.find(query, { __v: false })
//    .sort({ createdAt: -1 })
//      .skip(perPage * (page - 1))
//      .limit(perPage)
    .exec();
  }
}

module.exports = mongoose.model('PageTab', pageTabSchema);
