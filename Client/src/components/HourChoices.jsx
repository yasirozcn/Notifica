/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React from 'react';
import axios from 'axios';
import { useUser } from '@clerk/clerk-react';

const HourChoices = ({ journeys }) => {
  console.log('Raw API Response:', journeys?.apiResponse);

  if (!journeys?.apiResponse) {
    return <div>Veri yükleniyor...</div>;
  }

  const trainData = journeys.apiResponse;

  return (
    <div className="hour-choices">
      <pre className="text-sm bg-gray-100 p-4 rounded">
        {/* {JSON.stringify(trainData, null, 2)} */}
      </pre>
    </div>
  );
};

export default HourChoices;
