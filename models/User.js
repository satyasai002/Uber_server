const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    name: {
      type: String,
      required: true,
    },
    mobile: {
      type: String,
      req: true,
    },
    email: {
      type: String,
      req: true,
    },
    password: {
      type: String,
      req: true,
    },
    boatIds: { type: mongoose.Schema.Types.ObjectId, ref: "Boat" },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
