const express = require("express");
const cors = require("cors");
const puppeteer = require("puppeteer-core");
const chromium = require("chromium");
const cron = require("node-cron");
const { google } = require("googleapis");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Alarm = require("./models/Alarm");
const nodemailer = require("nodemailer");

// Load environment variables
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  console.log("Request Body:", req.body);
  next();
});

// MongoDB connection with error handling
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Mongoose deprecation warning fix
mongoose.set("strictQuery", false);

// Basic error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

// Email sending function without OAuth (temporary solution)
async function sendEmail(to, ticketInfo) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: to,
      subject: "Bilet Bulundu!",
      text: `Aradığınız bilet müsait: ${JSON.stringify(ticketInfo)}`,
    });
    console.log("Email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

// Web scraping function
async function scrapeTickets(from, to, date) {
  const browser = await puppeteer.launch({
    headless: "new",
    executablePath:
      process.env.PUPPETEER_EXECUTABLE_PATH || "/usr/bin/chromium",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
    ],
  });

  const page = await browser.newPage();
  let trainData = null;

  try {
    // Network isteğini dinlemeye başla
    await page.setRequestInterception(true);

    page.on("request", (request) => {
      request.continue();
    });

    page.on("response", async (response) => {
      if (response.url().includes("train-availability?environment=dev")) {
        try {
          const responseText = await response.text();
          console.log("Raw train data response:", responseText);
          trainData = JSON.parse(responseText);
        } catch (error) {
          console.error("Error parsing response:", error);
        }
      }
    });

    await page.setViewport({ width: 1280, height: 800 });

    console.log("Navigating to TCDD website...");
    await page.goto(
      "https://ebilet.tcddtasimacilik.gov.tr/view/eybis/tnmGenel/tcddWebContent.jsf",
      {
        waitUntil: "networkidle0",
        timeout: 60000,
      }
    );

    console.log("Starting form fill with:", { from, to, date });

    // Tarih formatını YYYY-MM-DD'ye çevir
    const [day, month, year] = date.split(".");
    const formattedDate = `${year}-${month}-${day}`;
    console.log("Date to select:", formattedDate);

    // Takvim ikonuna tıkla
    await page.waitForSelector(".form-control.calenderPurpleImg", {
      visible: true,
    });
    await page.click(".form-control.calenderPurpleImg");

    // Takvimin açılmasını bekle
    await page.waitForSelector(".daterangepicker", { visible: true });

    // İlgili tarihe sahip td'yi bul ve tıkla
    const dateSelector = `td[data-date="${formattedDate}"]`;
    await page.waitForSelector(dateSelector, { visible: true });
    await page.click(dateSelector);

    console.log("Date selected successfully");
    await page.screenshot({ path: "date.png" });

    // Form değerlerini kontrol et
    const formValues = await page.evaluate(() => ({
      from: document.querySelector("#fromTrainInput").value,
      to: document.querySelector("#toTrainInput").value,
      date: document.querySelector(".departureDate").value,
    }));

    console.log("Final form values:", formValues);

    // 1. Kalkış istasyonu işlemi
    await page.waitForSelector("#fromTrainInput", { visible: true });
    await page.click("#fromTrainInput");
    await page.type("#fromTrainInput", from, { delay: 100 });

    // Dropdown'ın yüklenmesini bekle
    await page.waitForSelector(".dropdown-item.station", {
      visible: true,
      timeout: 5000,
    });

    // İlk dropdown öğesine tıkla
    const fromStations = await page.$$(".dropdown-item.station");
    if (fromStations.length > 0) {
      await fromStations[0].click();
      console.log("Clicked first departure station option");
    } else {
      throw new Error("No departure stations found in dropdown");
    }
    await page.screenshot({ path: "11.png" });

    // Kısa bekleme
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // 2. Varış istasyonu işlemi
    await page.screenshot({ path: "12.png" });

    await page.waitForSelector("#toTrainInput", { visible: true });
    await page.click("#toTrainInput");
    await page.type("#toTrainInput", to, { delay: 100 });
    await page.screenshot({ path: "13.png" });

    // İlk dropdown öğesine tıkla
    await page.screenshot({ path: "1.png" });

    const toStations = await page.$$(".dropdown-item.station");
    if (toStations.length > 0) {
      await toStations[1].click();
      console.log("Clicked first arrival station option");
    } else {
      throw new Error("No arrival stations found in dropdown");
    }
    await page.screenshot({ path: "14.png" });

    // Arama butonuna tıkla ve response'u bekle
    await page.click("#searchSeferButton");

    // API yanıtının gelmesi için bekle
    await new Promise((resolve) => setTimeout(resolve, 5000));

    return {
      apiResponse: trainData,
    };
  } catch (error) {
    console.error("Error during scraping:", error);
    throw error;
  } finally {
    await browser.close();
  }
}

// Alarm creation endpoint
app.post("/create-alarm", async (req, res) => {
  const { userId, from, to, date, selectedTime, email } = req.body;

  try {
    const alarm = new Alarm({
      userId,
      from,
      to,
      date,
      selectedTime,
      email,
    });

    await alarm.save();
    res.json({ success: true, alarmId: alarm._id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Check alarms every 15 minutes
cron.schedule("*/15 * * * *", async () => {
  const activeAlarms = await Alarm.find({ isActive: true });

  for (const alarm of activeAlarms) {
    try {
      const tickets = await scrapeTickets(alarm.from, alarm.to, alarm.date);
      const availableTicket = tickets.find(
        (t) => t.time === alarm.selectedTime && parseInt(t.availableSeats) > 0
      );

      if (availableTicket) {
        await sendEmail(alarm.email, availableTicket);
        alarm.isActive = false;
        await alarm.save();
      }
    } catch (error) {
      console.error(`Alarm check failed for ${alarm._id}:`, error);
    }
  }
});

app.get("/scrape-tickets", async (req, res) => {
  const { from, to, date } = req.query;

  console.log("Received request with params:", { from, to, date });

  if (!from || !to || !date) {
    return res.status(400).json({
      error: "Missing required parameters",
      received: { from, to, date },
    });
  }

  try {
    const tickets = await scrapeTickets(from, to, date);

    if (!tickets || tickets.length === 0) {
      return res.status(404).json({
        error: "No tickets found",
        params: { from, to, date },
      });
    }

    res.json(tickets);
  } catch (error) {
    console.error("Error in /scrape-tickets endpoint:", error);
    res.status(500).json({
      error: error.message,
      details: error.toString(),
    });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
