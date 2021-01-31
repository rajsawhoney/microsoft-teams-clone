const mongoose = require("mongoose");
const featureSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  team: {
    type: String,
    required: true,
  },
  platForm: {
    type: String,
    required: true,
  },
  discProject: [
    {
      type: String,
      required: true,
    },
  ],
});
const Features = mongoose.model("Feature", featureSchema);
module.exports = Features;
