/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React from 'react';

const HourChoices = ({ journeys, selectedHours, setSelectedHours }) => {
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
        return `${timeString} -> available ${availableSeats}`;
    }))];
    

    return (
        <div>
            <h3>Select Hours</h3>
            {times.sort((a,b) => a.localeCompare(b)).map((time) => (
                <div key={time}>
                <label key={time}>
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
            <button onClick={() => console.log(selectedHours)}>Show Selected Hours</button>
        </div>
    );
};

export default HourChoices;
