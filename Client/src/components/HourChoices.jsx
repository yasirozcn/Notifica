/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React from 'react';
import axios from 'axios';

const HourChoices = ({ journeys, selectedHours, setSelectedHours, business }) => {
    const handleCheckboxChange = (e) => {
        const { value, checked } = e.target;
        setSelectedHours((prev) =>
            checked ? [...prev, value] : prev.filter((hour) => hour !== value)
        );
    };

    const times = [...new Set(journeys.map((journey) => {
        const date = new Date(journey.binisTarih);
        const timeString = date.toTimeString().substring(0, 5); // HH:mm formatı
        const availableSeats = journey.vagonTipleriBosYerUcret[0]?.kalanSayi || 0; // kalanSayi değeri
        const businessSeats = journey.vagonTipleriBosYerUcret[1]?.kalanSayi || 0; // kalanSayi değeri

        if (business) {
            return `${timeString} -> economy ${availableSeats}, business ${businessSeats}`;
        } else {
            return `${timeString} -> available ${availableSeats}`;
        }
    }))];

    console.log(journeys); // journeys array'i

    // Email gönderme fonksiyonu
    const sendEmail = async () => {
        try {
            const emailData = {
                to: 'yasirozcn@gmail.com', // E-posta alıcısı
                subject: 'Selected Hours Reminder',
                text: `You have selected the following hours: ${selectedHours.join(', ')}`
            };

            const response = await axios.post('http://localhost:8080/send-email', emailData, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            console.log('Email sent:', response.data);
        } catch (error) {
            console.error('Error sending email:', error.response || error.message);
        }
    };

    return (
        <div>
            <h3>Select Hours</h3>
            {times.sort((a, b) => a.localeCompare(b)).map((time) => (
                <div key={time}>
                    <label>
                        <input
                            type="checkbox"
                            value={time}
                            checked={selectedHours.includes(time)}
                            onChange={handleCheckboxChange}
                        />
                        {time}
                    </label>
                </div>
            ))}
            <button onClick={sendEmail}>Send Reminder Email</button>
        </div>
    );
};

export default HourChoices;
