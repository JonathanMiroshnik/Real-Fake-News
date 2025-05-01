import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Helmet } from 'react-helmet';

import Layout from './components/Layout/Layout';
import HomePage from './pages/HomePage/HomePage';
import Article from './components/Article/Article';
import Category from './components/Category/Category';

import './App.css'

function App() {
  return (
    <div>
      <Helmet>
        <meta charSet="utf-8" />
        <title>Real Fake News</title>
        {/* <link rel="canonical" href="https://www.sensorcensor.xyz" /> */}
        {/* <link rel="icon" type="image/png" href="/favicon.ico" sizes="32x32" /> */}
        <meta name="description" content="Real Fake News" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Helmet>
      <Router>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/article/:key" element={<Article />} />
            <Route path="/category/:key" element={<Category />} />
            <Route path="*" element={<HomePage />} /> {/* Catch-all */}
          </Route>                      
        </Routes>
      </Router>
    </div>
  );
}

export default App;
