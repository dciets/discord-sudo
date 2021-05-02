import mongoose from "mongoose";

export default interface ISoundBoard extends mongoose.Document {
  gid: string;
  uid: string;
  key: string;
  val: Buffer;
}
