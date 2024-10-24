// src/components/CartPage.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';  // Ensure this is the correct path to your Firebase setup
import './CartPage.css';  // Optional styling file

const CartPage = () => {
    const [cartItems, setCartItems] = useState([]);
    const [totalAmount, setTotalAmount] = useState(0);
    const [user] = useAuthState(auth);  // Get the authenticated user
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            // Fetch cart items for the authenticated user
            axios.get(`https://298340b2-aa0c-4e4f-b71d-d1510816be54-00-2p830g929ktk4.pike.replit.dev/cart/${user.uid}`)  // Replace with your actual backend API URL
                .then((response) => {
                    setCartItems(response.data);  // Set the cart items from the response
                    calculateTotal(response.data);  // Calculate total amount
                })
                .catch((error) => {
                    console.error('Error fetching cart items: ', error);
                });
        }
    }, [user]);

    // Calculate total amount based on cart items
    const calculateTotal = (items) => {
        const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
        setTotalAmount(total);  // Set the total amount to be displayed
    };
    const handleCheckout = () => {
        navigate('/checkout', { state: { cartItems, totalAmount } });
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
                            <img src={item.image_url} alt={item.item_name} className="cart-item-image" />  {/* Display the item image */}
                            <p>Item: {item.item_name}</p>  {/* Display the item name */}
                            <p>Price: ${item.price}</p>
                            <p>Quantity: {item.quantity}</p>
                        </div>
                    ))
                )}
            </div>
            {cartItems.length > 0 && (
                <div className="cart-summary">
                    <h2>Total: ${totalAmount.toFixed(2)}</h2>
                    <button onClick={handleCheckout}>Checkout</button>
                </div>
            )}
        </div>
    );
};

export default CartPage;


//https://298340b2-aa0c-4e4f-b71d-d1510816be54-00-2p830g929ktk4.pike.replit.dev/