// src/components/OrderSummaryPage.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './OrderSummaryPage.css';

const OrderSummaryPage = ({ userId }) => {
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        // Fetch order summary for the user
        axios.get(`https://298340b2-aa0c-4e4f-b71d-d1510816be54-00-2p830g929ktk4.pike.replit.dev/order-summary/${userId}`)
            .then((response) => setOrders(response.data))
            .catch((error) => console.error('Error fetching order summary: ', error));
    }, [userId]);

    return (
        <div className="order-summary-page">
            <h1>Your Order Summary</h1>
            {orders.length === 0 ? (
                <p>You have no orders.</p>
            ) : (
                orders.map((order) => (
                    <div key={order.order_id} className="order-card">
                        <p>Order ID: {order.order_id}</p>
                        <p>Item ID: {order.item_id}</p>
                        <p>Total Amount: ${order.total_amount}</p>
                        <p>Order Date: {new Date(order.order_date).toLocaleString()}</p>
                        <p>Status: {order.status}</p>
                        <p>Payment Status: {order.payment_status}</p>
                    </div>
                ))
            )}
        </div>
    );
};

export default OrderSummaryPage;
