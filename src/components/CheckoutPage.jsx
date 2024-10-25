import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';  // Added useNavigate for redirection
import { useStripe, useElements, CardElement, Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import './CheckoutPage.css';
import axios from 'axios';

const stripePromise = loadStripe('pk_test_51QCOOVCxGoKhLvP8Sjh1FsYSvDxyEJXbUViZ02vY9fGJT0t97r2hpmv1qdp0415yehPRbEtGSfQ8d9JQlRafzxwN00UW2DwIJb'); // Replace with your Stripe publishable key

const CheckoutPage = () => {
    const { state } = useLocation();  // Retrieve the state from CartPage
    const { cartItems = [], totalAmount = 0 } = state || {};  // Destructure and default to empty values
    const buyer_id = state?.buyer_id || 'default_buyer_id_for_testing';
    const stripe = useStripe();
    const elements = useElements();
    const [clientSecret, setClientSecret] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);  // For handling button disabled state
    const navigate = useNavigate();

    useEffect(() => {
        // Create a payment intent when the component mounts
        if (totalAmount > 0) {
            console.log('Total Amount:', totalAmount);
            console.log('Sending request to create payment intent...'); // Debugging log for totalAmount
            axios.post('https://298340b2-aa0c-4e4f-b71d-d1510816be54-00-2p830g929ktk4.pike.replit.dev/create-payment-intent', { totalAmount, buyer_id, item_id: cartItems[0]?.item_id })
                .then((response) => {
                    console.log('Client Secret:', response.data.clientSecret);  // Debugging log for clientSecret
                    setClientSecret(response.data.clientSecret);
                })
                .catch((error) => {
                    console.error('Error creating payment intent: ', error.response.data);
                });
        } else {
            console.error('Total amount is invalid:', totalAmount);
        }
    }, [totalAmount]);

    const handlePayment = async (e) => {
        e.preventDefault();

        if (!stripe || !elements || !clientSecret) {
            console.error('Stripe or Elements not loaded, or clientSecret is missing');
            return;
        }

        setIsProcessing(true);  // Disable the button while processing

        const cardElement = elements.getElement(CardElement);

        // Confirm card payment with Stripe
        const { paymentIntent, error } = await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
                card: cardElement,
            },
        });

        if (error) {
            console.error('Payment failed: ', error);
            setIsProcessing(false);  // Re-enable button if payment fails
        } else if (paymentIntent.status === 'succeeded') {
            // Payment was successful, send order to backend
            const orderDetails = {
                buyer_id: buyer_id,
                cartItems: cartItems.map((item) => ({
                    item_id: item.item_id,
                    price: item.price,
                    quantity: item.quantity,
                })),
                totalAmount: totalAmount,
            };
            console.log('Order Details:', orderDetails);  // Log for debugging

            try {
                // Send order details to backend to insert into ordersss table
                await axios.post('https://298340b2-aa0c-4e4f-b71d-d1510816be54-00-2p830g929ktk4.pike.replit.dev/insert-order', orderDetails);
                console.log('Order saved successfully in the database.');

                // Redirect to a success page or order confirmation
                navigate('/order-confirmation', { state: { cartItems, totalAmount } });

            } catch (err) {
                console.error('Error saving order to the database: ', err.response?.data || err.message);
                alert('Failed to save order: ' + (err.response?.data?.error || err.message));
            }
            finally {
                setIsProcessing(false);
            }
        }
    };


    return (
        <div className="checkout-page">
            <h1>Checkout</h1>
            <div className="checkout-summary">
                <h2>Summary of Items</h2>
                {cartItems.length === 0 ? (
                    <p>No items in your cart.</p>
                ) : (
                    cartItems.map((item) => (
                        <div key={item.item_id} className="checkout-item">
                            <img src={item.image_url} alt={item.item_name} className="checkout-item-image" />
                            <p>{item.item_name}</p>
                            <p>Price: ${item.price}</p>
                            <p>Quantity: {item.quantity}</p>
                        </div>
                    ))
                )}
                <h2>Total: ${totalAmount.toFixed(2)}</h2>
            </div>

            <form onSubmit={handlePayment} className="checkout-form">
                <CardElement />
                <button type="submit" disabled={!stripe || isProcessing}>
                    {isProcessing ? 'Processing...' : 'Pay'}
                </button>
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




//'https://298340b2-aa0c-4e4f-b71d-d1510816be54-00-2p830g929ktk4.pike.replit.dev'

// stripe publishable key:'pk_test_51QCOOVCxGoKhLvP8Sjh1FsYSvDxyEJXbUViZ02vY9fGJT0t97r2hpmv1qdp0415yehPRbEtGSfQ8d9JQlRafzxwN00UW2DwIJb')