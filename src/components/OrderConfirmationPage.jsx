// src/components/OrderConfirmationPage.jsx
import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import './OrderConfirmationPage.css';  // Optional for styling

const OrderConfirmationPage = () => {
    const { state } = useLocation();  // Retrieve the passed state
    const { cartItems = [], totalAmount = 0 } = state || {};  // Destructure with default values

    return (
        <div className="order-confirmation-page">
            <h1>Order Confirmation</h1>
            <p>Thank you for your purchase! Below is a summary of your order:</p>

            <div className="order-summary">
                <h2>Order Summary</h2>
                {cartItems.length === 0 ? (
                    <p>No items in your order.</p>
                ) : (
                    cartItems.map((item) => (
                        <div key={item.item_id} className="order-item">
                            <img src={item.image_url} alt={item.item_name} className="order-item-image" />
                            <p>{item.item_name}</p>
                            <p>Price: ${item.price}</p>
                            <p>Quantity: {item.quantity}</p>
                        </div>
                    ))
                )}
                <h2>Total: ${totalAmount.toFixed(2)}</h2>
            </div>

            <Link to="/shopping">Continue Shopping</Link>  {/* Link back to the shopping page */}
        </div>
    );
};

export default OrderConfirmationPage;
