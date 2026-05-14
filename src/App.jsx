import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
      <ToastContainer position="bottom-right" theme="colored" />
    </BrowserRouter>
  );
}

export default App;

