/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React from 'react';
import axios from 'axios';
import { useUser } from '@clerk/clerk-react';

const HourChoices = ({ journeys }) => {
  // Gelen veriyi kontrol et
  console.log('Received journeys data:', journeys);

  // journeys null veya undefined ise boş div döndür
  if (!journeys) {
    return <div>Sefer bulunamadı.</div>;
  }

  // API'den gelen veriyi doğru formatta al
  const tickets = journeys.tickets || [];
  const apiResponse = journeys.apiResponse;

  console.log('Tickets:', tickets);
  console.log('API Response:', apiResponse);

  return (
    <div className="hour-choices">
      {tickets.length > 0 ? (
        tickets.map((journey, index) => (
          <div key={index} className="journey-card">
            <div className="journey-time">{journey.time}</div>
            <div className="journey-seats">
              Boş Koltuk: {journey.availableSeats}
            </div>
            <div className="journey-price">Fiyat: {journey.price}</div>
          </div>
        ))
      ) : (
        <div>Bu tarih için sefer bulunamadı.</div>
      )}
    </div>
  );
};

export default HourChoices;
