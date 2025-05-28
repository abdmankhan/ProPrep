import mongoose from "mongoose";

const topicSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // e.g. 'Process Scheduling'
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    subjectName: { type: String, required: true }, // Store the subject name directly
  },
  { timestamps: true }
);

const Topic = mongoose.model("Topic", topicSchema);
export default Topic;
