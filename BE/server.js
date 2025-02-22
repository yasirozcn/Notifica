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
const createTicketNotificationEmail = require("./utils/email-template");
const FlightAlarm = require("./models/FlightAlarm");
const { createFlightAlarmEmail } = require("./utils/email-template");

// Load environment variables
dotenv.config();

const app = express();
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://your-frontend-production-url.com",
    ],
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

// Mongoose strictQuery configuration
mongoose.set("strictQuery", false);

// Basic error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

// Email sending function without OAuth (temporary solution)
async function sendEmail(to, emailContent) {
  console.log("Attempting to send ticket notification email to:", to);
  console.log("Email credentials:", {
    user: process.env.EMAIL_USER,
    pass: "****", // password gizli
  });

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD_NODE, // NODE versiyonunu kullan
    },
  });

  // Test email connection
  try {
    await transporter.verify();
    console.log("Email connection verified successfully");
  } catch (error) {
    console.error("Email connection verification failed:", error);
    throw error;
  }

  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: to,
      ...emailContent,
    });
    console.log("Email sent successfully:", info.response);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
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
      // Google Analytics isteklerini engelle
      if (request.url().includes("google-analytics.com")) {
        request.abort();
      } else {
        request.continue();
      }
    });

    // Response listener'ı
    page.on("response", async (response) => {
      const url = response.url();
      if (url.includes("train-availability?environment=dev")) {
        console.log("Train API Response intercepted");
        console.log("Status:", response.status());

        try {
          // Response'u text olarak al
          const responseText = await response.text();
          console.log("Raw response text:", responseText);

          if (responseText) {
            trainData = JSON.parse(responseText);
            console.log("Parsed train data:", trainData);
          }
        } catch (error) {
          if (!error.message.includes("Target closed")) {
            console.error("Error parsing response:", error);
          }
        }
      }
    });

    // Sayfaya gitmeden önce extra headers ekle
    await page.setExtraHTTPHeaders({
      "Accept-Language": "tr-TR,tr;q=0.9",
      Accept: "application/json, text/plain, */*",
      Connection: "keep-alive",
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
    });

    // User agent'ı ayarla
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );

    console.log("Navigating to TCDD website...");
    await page.goto(
      "https://ebilet.tcddtasimacilik.gov.tr/view/eybis/tnmGenel/tcddWebContent.jsf"
    );

    console.log("Waiting for form elements...");
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

    console.log("Clicking search button...");
    await page.click("#searchSeferButton");

    // vld-overlay'in kaybolmasını bekle
    console.log("Waiting for overlay to disappear...");
    await page.waitForFunction(
      () => {
        const overlay = document.querySelector(".vld-overlay");
        return overlay && window.getComputedStyle(overlay).display === "none";
      },
      { timeout: 60000 }
    );

    // API yanıtının gelmesi için yeterli süre bekle
    await new Promise((resolve) => setTimeout(resolve, 10000));

    if (!trainData) {
      console.log("No train data received");
      return { error: "Sefer bulunamadı veya veri alınamadı." };
    }

    return { apiResponse: trainData };
  } catch (error) {
    console.error("Error during scraping:", error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Alarm kurulduğunda bildirim gönderen fonksiyon
async function sendAlarmCreationEmail(to, alarmInfo) {
  console.log("Attempting to send alarm creation email to:", to);
  console.log("Email credentials:", {
    user: process.env.EMAIL_USER,
    pass: "****", // password gizli
  });

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD_NODE, // NODE versiyonunu kullan
    },
  });

  // Test email connection
  try {
    await transporter.verify();
    console.log("Email connection verified successfully");
  } catch (error) {
    console.error("Email connection verification failed:", error);
    throw error;
  }

  const emailContent = {
    subject: "🔔 Tren Bileti Alarmı Kuruldu",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background-color: #1a365d;
              color: white;
              padding: 20px;
              text-align: center;
              border-radius: 5px 5px 0 0;
            }
            .content {
              background-color: #f9fafb;
              padding: 20px;
              border: 1px solid #e5e7eb;
              border-radius: 0 0 5px 5px;
            }
            .ticket-info {
              background-color: white;
              padding: 15px;
              margin: 10px 0;
              border-radius: 5px;
              border: 1px solid #e5e7eb;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Tren Bileti Alarmı Kuruldu</h1>
            </div>
            <div class="content">
              <p>Merhaba,</p>
              <p>Aşağıdaki sefer için bilet alarmı başarıyla kuruldu:</p>
              
              <div class="ticket-info">
                <h3>Sefer Detayları:</h3>
                <p><strong>Kalkış:</strong> ${alarmInfo.from}</p>
                <p><strong>Varış:</strong> ${alarmInfo.to}</p>
                <p><strong>Tarih:</strong> ${alarmInfo.date}</p>
                <p><strong>Saat:</strong> ${alarmInfo.selectedTime}</p>
              </div>

              <p>Seçtiğiniz seferde boş koltuk bulunduğunda size haber vereceğiz.</p>
              <p>Her 15 dakikada bir kontrol yapılacak ve bilet bulunduğunda size bildirim gönderilecektir.</p>

              <p style="margin-top: 20px; font-size: 12px; color: #666;">
                Bu email otomatik olarak gönderilmiştir. Lütfen cevaplamayınız.
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: to,
      ...emailContent,
    });
    console.log("Alarm creation email sent successfully:", info.response);
    return info;
  } catch (error) {
    console.error("Error sending alarm creation email:", error);
    throw error;
  }
}

