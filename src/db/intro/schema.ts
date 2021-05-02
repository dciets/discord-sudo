import mongoose from "mongoose";

const schema = new mongoose.Schema({
  gid: {
    type: String,
    required: true,
  },
  uid: {
    type: String,
    required: true,
  },
  key: {
    type: String,
    required: true,
  },
});

schema.index({ gid: 1, key: 1 }, { unique: true });

export default schema;
