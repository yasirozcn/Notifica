import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "remindernotifica@gmail.com",
    pass: process.env.EMAIL_PASSWORD_NODE,
  },
});
