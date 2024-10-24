// src/components/ShoppingPage.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';  // For fetching data
import './ShoppingPage.css';  // Optional for styling
import { useAuthState } from 'react-firebase-hooks/auth'; // Assuming you're using Firebase for auth
import { auth } from '../firebase'; // Adjust the path as needed

const ShoppingPage = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [user] = useAuthState(auth); // Firebase user authentication

    // Fetch items from backend
    useEffect(() => {
        axios.get('https://298340b2-aa0c-4e4f-b71d-d1510816be54-00-2p830g929ktk4.pike.replit.dev/items')  // Replace with your actual API URL
            .then((response) => {
                setItems(response.data);
                setLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching items: ', error);
                setError('Failed to fetch items');
                setLoading(false);
            });
    }, []);

    const handleAddToCart = (item) => {
        if (!user) {
            alert("Please log in to add items to your cart.");
            return;
        }

        const cartItem = {
            user_id: user.uid, // Use the authenticated user's ID
            item_id: item.item_id,
            price: item.price,
            quantity: 1 // Assuming each addition to the cart is for 1 quantity
        };

        axios.post('https://298340b2-aa0c-4e4f-b71d-d1510816be54-00-2p830g929ktk4.pike.replit.dev/cart', cartItem)
            .then(() => alert(`${item.item_name} added to cart!`))
            .catch((error) => {
                console.error('Error adding to cart: ', error);
                alert('Failed to add item to cart');
            });
    };

    if (loading) {
        return <p>Loading items...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    return (
        <div className="shopping-container">
            <h1>Sports Items for Sale</h1>
            <div className="items-grid">
                {items.map((item) => (
                    <div className="item-card" key={item.item_id}>
                        <img src={item.image_url} alt={item.item_name} className="item-image" />
                        <h3>{item.item_name}</h3>
                        <p>Price: ${item.price}</p>
                        <button onClick={() => handleAddToCart(item)}>Add to Cart</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ShoppingPage;


//https://298340b2-aa0c-4e4f-b71d-d1510816be54-00-2p830g929ktk4.pike.replit.dev/items
