const mongoose = require("mongoose");

const readingSchema = new mongoose.Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    boatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Boat",
      required:true,
    },
    temp: {
      type: String,
      required: true,
    },
    turbidity: {
      type: String,
      required: true,
    },
    tds: {
      type: String,
      required: true,
    },
    count: {
      type: Number,
      required: true,
      default:1,
    },
    created: {
      type: String,
      required: true,
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Reading", readingSchema);