// Alarm creation endpoint
app.post("/create-alarm", async (req, res) => {
  const { userId, from, to, date, selectedTime, email } = req.body;

  try {
    console.log("Creating alarm with data:", {
      userId,
      from,
      to,
      date,
      selectedTime,
      email,
    });

    const alarm = new Alarm({
      userId,
      from,
      to,
      date,
      selectedTime,
      email,
    });

    await alarm.save();
    console.log("Alarm saved successfully:", alarm._id);

    // Alarm kurulduğunda bildirim gönder
    try {
      await sendAlarmCreationEmail(email, {
        from,
        to,
        date,
        selectedTime,
      });
      console.log("Alarm creation email sent successfully");
    } catch (emailError) {
      console.error("Failed to send alarm creation email:", emailError);
      // Email gönderimi başarısız olsa bile alarm kaydedildi, devam et
    }

    res.json({ success: true, alarmId: alarm._id });
  } catch (error) {
    console.error("Error in create-alarm endpoint:", error);
    res.status(500).json({ error: error.message });
  }
});

// Check alarms every 15 minutes
cron.schedule("*/15 * * * *", async () => {
  console.log("Checking active alarms...");
  try {
    const activeAlarms = await Alarm.find({ isActive: true });
    console.log(`Found ${activeAlarms.length} active alarms`);

    for (const alarm of activeAlarms) {
      try {
        // Alarm verilerinin kontrolü
        if (!alarm.from || !alarm.to || !alarm.date || !alarm.selectedTime) {
          console.error(`Invalid alarm data for ${alarm._id}:`, alarm);
          continue;
        }

        console.log(
          `Checking alarm ${alarm._id} for ${alarm.from} to ${alarm.to} at ${alarm.date}`
        );

        const result = await scrapeTickets(alarm.from, alarm.to, alarm.date);

        if (result.apiResponse) {
          const trainData = result.apiResponse;
          const availableTicket =
            trainData.trainLegs[0].trainAvailabilities.find((train) => {
              const totalAvailability = train.trains[0].cars.reduce(
                (total, car) => {
                  return total + (car.availabilities[0]?.availability || 0);
                },
                0
              );
              return (
                train.departureTime === alarm.selectedTime &&
                totalAvailability > 0
              );
            });

          if (availableTicket) {
            console.log(`Found available ticket for alarm ${alarm._id}`);
            const ticketInfo = {
              from: alarm.from,
              to: alarm.to,
              date: alarm.date,
              selectedTime: alarm.selectedTime,
              availableSeats: availableTicket.trains[0].cars.reduce(
                (total, car) => {
                  return total + (car.availabilities[0]?.availability || 0);
                },
                0
              ),
              price: availableTicket.minPrice,
            };

            await sendEmail(alarm.email, ticketInfo);
            alarm.isActive = false;
            await alarm.save();
            console.log(
              `Alarm ${alarm._id} deactivated after sending notification`
            );
          } else {
            console.log(`No available tickets found for alarm ${alarm._id}`);
          }
        }
      } catch (error) {
        console.error(`Alarm check failed for ${alarm._id}:`, error);
      }
    }
  } catch (error) {
    console.error("Error in cron job:", error);
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

// Uçak bileti arama endpoint'i
app.get("/search-flights", async (req, res) => {
  const { departure, arrival, date } = req.query;

  if (!departure || !arrival || !date) {
    return res.status(400).json({
      error: "Eksik parametreler",
      received: { departure, arrival, date },
    });
  }

  let browser;
  try {
    console.log("Tarayıcı başlatılıyor...");
    browser = await puppeteer.launch({
      headless: "new",
      executablePath:
        process.env.PUPPETEER_EXECUTABLE_PATH || "/usr/bin/chromium",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--window-size=1024,768",
        "--disable-web-security",
        "--disable-features=IsolateOrigins,site-per-process",
        "--allow-running-insecure-content",
        "--disable-blink-features=AutomationControlled",
        "--ignore-certificate-errors",
        "--ignore-certificate-errors-spki-list",
        "--enable-features=NetworkService",
      ],
      defaultViewport: {
        width: 1024,
        height: 768,
      },
    });

    const page = await browser.newPage();

    // Sayfa yüklenme stratejisini değiştir
    await page.setDefaultNavigationTimeout(90000); // 90 saniye
    await page.setDefaultTimeout(90000);

    // JavaScript'i devre dışı bırak ve tekrar etkinleştir
    await page.setJavaScriptEnabled(false);
    await page.setJavaScriptEnabled(true);

    // Extra headers ekle
    await page.setExtraHTTPHeaders({
      "Accept-Language": "en-US,en;q=0.9",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      "Accept-Encoding": "gzip, deflate, br",
      Connection: "keep-alive",
      "Upgrade-Insecure-Requests": "1",
      "Cache-Control": "max-age=0",
    });

    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );

    console.log("Enuygun.com'a gidiliyor...");

    // Sayfa yükleme stratejisini değiştir
    await page.goto("https://www.enuygun.com/ucak-bileti/", {
      waitUntil: ["networkidle0", "domcontentloaded"],
      timeout: 90000,
    });

    // Sayfanın tamamen yüklenmesini bekle
    await page.waitForFunction(() => document.readyState === "complete");
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Çerez popup kontrolü
    console.log("Çerez popup kontrolü yapılıyor...");
    try {
      await page.waitForSelector("#onetrust-button-group", { timeout: 5000 });
      console.log("Çerez popup'ı bulundu, kapatılıyor...");
      await page.click("#onetrust-accept-btn-handler");
      // Cookie tercihlerinin yüklenmesini bekle
      await page.evaluate(
        () => new Promise((resolve) => setTimeout(resolve, 500))
      );
      console.log("Çerez popup'ı kapatıldı");
    } catch (error) {
      console.log(
        "Çerez popup'ı bulunamadı veya işlem başarısız, devam ediliyor...",
        error.message
      );
    }

    // Kalkış havaalanı seçimi
    console.log("Kalkış havaalanı giriliyor:", departure);
    await page.waitForSelector(
      '[data-testid="endesign-flight-origin-autosuggestion-input"]'
    );
    // Önce inputa tıkla
    await page.click(
      '[data-testid="endesign-flight-origin-autosuggestion-input"]'
    );
    await page.evaluate(
      () => new Promise((resolve) => setTimeout(resolve, 500))
    );
    // Sonra değeri yaz
    await page.type(
      '[data-testid="endesign-flight-origin-autosuggestion-input"]',
      departure
    );
    // Enter yerine dropdown'dan seçim yap
    await page.waitForSelector(
      '[data-testid="endesign-flight-origin-autosuggestion-option-item-0"]',
      { timeout: 5000 }
    );
    await page.click(
      '[data-testid="endesign-flight-origin-autosuggestion-option-item-0"]'
    );

    // Varış havaalanı seçimi
    console.log("Varış havaalanı giriliyor:", arrival);
    await page.waitForSelector(
      '[data-testid="endesign-flight-destination-autosuggestion-input"]'
    );
    // Önce inputa tıkla
    await page.click(
      '[data-testid="endesign-flight-destination-autosuggestion-input"]'
    );
    await page.evaluate(
      () => new Promise((resolve) => setTimeout(resolve, 500))
    );
    // Sonra değeri yaz
    await page.type(
      '[data-testid="endesign-flight-destination-autosuggestion-input"]',
      arrival
    );

    // Enter yerine dropdown'dan seçim yap
    await page.waitForSelector(
      '[data-testid="endesign-flight-destination-autosuggestion-option-item-0"]',
      { timeout: 5000 }
    );
    await page.click(
      '[data-testid="endesign-flight-destination-autosuggestion-option-item-0"]'
    );
    // Tarih seçimi
    console.log("Tarih seçiliyor:", date);
    await page.waitForSelector(
      '[data-testid="enuygun-homepage-flight-departureDate-datepicker-popover-button"]',
      { timeout: 10000 }
    );
    await page.click(
      '[data-testid="enuygun-homepage-flight-departureDate-datepicker-popover-button"]'
    ); // Takvimin yüklenmesini bekle
    await page.evaluate(
      () => new Promise((resolve) => setTimeout(resolve, 1000))
    );

    // Frame kontrolü
    const frames = page.frames();
    const calendarFrame = frames.find(
      (frame) =>
        frame.url().includes("calendar") || frame.name().includes("calendar")
    );
    console.log("Tarih seçici bekleniyor...");
    try {
      // Önce takvimin görünür olmasını bekle
      await page.waitForSelector(
        '[data-testid="enuygun-homepage-flight-departureDate-datepicker-popover-panel"]',
        {
          visible: true,
          timeout: 5000,
        }
      ); // Tarihi seç
      const dateButton = await page.$(`button[title="${date}"]`);
      if (!dateButton) {
        console.log("Tarih bulunamadı, DOM içeriğini kontrol et");
        const html = await page.content();
        console.log("Sayfa içeriği:", html);
        throw new Error("Tarih butonu bulunamadı");
      }
      await dateButton.click();
      console.log("Tarih seçildi");
    } catch (error) {
      console.log("Alternatif tarih seçme yöntemi deneniyor...");

      // Alternatif yöntem: data-date attribute'u ile dene
      try {
        await page.waitForSelector(`[data-date="${date}"]`, { timeout: 5000 });
        await page.click(`[data-date="${date}"]`);
        console.log("Tarih alternatif yöntemle seçildi");
      } catch (dateError) {
        console.error("Tarih seçilemedi:", dateError);
        throw dateError;
      }
    }

    // Arama butonuna tıklama
    console.log("Arama başlatılıyor...");
    await page.waitForSelector(
      '[data-testid="enuygun-homepage-flight-submitButton"]'
    );
    await page.click('[data-testid="enuygun-homepage-flight-submitButton"]');

    try {
      console.log("Sonuçlar bekleniyor...");
      await page.waitForSelector(".flight-list-body", { timeout: 30000 });

      console.log("Uçuş bilgileri toplanıyor...");
      const flightInfo = await page.evaluate(() => {
        const summaryAirports = document.querySelectorAll(".summary-airports");
        const averagePrices = document.querySelectorAll(
          ".summary-average-price"
        );
        const marketingAirlines = document.querySelectorAll(
          ".summary-marketing-airlines"
        );
        const airlineIcons = document.querySelectorAll(".airline-icon");
        const departureTimes = document.querySelectorAll(
          ".flight-departure-time"
        );
        const arrivalTimes = document.querySelectorAll(".flight-arrival-time");

        const flights = Array.from(summaryAirports).map((airport, index) => {
          const airportInfo = Array.from(airport.querySelectorAll("span"))
            .map((span) => span.textContent.trim())
            .join(" → ");

          const priceElement = averagePrices[index];
          const price = priceElement
            ? priceElement.getAttribute("data-price")
            : null;

          const airlineElement = marketingAirlines[index];
          const airlineName = airlineElement?.textContent?.trim();

          const airlineIconElement = airlineIcons[index];
          const airlineIcon = airlineIconElement?.getAttribute("src");

          const departureTime =
            departureTimes[index]?.textContent?.trim() || "";
          const arrivalTime = arrivalTimes[index]?.textContent?.trim() || "";
          const timeInfo =
            departureTime && arrivalTime
              ? `${departureTime} → ${arrivalTime}`
              : "";

          return {
            route: airportInfo,
            price: price ? `${price} TL` : "Fiyat bulunamadı",
            airline: airlineName || "Havayolu bilgisi bulunamadı",
            airlineIcon: airlineIcon || null,
            timeInfo,
          };
        });

        return {
          flights,
          totalFlights: flights.length,
        };
      });

      console.log("İşlem tamamlandı, sonuçlar gönderiliyor...");
      await browser.close();
      res.json({ flightInfo });
    } catch (error) {
      console.log("Sonuç bulunamadı:", error.message);
      await browser.close();
      res.status(404).json({ error: "Sefer bulunamadı" });
    }
  } catch (error) {
    console.error("Scraping hatası:", error);
    if (browser) {
      await browser.close();
    }
    res.status(500).json({
      error: "Uçuş arama sırasında bir hata oluştu",
      details: error.message,
    });
  }
});

// Kullanıcının alarmlarını getiren endpoint
app.get("/user-alarms/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const alarms = await Alarm.find({ userId })
      .sort({ createdAt: -1 }) // En son oluşturulan alarmlar önce gelsin
      .select("-__v"); // Gereksiz alanları çıkar

    console.log(`Retrieved ${alarms.length} alarms for user ${userId}`);

    res.json({
      success: true,
      alarms: alarms.map((alarm) => ({
        id: alarm._id,
        from: alarm.from,
        to: alarm.to,
        date: alarm.date,
        selectedTime: alarm.selectedTime,
        isActive: alarm.isActive,
        createdAt: alarm.createdAt,
      })),
    });
  } catch (error) {
    console.error("Error fetching user alarms:", error);
    res.status(500).json({ error: "Alarmlar getirilirken bir hata oluştu" });
  }
});

