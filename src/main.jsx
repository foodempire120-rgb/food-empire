import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { BrowserRouter } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop'; // ✅ add this

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ScrollToTop /> {/* ✅ move it here */}
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
