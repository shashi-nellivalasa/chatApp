import mongoose from "mongoose";

const imageSchema = new mongoose.Schema({
  path: { type: String, required: true },
  fileName: { type: String, required: true },
});

const NewImage = mongoose.model("imagesx", imageSchema);
export default NewImage;
