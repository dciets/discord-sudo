import mongoose from "mongoose";

import schema from "./schema";
import IIntro from "./interface";

export default mongoose.model<IIntro>("intro", schema);
