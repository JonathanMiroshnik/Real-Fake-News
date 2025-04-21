import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Helmet } from 'react-helmet';

import Layout from './components/Layout/Layout';
import HomePage from './pages/HomePage/HomePage';

import './App.css'

function App() {
  return (
    <div>
      <Helmet>
        <meta charSet="utf-8" />
        <title>Sensor? Censor!</title>
        {/* <link rel="canonical" href="https://www.sensorcensor.xyz" /> */}
        {/* <link rel="icon" type="image/png" href="/favicon.ico" sizes="32x32" /> */}
        <meta name="description" content="Real Fake News" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Helmet>
      <Router>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            {/* <Route path="/" element={<HomePage />} /> */}
            {/* <Route path="/about" element={<About />} /> */}
          </Route>                      
        </Routes>
      </Router>
    </div>
  );
}

export default App;
