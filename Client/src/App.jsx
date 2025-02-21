/* eslint-disable no-unused-vars */
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import NavBar from './components/NavBar';
import Home from './routes/Home';
import FlightSearch from './routes/FlightSearch';
import FlightResults from './routes/FlightResults';
import SignInPage from './routes/SignInPage';
import SignUpPage from './routes/SignUpPage';
import TrainSearch from './routes/TrainSearch';
import TrainResults from './routes/TrainResults';
import MyAlarms from './routes/MyAlarms';
import './App.css';

const App = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />
      <div className="flex-1 mt-20">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/alarm" element={<TrainSearch />} />
          <Route path="/flight" element={<FlightSearch />} />
          <Route path="/flight-results" element={<FlightResults />} />
          <Route path="/train-results" element={<TrainResults />} />
          <Route path="/my-alarms" element={<MyAlarms />} />
          <Route path="/sign-in/*" element={<SignInPage />} />
          <Route path="/sign-up/*" element={<SignUpPage />} />
        </Routes>
      </div>
    </div>
  );
};

export default App;
