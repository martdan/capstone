import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase'; // Assuming you have firebase set up
import './OrderHistoryPage.css';

const OrderHistoryPage = () => {
    const [orderHistory, setOrderHistory] = useState([]);
    const [user] = useAuthState(auth);  // Get the logged-in user
    const userId = user?.uid;

    useEffect(() => {
        if (userId) {
            console.log('Fetching order history for user:', userId);  // Debug log for userId

            // Fetch order history for the user
            axios.get(`https://ee23a926-c235-476f-bc72-c44c89de4608-00-3suz77jp7z7v7.sisko.replit.dev/order-history/${userId}`)
                .then((response) => {
                    console.log('API Response:', response.data);  // Debug log for API response
                    setOrderHistory(response.data);
                })
                .catch((error) => {
                    console.error('Error fetching order history: ', error);
                });
        }
    }, [userId]);

    if (!userId) {
        return <p>Please log in to view your order history.</p>;  // Handle the case where the user is not logged in
    }

    return (
        <div className="order-history-page">
            <h1>Your Order History</h1>
            {orderHistory.length === 0 ? (
                <p>You have no past orders.</p>
            ) : (
                orderHistory.map((order) => (
                    <div key={order.order_id} className="order-card">
                        <p>Order ID: {order.order_id}</p>
                        <p>Item Name: {order.item_name}</p>  {/* Fetch item_name from the response */}
                        <p>Price: ${order.price}</p>  {/* Display price */}
                        <p>Order Date: {new Date(order.order_date).toLocaleString()}</p>
                        <p>Status: {order.status}</p>
                        <p>Payment Status: {order.payment_status}</p>
                    </div>
                ))
            )}
        </div>
    );
};

export default OrderHistoryPage;


//https://ee23a926-c235-476f-bc72-c44c89de4608-00-3suz77jp7z7v7.sisko.replit.dev/