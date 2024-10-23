// src/App.js
import './AuthPage.css'
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import AuthPage from './components/AuthPage';
import ShoppingPage from './components/ShoppingPage';  // Placeholder for now
import RequireAuth from './components/RequireAuth';
import SellPage from './components/SellPage';
import CartPage from './components/CartPage'
import WrappedCheckoutPage from './components/CheckoutPage';
import OrderSummaryPage from './components/OrderSummaryPage';
import OrderHistoryPage from './components/OrderHistoryPage'

function App() {
  const handleLogout = () => {
    firebase.auth().signOut()
      .then(() => {
        console.log('User logged out');
        // You can also remove any authentication tokens or reset state if necessary
      })
      .catch((error) => {
        console.error('Error logging out: ', error);
      });
  };
  return (
    <Router>
      <Navbar logout={handleLogout} />
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="/shopping" element={<RequireAuth><ShoppingPage /></RequireAuth>} />
        <Route path="/sell" element={<RequireAuth><SellPage /></RequireAuth>} />
        <Route path="/cart" element={<RequireAuth><CartPage /></RequireAuth>} />
        <Route path="/checkout" element={<RequireAuth><WrappedCheckoutPage /></RequireAuth>} />
        <Route path="/order-summary" element={<RequireAuth><OrderSummaryPage /></RequireAuth>} />
        <Route path="/order-history" element={<RequireAuth><OrderHistoryPage /></RequireAuth>} />
      </Routes>
    </Router>
  );
}

export default App;

