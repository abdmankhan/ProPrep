import mongoose from "mongoose";

const UserTestSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  test_result_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "TestResult",
    required: true,
  },
  test_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Test",
    required: true,
  }, // for quick lookup
  added_at: { type: Date, default: Date.now },
});

export default mongoose.model("UserTest", UserTestSchema);
