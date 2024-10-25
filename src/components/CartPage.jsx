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
    const userId = user?.uid;

    useEffect(() => {
        console.log("User ID:", userId);  // Debugging log for userId

        if (user) {
            console.log("Fetching cart data for user:", user.uid);  // Debugging log
            // Fetch cart items for the authenticated user
            axios.get(`https://298340b2-aa0c-4e4f-b71d-d1510816be54-00-2p830g929ktk4.pike.replit.dev/cart/${userId}`)  // Replace with your actual backend API URL
                .then((response) => {
                    console.log("Cart Data:", response.data);  // Log the cart data response
                    setCartItems(response.data);  // Set the cart items from the response
                    calculateTotal(response.data);  // Calculate total amount
                })
                .catch((error) => {
                    console.error('Error fetching cart items: ', error);
                });
        } else {
            console.warn("User not logged in, unable to fetch cart data.");
        }
    }, [userId]);  // Only re-fetch when `userId` changes

    // Calculate total amount based on cart items
    const calculateTotal = (items) => {
        const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
        setTotalAmount(total);  // Set the total amount to be displayed
    };

    // Handle item deletion from cart
    const handleDelete = (cart_id) => {
        axios.delete(`https://298340b2-aa0c-4e4f-b71d-d1510816be54-00-2p830g929ktk4.pike.replit.dev/cart/${cart_id}`)  // Replace with your actual backend API URL
            .then((response) => {
                console.log("Item deleted:", response.data);
                // Remove the item from the local cart state after deletion
                const updatedCartItems = cartItems.filter(item => item.cart_id !== cart_id);
                setCartItems(updatedCartItems);
                calculateTotal(updatedCartItems);  // Recalculate the total amount
            })
            .catch((error) => {
                console.error('Error deleting item: ', error);
            });
    };

    const handleCheckout = () => {
        if (!userId) {
            alert('Please log in before checking out.');  // Handle case where the user is not logged in
            return;
        }

        console.log("Proceeding to checkout with cart items:", cartItems, "Total Amount:", totalAmount);

        // Navigate to the checkout page with cartItems, totalAmount, and buyer_id (userId)
        navigate('/checkout', {
            state: {
                buyer_id: userId,  // Assuming you have userId available
                cartItems: cartItems,
                totalAmount: totalAmount
            }
        });
    };

    if (!userId) {
        return <p>Please log in to view your cart.</p>;  // Handle the case where the user is not logged in
    }

    // Return the cart page content
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
                            <button onClick={() => handleDelete(item.cart_id)}>Delete</button>  {/* Delete button */}
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