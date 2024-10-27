// src/components/Navbar.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart } from 'phosphor-react';
import './Navbar.css';
import logo from './logo.png'


const Navbar = ({ logout }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();  // Call the logout function passed as a prop
        navigate('/');  // Redirect to the AuthPage ("/" path)
    };

    return (
        <nav className="navbar">
            <div className="logo-container">
                <img src={logo} alt="Sport Mart Logo" className="navbar-logo" />
            </div>
            <ul className="nav-links">
                <li>
                    <Link to="/shopping">Shopping</Link>
                </li>
                <li>
                    <Link to="/sell">Sell</Link>
                </li>
                <li>
                    <Link to="/order-history">Order History</Link>
                </li>
            </ul>
            <div className="nav-actions">
                <Link to="/cart" className="cart-icon">
                    <ShoppingCart size={34} weight="bold" />
                </Link>
                <button onClick={handleLogout} className="logout-button">Logout</button>
            </div>

        </nav>
    );
};

export default Navbar;
