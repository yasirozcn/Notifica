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
const debug = require("debug")("app:server");
const axios = require("axios");

// Load environment variables
dotenv.config();

const app = express();
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

// OPTIONS isteklerini handle et
app.options("*", cors());

// Request logging middleware
app.use((req, res, next) => {
  debug(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  debug("Headers:", req.headers);
  debug("Query:", req.query);
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
  let browser = null;

  try {
    browser = await puppeteer.launch({
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

    // Request interception'ı kaldır
    await page.setRequestInterception(false);

    // Response listener'ı değiştir
    page.on("response", async (response) => {
      const url = response.url();
      if (url.includes("train-availability")) {
        try {
          // response.text() yerine response.json() kullanalım
          trainData = await response.json().catch(() => null);
          if (trainData) {
            console.log("Train data captured successfully");
          }
        } catch (error) {
          console.error("Error parsing response:", error);
        }
      }
    });

    // Sayfayı yükle ve form işlemlerini yap
    await page.goto(
      "https://ebilet.tcddtasimacilik.gov.tr/view/eybis/tnmGenel/tcddWebContent.jsf",
      {
        waitUntil: "networkidle0",
        timeout: 60000,
      }
    );

    // Form doldurma işlemleri...
    await page.waitForSelector("#fromTrainInput");
    await page.type("#fromTrainInput", from);
    await page.waitForSelector(".dropdown-item.station");
    await page.click(".dropdown-item.station");

    await page.waitForSelector("#toTrainInput");
    await page.type("#toTrainInput", to);
    const stations = await page.$$(".dropdown-item.station");
    await stations[1].click();

    // Tarih seçimi
    const [day, month, year] = date.split(".");
    const formattedDate = `${year}-${month}-${day}`;

    await page.waitForSelector(".form-control.calenderPurpleImg");
    await page.click(".form-control.calenderPurpleImg");
    await page.waitForSelector(".daterangepicker");

    const dateSelector = `td[data-date="${formattedDate}"]`;
    await page.waitForSelector(dateSelector);
    await page.click(dateSelector);

    // Arama butonuna tıkla
    await page.click("#searchSeferButton");

    // Sonuçları bekle
    await new Promise((resolve) => setTimeout(resolve, 8000));

    // Veri kontrolü
    if (!trainData) {
      console.log("No train data received after search");
      return { apiResponse: null };
    }

    return { apiResponse: trainData };
  } catch (error) {
    console.error("Scraping error:", error);
    return { apiResponse: null, error: error.message };
  } finally {
    if (browser) {
      await browser.close();
    }
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
  debug("Received scrape-tickets request");
  const { from, to, date } = req.query;

  debug("Request parameters:", { from, to, date });

  if (!from || !to || !date) {
    console.log("Missing parameters in request");
    return res.status(400).json({
      error: "Missing required parameters",
      received: { from, to, date },
    });
  }

  try {
    console.log("Starting scraping process...");
    const result = await scrapeTickets(from, to, date);
    console.log("Scraping completed:", result ? "Success" : "No data");

    if (!result.apiResponse) {
      console.log("No tickets found");
      return res.status(404).json({
        error: result.error || "No tickets found",
        params: { from, to, date },
      });
    }

    console.log("Sending response to client");
    res.json(result);
  } catch (error) {
    console.error("Detailed error in /scrape-tickets:", {
      message: error.message,
      stack: error.stack,
      params: { from, to, date },
    });

    res.status(500).json({
      error: "Bilet arama işlemi sırasında bir hata oluştu",
      details: error.message,
    });
  }
});

// Vize randevusu kontrol fonksiyonu
async function checkVisaAppointment(country, city, visaType) {
  let browser = null;

  try {
    browser = await puppeteer.launch({
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

    // API tabanlı kontrol için
    await page.setRequestInterception(true);

    page.on("request", async (request) => {
      if (country === "Netherlands") {
        // VFS Global API endpoint'i
        const apiUrl =
          "https://appointment.vfsglobal.com/TUR/tr/NLD/api/appointments";

        const headers = {
          accept: "application/json",
          "accept-language": "tr-TR,tr;q=0.9",
          "content-type": "application/json",
          origin: "https://appointment.vfsglobal.com",
          referer: "https://appointment.vfsglobal.com/TUR/tr/NLD",
        };

        try {
          const response = await axios.get(apiUrl, { headers });
          return response.data;
        } catch (error) {
          console.error("API request failed:", error);
          return null;
        }
      } else if (country === "Germany") {
        // Alman konsolosluğu için özel endpoint
        const apiUrl =
          "https://service2.diplo.de/rktermin/extern/appointment_showMonth.do";
        const params = {
          locationCode: city,
          realmId: "543",
          categoryId: "375", // Vize tipi ID'si
        };

        try {
          const response = await axios.get(apiUrl, { params });
          return response.data;
        } catch (error) {
          console.error("API request failed:", error);
          return null;
        }
      }

      request.continue();
    });

    // Her ülke için özel kontrol mantığı
    let availableSlots = [];
    const today = new Date();

    // Gelecek 30 gün için kontrol
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() + i);

      const formattedDate = checkDate.toISOString().split("T")[0];

      switch (country) {
        case "Netherlands":
          try {
            const response = await page.evaluate(async (date) => {
              const res = await fetch(
                `https://appointment.vfsglobal.com/TUR/tr/NLD/api/slots?date=${date}`
              );
              return await res.json();
            }, formattedDate);

            if (response && response.slots && response.slots.length > 0) {
              availableSlots.push({
                date: formattedDate,
                slots: response.slots,
              });
            }
          } catch (error) {
            console.error(`Error checking date ${formattedDate}:`, error);
          }
          break;

        case "Germany":
          try {
            const slots = await page.evaluate((date) => {
              const availableDates = document.querySelectorAll(".buchbar");
              return Array.from(availableDates).map((date) =>
                date.getAttribute("data-date")
              );
            });

            if (slots.length > 0) {
              availableSlots.push({
                date: formattedDate,
                slots: slots,
              });
            }
          } catch (error) {
            console.error(`Error checking date ${formattedDate}:`, error);
          }
          break;

        default:
          // Test data
          if (Math.random() > 0.8) {
            // %20 olasılıkla randevu var
            availableSlots.push({
              date: formattedDate,
              slots: [`Test slot for ${formattedDate}`],
            });
          }
      }
    }

    return {
      success: true,
      country,
      city,
      visaType,
      availableSlots,
      message:
        availableSlots.length > 0
          ? `${availableSlots.length} günde randevu bulundu`
          : "Uygun randevu bulunamadı",
      details: availableSlots,
    };
  } catch (error) {
    console.error("Visa appointment check error:", error);
    return {
      success: false,
      error: error.message,
      country,
      city,
      visaType,
    };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Yeni endpoint
app.get("/check-visa-appointment", async (req, res) => {
  const { country, city, visaType } = req.query;

  if (!country || !city || !visaType) {
    return res.status(400).json({
      error: "Missing required parameters",
      received: { country, city, visaType },
    });
  }

  try {
    const result = await checkVisaAppointment(country, city, visaType);
    res.json(result);
  } catch (error) {
    console.error("Error in /check-visa-appointment:", error);
    res.status(500).json({
      error: "Randevu kontrolü sırasında bir hata oluştu",
      details: error.message,
    });
  }
});

// Vize randevusu alarm oluşturma endpoint'i
app.post("/create-visa-alarm", async (req, res) => {
  const { userId, country, city, visaType, email } = req.body;

  try {
    const alarm = new Alarm({
      userId,
      type: "visa",
      country,
      city,
      visaType,
      email,
      isActive: true,
    });

    await alarm.save();
    res.json({ success: true, alarmId: alarm._id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
