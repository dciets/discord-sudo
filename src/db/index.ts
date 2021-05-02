import mongoose from "mongoose";

import { sleep } from "../util";

export const init = () =>
  mongoose
    .connect(process.env.MONGO_DB || "mongodb://localhost:27017/dev", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      authSource: "admin",
    })
    .then(async () => {
      while (mongoose.connection.readyState !== 1) await sleep(10);
    });
