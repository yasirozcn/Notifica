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
    libgconf-2-4 \
    libxss1 \
    libxtst6 \
    xvfb \
    libnss3 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Çalışma dizinini oluştur
WORKDIR /usr/src/app

# package.json ve package-lock.json dosyalarını kopyala
COPY BE/package*.json ./

# Puppeteer'ı Chromium ile kullanmak için environment variable'ları ayarla
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium \
    DISPLAY=:99

# Xvfb başlat
RUN printf '#!/bin/bash\nXvfb :99 -screen 0 1024x768x16 &\nexec "$@"' > /entrypoint.sh \
    && chmod +x /entrypoint.sh

# Bağımlılıkları yükle
RUN npm install

#Local docker configs
#COPY BE/server.js .
#COPY BE/models ./models
#COPY BE/.env .
# Kaynak kodları kopyala
COPY BE/. .

# Port'u aç
EXPOSE 8080

# Uygulamayı başlat
ENTRYPOINT ["/entrypoint.sh"]
CMD ["node", "server.js"] 