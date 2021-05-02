import mongoose from "mongoose";

export default interface IIntro extends mongoose.Document {
    gid: string;
    uid: string;
    key: string;
}
