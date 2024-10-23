// src/components/CheckoutPage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useStripe, useElements, CardElement, Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import './CheckoutPage.css';

const stripePromise = loadStripe('pk_test_51QCOOVCxGoKhLvP8Sjh1FsYSvDxyEJXbUViZ02vY9fGJT0t97r2hpmv1qdp0415yehPRbEtGSfQ8d9JQlRafzxwN00UW2DwIJb'); // Replace with your Stripe publishable key

const CheckoutPage = ({ userId, cartItems, totalAmount }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [clientSecret, setClientSecret] = useState('');

    useEffect(() => {
        // Create a payment intent when the component mounts
        axios.post('https://298340b2-aa0c-4e4f-b71d-d1510816be54-00-2p830g929ktk4.pike.replit.dev/create-payment-intent', { totalAmount })
            .then((response) => {
                setClientSecret(response.data.clientSecret);
            })
            .catch((error) => {
                console.error('Error creating payment intent: ', error);
            });
    }, [totalAmount]);

    const handlePayment = async (e) => {
        e.preventDefault();

        if (!stripe || !elements) return;

        const cardElement = elements.getElement(CardElement);

        const { paymentIntent, error } = await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
                card: cardElement,
            },
        });

        if (error) {
            console.error('Payment failed: ', error);
        } else if (paymentIntent.status === 'succeeded') {
            // If payment is successful, store the purchased items in the database
            axios.post('https://298340b2-aa0c-4e4f-b71d-d1510816be54-00-2p830g929ktk4.pike.replit.dev/purchases', { user_id: userId, cartItems })
                .then(() => {
                    alert('Payment successful and items purchased!');
                })
                .catch((error) => {
                    console.error('Error storing purchased items: ', error);
                });
        }
    };

    return (
        <div className="checkout-page">
            <h1>Checkout</h1>
            <div className="checkout-summary">
                <h2>Summary of Items</h2>
                {cartItems.map((item) => (
                    <div key={item.item_id} className="checkout-item">
                        <p>{item.item_name}</p>
                        <p>Price: ${item.price}</p>
                        <p>Quantity: {item.quantity}</p>
                    </div>
                ))}
                <h2>Total: ${totalAmount.toFixed(2)}</h2>
            </div>

            <form onSubmit={handlePayment} className="checkout-form">
                <CardElement />
                <button type="submit" disabled={!stripe}>Pay</button>
            </form>
        </div>
    );
};

const WrappedCheckoutPage = (props) => {
    return (
        <Elements stripe={stripePromise}>
            <CheckoutPage {...props} />
        </Elements>
    );
};

export default WrappedCheckoutPage;
