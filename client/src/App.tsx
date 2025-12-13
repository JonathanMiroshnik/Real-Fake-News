import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import ArticleProvider from './contexts/ArticlesContext';

// TODO: should I use this? theoretically solves STRICT error in browser.
// https://stackoverflow.com/questions/62202890/how-can-i-fix-using-unsafe-componentwillmount-in-strict-mode-is-not-recommended 
// import { Helmet, HelmetProvider } from 'react-helmet-async';

import Layout from './components/Layout/Layout';
import HomePage from './pages/HomePage/HomePage';

import ArticlePage from './pages/ArticlePage/ArticlePage';
import CategoryPage from './pages/CategoryPage/CategoryPage';
import WriterPage from './pages/WriterPage/WriterPage';
import RecipePage from './pages/RecipePage/RecipePage';

import ContactPage from './pages/ContactPage/ContactPage';
import TermsPage from './pages/TermsPage/TermsPage';
import DisclaimerPage from './pages/DisclaimerPage/DisclaimerPage';

import TicTacToeGame from './components/Games/TicTacToeComponents/Game/TicTacToeGame';
import TriviaGame from './components/Games/TriviaComponents/TriviaGame/TriviaGame';

import { usePrintNewspaper } from './hooks/usePrintNewspaper';
import NewspaperPrintView from './components/NewspaperPrintView/NewspaperPrintView';

import './App.css'

function App() {
  const isPrintMode = usePrintNewspaper();

  return (
    <div className={`app-div ${isPrintMode ? 'print-mode' : ''}`}>
      <Helmet>
        <meta charSet="utf-8" />
        <title>Real Fake News</title>
        <link rel="canonical" href="https://www.sensorcensor.xyz" />
        {/* <link rel="icon" type="image/png" href="/favicon.ico" sizes="32x32" /> */}
        <meta name="description" content="Real Fake News" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Helmet>
      
      {/* Newspaper view - shown when printing */}
      <div className="newspaper-view-wrapper">
        <NewspaperPrintView />
      </div>
      
      {/* Normal app content - hidden when printing */}
      <div className="normal-view-wrapper">
        <Router>
          <ArticleProvider>
            <Routes>
              <Route element={<Layout />}>
                <Route path="/" element={<HomePage />} />            
                <Route path="/article/:key" element={<ArticlePage />} />
                <Route path="/recipe/:key" element={<RecipePage />} />
                {/* Article lists */}
                <Route path="/category/:key" element={<CategoryPage />} />
                <Route path="/writer/:key" element={<WriterPage />} />
                {/* TODO: Games section - currently separate pages */}
                <Route path="/games/tictactoe" element={<TicTacToeGame />} />
                <Route path="/games/trivia" element={<TriviaGame />} />
                {/* Footer pages */}
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/disclaimer" element={<DisclaimerPage />} />
                {/* Catch-all */}
                <Route path="*" element={<HomePage />} />
              </Route>                      
            </Routes>
          </ArticleProvider>
        </Router>
      </div>
    </div>
  );
}

export default App;
