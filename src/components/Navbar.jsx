// src/components/Navbar.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ logout }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();  // Call the logout function passed as a prop
        navigate('/');  // Redirect to the AuthPage ("/" path)
    };

    return (
        <nav className="navbar">
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
                <li>
                    <Link to="/cart">Cart</Link>
                </li>
                <li>
                    <button onClick={handleLogout}>Logout</button>
                </li>
            </ul>
        </nav>
    );
};

export default Navbar;
