import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useStripe, useElements, CardElement, Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import './CheckoutPage.css';
import axios from 'axios';

const stripePromise = loadStripe('pk_test_51QCOOVCxGoKhLvP8Sjh1FsYSvDxyEJXbUViZ02vY9fGJT0t97r2hpmv1qdp0415yehPRbEtGSfQ8d9JQlRafzxwN00UW2DwIJb'); // Replace with your Stripe publishable key

const CheckoutPage = () => {
    const { state } = useLocation();
    const { cartItems = [], totalAmount = 0 } = state || {};
    const buyer_id = state?.buyer_id || 'default_buyer_id_for_testing';
    const stripe = useStripe();
    const elements = useElements();
    const [clientSecret, setClientSecret] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (totalAmount > 0) {
            axios.post('https://ee23a926-c235-476f-bc72-c44c89de4608-00-3suz77jp7z7v7.sisko.replit.dev/create-payment-intent', { totalAmount, buyer_id, item_id: cartItems[0]?.item_id })
                .then((response) => {
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

        setIsProcessing(true);

        const cardElement = elements.getElement(CardElement);
        const { paymentIntent, error } = await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
                card: cardElement,
            },
        });

        if (error) {
            console.error('Payment failed: ', error);
            setIsProcessing(false);
        } else if (paymentIntent.status === 'succeeded') {
            const orderDetails = {
                buyer_id: buyer_id,
                cartItems: cartItems.map((item) => ({
                    item_id: item.item_id,
                    price: item.price,
                    quantity: item.quantity,
                })),
                totalAmount: totalAmount,
            };

            try {
                await axios.post('https://ee23a926-c235-476f-bc72-c44c89de4608-00-3suz77jp7z7v7.sisko.replit.dev/insert-order', orderDetails);
                navigate('/order-confirmation', { state: { cartItems, totalAmount } });
            } catch (err) {
                console.error('Error saving order to the database: ', err.response?.data || err.message);
                alert('Failed to save order: ' + (err.response?.data?.error || err.message));
            } finally {
                setIsProcessing(false);
            }
        }
    };

    return (
        <div className="checkout-page-container">
            <h1>Checkout</h1>

            {/* Order Summary Section */}
            <div className="order-summary">
                <h2>Summary of Items</h2>
                {cartItems.length === 0 ? (
                    <p>No items in your cart.</p>
                ) : (
                    cartItems.map((item) => (
                        <div key={item.item_id} className="checkout-item">
                            <img src={item.image_url} alt={item.item_name} className="checkout-item-image" />
                            <div className="checkout-item-details">
                                <p className="checkout-item-name">{item.item_name}</p>
                                <p className="checkout-item-price">Price: ${item.price}</p>
                                <p className="checkout-item-quantity">Quantity: {item.quantity}</p>
                            </div>
                        </div>
                    ))
                )}
                <h2 className="checkout-total">Total: ${totalAmount.toFixed(2)}</h2>
            </div>

            {/* Payment Form Section */}
            <form onSubmit={handlePayment} className="checkout-form">
                <label>Card Information</label>
                <CardElement className="card-element" />

                <label>Cardholder Name</label>
                <input
                    type="text"
                    placeholder="Full name on card"
                    required
                    className="input-cardholder-name"
                    autoComplete="off"
                />

                <button type="submit" disabled={!stripe || isProcessing} className="checkout-pay-button">
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




//'https://ee23a926-c235-476f-bc72-c44c89de4608-00-3suz77jp7z7v7.sisko.replit.dev/'

// stripe publishable key:'pk_test_51QCOOVCxGoKhLvP8Sjh1FsYSvDxyEJXbUViZ02vY9fGJT0t97r2hpmv1qdp0415yehPRbEtGSfQ8d9JQlRafzxwN00UW2DwIJb'