// Alarm silme endpoint'i
app.delete("/alarms/:alarmId", async (req, res) => {
  try {
    const { alarmId } = req.params;
    const alarm = await Alarm.findByIdAndDelete(alarmId);

    if (!alarm) {
      return res.status(404).json({ error: "Alarm bulunamadı" });
    }

    res.json({ success: true, message: "Alarm başarıyla silindi" });
  } catch (error) {
    console.error("Error deleting alarm:", error);
    res.status(500).json({ error: "Alarm silinirken bir hata oluştu" });
  }
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

// Check flight alarms every hour
cron.schedule("0 * * * *", async () => {
  console.log("Checking active flight alarms...");
  try {
    const activeFlightAlarms = await FlightAlarm.find({ isActive: true });
    console.log(`Found ${activeFlightAlarms.length} active flight alarms`);

    for (const alarm of activeFlightAlarms) {
      try {
        if (
          !alarm.from ||
          !alarm.to ||
          !alarm.date ||
          !alarm.time ||
          !alarm.airline
        ) {
          console.error(`Invalid flight alarm data for ${alarm._id}:`, alarm);
          continue;
        }

        console.log(
          `Checking flight alarm ${alarm._id} for ${alarm.from} to ${alarm.to} at ${alarm.date}`
        );

        // Mevcut search-flights endpoint'ini kullan
        const searchResponse = await new Promise((resolve, reject) => {
          const req = {
            query: {
              departure: alarm.from,
              arrival: alarm.to,
              date: alarm.date,
            },
          };

          const res = {
            json: resolve,
            status: function (code) {
              return {
                json: (data) => {
                  reject({ code, ...data });
                },
              };
            },
          };

          app._router.handle(req, res, (err) => {
            if (err) reject(err);
          });
        });

        if (
          searchResponse &&
          searchResponse.flightInfo &&
          searchResponse.flightInfo.flights
        ) {
          const matchingFlight = searchResponse.flightInfo.flights.find(
            (flight) => {
              const [departureTime] = flight.timeInfo.split(" → ");
              return (
                flight.airline === alarm.airline &&
                departureTime.trim() === alarm.time
              );
            }
          );

          if (matchingFlight) {
            const currentPrice = parseFloat(
              matchingFlight.price.replace(/[^0-9]/g, "")
            );
            const previousPrice = alarm.currentPrice;
            const priceDrop = previousPrice - currentPrice;

            // Fiyat düşüşünü kontrol et
            if (currentPrice < previousPrice) {
              console.log(`Price drop detected for flight alarm ${alarm._id}`);

              const flightInfo = {
                from: alarm.from,
                to: alarm.to,
                date: alarm.date,
                time: alarm.time,
                airline: alarm.airline,
                currentPrice: currentPrice,
                previousPrice: previousPrice,
                priceDrop: priceDrop,
              };

              // Email gönder
              await sendEmail(alarm.email, createFlightAlarmEmail(flightInfo));

              // Alarm fiyatını güncelle
              alarm.currentPrice = currentPrice;
              await alarm.save();
            }
          }
        }
      } catch (error) {
        console.error(`Flight alarm check failed for ${alarm._id}:`, error);
      }
    }
  } catch (error) {
    console.error("Error in flight alarm cron job:", error);
  }
});

// Create flight alarm endpoint
app.post("/create-flight-alarm", async (req, res) => {
  try {
    const { userId, from, to, date, time, airline, currentPrice, email } =
      req.body;

    console.log("Gelen alarm verisi:", req.body);

    // Veri kontrolü
    const missingFields = [];
    if (!userId) missingFields.push("userId");
    if (!from) missingFields.push("from");
    if (!to) missingFields.push("to");
    if (!date) missingFields.push("date");
    if (!time) missingFields.push("time");
    if (!airline) missingFields.push("airline");
    if (!currentPrice) missingFields.push("currentPrice");
    if (!email) missingFields.push("email");

    if (missingFields.length > 0) {
      console.error("Eksik alanlar:", missingFields);
      return res.status(400).json({
        error: "Eksik alanlar mevcut",
        missingFields,
        received: req.body,
      });
    }

    const newFlightAlarm = new FlightAlarm({
      userId,
      from,
      to,
      date,
      time,
      airline,
      initialPrice: currentPrice,
      currentPrice,
      email,
      isActive: true,
    });

    console.log("Oluşturulacak alarm:", newFlightAlarm);

    await newFlightAlarm.save();
    console.log("Alarm kaydedildi:", newFlightAlarm._id);

    // Alarm kurulduğunda bildirim emaili gönder
    try {
      const emailContent = createFlightAlarmEmail({
        from,
        to,
        date,
        time,
        airline,
        currentPrice,
        previousPrice: currentPrice,
        priceDrop: 0,
      });

      await sendEmail(email, emailContent);
      console.log("Bildirim emaili gönderildi");
    } catch (emailError) {
      console.error("Email gönderimi başarısız:", emailError);
      // Email hatası olsa bile alarm kaydedildi, devam et
    }

    res.status(201).json({
      success: true,
      message: "Flight alarm created successfully",
      alarmId: newFlightAlarm._id,
    });
  } catch (error) {
    console.error("Alarm oluşturma hatası:", error);
    res.status(500).json({
      error: "Failed to create flight alarm",
      details: error.message,
    });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
  console.log(
    `Health check endpoint available at: http://0.0.0.0:${PORT}/health`
  );
});
