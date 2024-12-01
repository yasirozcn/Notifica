const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');
const app = express();
app.use(cors());
app.use(express.json());

// Access token burada. Bu token'ı doğru şekilde kullanacağız.
const oauth2Client = new google.auth.OAuth2();
oauth2Client.setCredentials({
  access_token: process.env.ACCESS_TOKEN,
});

// Send email using Gmail API
app.post('/send-email', async (req, res) => {
  const { to, subject, text } = req.body;

  if (!to || !subject || !text) {
    return res.status(400).send({ message: 'Missing parameters: to, subject, or text.' });
  }

  try {
    // Gmail API client
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    // E-posta mesajını oluşturma
    const message = `To: ${to}\r\nSubject: ${subject}\r\n\r\n${text}`;
    
    // Mesajı base64 formatına çevir
    const encodedMessage = Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    // Gmail API kullanarak e-posta gönderme
    const response = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage,
      },
    });

    res.status(200).send({ message: 'Email sent successfully', response });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).send({ message: 'Failed to send email', error });
  }
});

// Start server
app.listen(8080, () => {
  console.log('Server running on http://localhost:8080');
});
