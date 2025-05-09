import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Helmet } from 'react-helmet';

// TODO: should I use this? theoretically solves STRICT error in browser.
// https://stackoverflow.com/questions/62202890/how-can-i-fix-using-unsafe-componentwillmount-in-strict-mode-is-not-recommended 
// import { Helmet, HelmetProvider } from 'react-helmet-async';

import Layout from './components/Layout/Layout';
import HomePage from './pages/HomePage/HomePage';
import ArticlePage from './pages/ArticlePage/ArticlePage';
import CategoryPage from './pages/CategoryPage/CategoryPage';
import WriterPage from './pages/WriterPage/WriterPage';

import './App.css'
import ContactPage from './pages/ContactPage/ContactPage';
import TermsPage from './pages/TermsPage/TermsPage';
import DisclaimerPage from './pages/DisclaimerPage/DisclaimerPage';

function App() {
  return (
    <div className="app-div">
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
            <Route path="/article/:key" element={<ArticlePage />} />
            {/* Article lists */}
            <Route path="/category/:key" element={<CategoryPage />} />
            <Route path="/writer/:key" element={<WriterPage />} />
            {/* TODO: Games section - currently separate pages */}
            <Route path="/games/tictactoe" element={<HomePage />} />
            <Route path="/games/trivia" element={<HomePage />} />
            {/* Footer pages */}
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/disclaimer" element={<DisclaimerPage />} />
            {/* Catch-all */}
            <Route path="*" element={<HomePage />} />
          </Route>                      
        </Routes>
      </Router>
    </div>
  );
}

export default App;
