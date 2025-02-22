const createTicketNotificationEmail = (ticketInfo) => {
  return {
    subject: "🚂 TCDD Bilet Bildirimi",
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
              .button {
                display: inline-block;
                padding: 10px 20px;
                background-color: #1a365d;
                color: white;
                text-decoration: none;
                border-radius: 5px;
                margin-top: 20px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Bilet Müsaitlik Bildirimi</h1>
              </div>
              <div class="content">
                <p>Merhaba,</p>
                <p>Takip ettiğiniz tren seferinde boş koltuk bulundu!</p>
                
                <div class="ticket-info">
                  <h3>Sefer Detayları:</h3>
                  <p><strong>Kalkış:</strong> ${ticketInfo.from}</p>
                  <p><strong>Varış:</strong> ${ticketInfo.to}</p>
                  <p><strong>Tarih:</strong> ${ticketInfo.date}</p>
                  <p><strong>Saat:</strong> ${ticketInfo.selectedTime}</p>
                  <p><strong>Boş Koltuk:</strong> ${ticketInfo.availableSeats}</p>
                  <p><strong>Fiyat:</strong> ${ticketInfo.price} TL</p>
                </div>
  
                <p>Bileti satın almak için aşağıdaki butona tıklayabilirsiniz:</p>
                <a href="https://ebilet.tcddtasimacilik.gov.tr" class="button" target="_blank">
                  Bileti Satın Al
                </a>
  
                <p style="margin-top: 20px; font-size: 12px; color: #666;">
                  Bu email otomatik olarak gönderilmiştir. Lütfen cevaplamayınız.
                </p>
              </div>
            </div>
          </body>
        </html>
      `,
  };
};

module.exports = createTicketNotificationEmail;
