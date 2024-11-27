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
        return date.toTimeString().substring(0, 5);
    }))];

    return (
        <div>
            <h3>Select Hours</h3>
            {times.map((time) => (
                <label key={time}>
                    <input
                        type="checkbox"
                        value={time}
                        checked={selectedHours.includes(time)}
                        onChange={handleCheckboxChange}
                    />
                    {time}
                </label>
            ))}
        </div>
    );
};

export default HourChoices;
