import mongoose from "mongoose";

import schema from "./schema";
import ISoundBoard from "./interface";

export default mongoose.model<ISoundBoard>("soundboard", schema);
