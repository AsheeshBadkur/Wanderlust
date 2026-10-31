const mongoose = require("mongoose");
const passportLocalMongoose =
  require('passport-local-mongoose').default;

const userSchema = new mongoose.Schema({
  email: { type: String, required: true },
  role: {
    type: String,
    enum: ["user", "owner"],
    default: "user",
  },
});

userSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("User", userSchema);