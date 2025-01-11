# Node.js base image
FROM node:18-slim

# Install Chrome dependencies
RUN apt-get update \
    && apt-get install -y \
    chromium \
    fonts-ipafont-gothic \
    fonts-wqy-zenhei \
    fonts-thai-tlwg \
    fonts-kacst \
    fonts-freefont-ttf \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Çalışma dizinini oluştur
WORKDIR /usr/src/app

# package.json ve package-lock.json dosyalarını BE klasöründen kopyala
COPY BE/package*.json ./

# Puppeteer'ı Chromium ile kullanmak için environment variable'ları ayarla
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Bağımlılıkları yükle
RUN npm install

# BE klasöründeki kaynak kodları kopyala
COPY BE/. .

# Port'u aç
EXPOSE 8080

# Uygulamayı başlat
CMD ["node", "server.js"] 