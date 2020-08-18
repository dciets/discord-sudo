import mongoose from "mongoose";

export default interface IAlias extends mongoose.Document {
    gid: string;
    uid: string;
    key: string;
    val: string;
}
