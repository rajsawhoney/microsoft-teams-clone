const mongoose = require("mongoose");
const releaseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  team: {
    type: String,
    required: true,
  },
  botName: {
    type: String,
    required: true,
  },
  phases: [
    {
      name: {
        type: String,
        required: true,
      },
      description: { type: String, required: true },
      posted_on: {
        type: Date,
        required: true,
      },
    },
  ],
});
const Releases = mongoose.model("Release", releaseSchema);
module.exports = Releases;
