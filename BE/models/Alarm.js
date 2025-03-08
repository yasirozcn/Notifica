const mongoose = require("mongoose");

const alarmSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  from: {
    type: String,
    default: "",
  },
  to: {
    type: String,
    default: "",
  },
  date: {
    type: String,
    default: "",
  },
  selectedTime: {
    type: String,
    default: "",
  },
  email: {
    type: String,
    required: true,
  },
  trainId: {
    type: String,
    default: "",
  },
  trainInfo: {
    departureTime: String,
    arrivalTime: String,
    minPrice: Number,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Alarm", alarmSchema);
