import mongoose from "mongoose";

import schema from "./schema";
import IAlias from "./interface";

export default mongoose.model<IAlias>("alias", schema);
