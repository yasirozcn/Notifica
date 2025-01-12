import React from 'react';
import { createRoot } from 'react-dom';
import './index.css';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';

// Import the layouts
import RootLayout from './layouts/root-layout';

// Import the components
import Home from './routes/Home';
import SignInPage from './routes/SignInPage';
import SignUpPage from './routes/SignUpPage';
import FlightSearch from './routes/FlightSearch';
import TrainSearch from './routes/TrainSearch';
import FlightResults from './routes/FlightResults';
import TrainResults from './routes/TrainResults';

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/alarm', element: <TrainSearch /> },
      { path: '/sign-in/*', element: <SignInPage /> },
      { path: '/sign-up/*', element: <SignUpPage /> },
      { path: '/flight', element: <FlightSearch /> },
      { path: '/flight-results', element: <FlightResults /> },
      { path: '/train', element: <TrainSearch /> },
      { path: '/train-results', element: <TrainResults /> },
    ],
  },
]);

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
