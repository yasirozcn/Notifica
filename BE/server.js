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
    console.log("Launching browser with args...");
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
    await page.setDefaultNavigationTimeout(90000);
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

    let trainData = null;

    // Response listener'ı güçlendir
    await page.setRequestInterception(true);
    page.on("request", (request) => {
      console.log("Outgoing request URL:", request.url());
      request.continue();
    });

    page.on("response", async (response) => {
      const url = response.url();
      console.log("Incoming response URL:", url);

      // TCDD'nin tüm AJAX isteklerini kontrol et
      if (
        url.includes("tcddtasimacilik.gov.tr") &&
        (url.includes("train-availability") || url.includes("seferSorgula"))
      ) {
        try {
          console.log("TCDD response intercepted from:", url);
          const responseText = await response.text();
          console.log("Response status:", response.status());
          console.log("Response headers:", response.headers());

          if (
            responseText.includes("seferSonuc") ||
            responseText.includes("trainData")
          ) {
            console.log("Found train data in response");
            trainData = JSON.parse(responseText);
          }
        } catch (error) {
          console.error("Error handling response:", error);
        }
      }
    });

    // Sayfaya gitmeden önce network dinlemeyi başlat
    console.log("Navigating to TCDD website...");
    const response = await page.goto(
      "https://ebilet.tcddtasimacilik.gov.tr/view/eybis/tnmGenel/tcddWebContent.jsf",
      {
        waitUntil: "networkidle0",
        timeout: 90000,
      }
    );

    // Sayfa yükleme durumunu kontrol et
    console.log("Page load status:", response.status());
    if (!response.ok()) {
      console.error("Page load failed:", response.statusText());
    }

    // Sayfanın tamamen yüklenmesini bekle
    await page.waitForFunction(() => document.readyState === "complete");
    await new Promise((resolve) => setTimeout(resolve, 2000));

    console.log("Waiting for form elements...");

    // Kalkış istasyonu
    console.log("Entering departure station:", from);
    await page.waitForSelector("#fromTrainInput", { visible: true });
    await page.evaluate(() =>
      document.querySelector("#fromTrainInput").click()
    );
    await page.type("#fromTrainInput", from);
    await page.waitForSelector(".dropdown-item.station", { visible: true });
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await page.evaluate(() => {
      const elements = document.querySelectorAll(".dropdown-item.station");
      if (elements.length > 0) elements[0].click();
    });

    // Varış istasyonu
    console.log("Entering arrival station:", to);
    await page.waitForSelector("#toTrainInput", { visible: true });
    await page.evaluate(() => document.querySelector("#toTrainInput").click());
    await page.type("#toTrainInput", to);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await page.evaluate(() => {
      const elements = document.querySelectorAll(".dropdown-item.station");
      if (elements.length > 1) elements[1].click();
    });

    // Tarih seçimi
    console.log("Selecting date:", date);
    const [day, month, year] = date.split(".");
    const formattedDate = `${year}-${month}-${day}`;

    await page.waitForSelector(".form-control.calenderPurpleImg", {
      visible: true,
    });
    await page.evaluate(() =>
      document.querySelector(".form-control.calenderPurpleImg").click()
    );
    await page.waitForSelector(".daterangepicker", { visible: true });

    const dateSelector = `td[data-date="${formattedDate}"]`;
    await page.waitForSelector(dateSelector, { visible: true });
    await page.evaluate(
      (selector) => document.querySelector(selector).click(),
      dateSelector
    );

    // Arama butonu
    console.log("Clicking search button...");
    await page.waitForSelector("#searchSeferButton", { visible: true });
    await page.evaluate(() =>
      document.querySelector("#searchSeferButton").click()
    );

    // Loading overlay'in görünmesini bekle
    console.log("Waiting for loading overlay...");
    await page
      .waitForSelector(".vld-overlay.is-active", { visible: true })
      .catch((e) => console.log("Loading overlay not found:", e.message));

    // Loading overlay'in kaybolmasını bekle
    console.log("Waiting for loading to complete...");
    await page
      .waitForFunction(
        () => {
          const overlay = document.querySelector(".vld-overlay.is-active");
          return overlay && window.getComputedStyle(overlay).display === "none";
        },
        { timeout: 30000 }
      )
      .catch((e) => console.log("Loading wait timeout:", e.message));

    // Sonuçları bekle
    console.log("Checking for results...");
    await new Promise((resolve) => setTimeout(resolve, 8000));

    // Son bir kontrol daha yap
    if (!trainData) {
      console.log("No train data received after search");

      // Sayfadaki son durumu kontrol et
      const pageState = await page.evaluate(() => {
        const overlay = document.querySelector(".vld-overlay.is-active");
        return {
          overlayExists: !!overlay,
          overlayDisplay: overlay
            ? window.getComputedStyle(overlay).display
            : "not found",
          pageContent: document.body.innerHTML.substring(0, 500), // İlk 500 karakter
        };
      });

      console.log("Final page state:", pageState);
      return { apiResponse: null };
    }

    console.log("Train data received successfully");
    return { apiResponse: trainData };
  } catch (error) {
    console.error("Scraping error:", error);
    return { apiResponse: null, error: error.message };
  } finally {
    if (browser) {
      console.log("Closing browser...");
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

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
  console.log(
    `Health check endpoint available at: http://0.0.0.0:${PORT}/health`
  );
});
