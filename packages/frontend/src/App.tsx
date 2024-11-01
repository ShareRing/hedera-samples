// import { useEffect } from 'react';
import 'react-bootstrap';
import { Helmet } from 'react-helmet-async';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.scss';
import { useTheme } from './hooks';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import Result from './pages/Result';

function App() {
  useTheme();
  return (
    <>
      <Helmet>
        <title>ShareRing x Hedera</title>
      </Helmet>
      <BrowserRouter basename={process.env.PUBLIC_URL}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/result/:sessionId" element={<Result />} />
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
