// src/components/CartPage.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './CartPage.css';

const CartPage = ({ userId }) => {
    const [cartItems, setCartItems] = useState([]);
    const [totalAmount, setTotalAmount] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        // Fetch cart items for the user
        axios.get(`https://298340b2-aa0c-4e4f-b71d-d1510816be54-00-2p830g929ktk4.pike.replit.dev/${userId}`)
            .then((response) => {
                setCartItems(response.data);
                calculateTotal(response.data);
            })
            .catch((error) => {
                console.error('Error fetching cart items: ', error);
            });
    }, [userId]);

    // Calculate total amount based on cart items
    const calculateTotal = (items) => {
        const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
        setTotalAmount(total);
    };

    return (
        <div className="cart-page">
            <h1>Your Cart</h1>
            <div className="cart-items">
                {cartItems.length === 0 ? (
                    <p>Your cart is empty</p>
                ) : (
                    cartItems.map((item) => (
                        <div key={item.cart_id} className="cart-item">
                            <p>Item: {item.item_name}</p>
                            <p>Price: ${item.price}</p>
                            <p>Quantity: {item.quantity}</p>
                        </div>
                    ))
                )}
            </div>
            <div className="cart-summary">
                <h2>Total: ${totalAmount.toFixed(2)}</h2>
                <button onClick={() => navigate('/checkout')}>Checkout</button>
            </div>
        </div>
    );
};

export default CartPage;
