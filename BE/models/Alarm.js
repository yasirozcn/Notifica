const mongoose = require("mongoose");

const alarmSchema = new mongoose.Schema({
  userId: String,
  from: String,
  to: String,
  date: String,
  selectedTime: String,
  email: String,
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Alarm", alarmSchema);
