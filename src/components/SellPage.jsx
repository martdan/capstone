// src/components/SellPage.jsx
import React, { useState, useEffect } from 'react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';  // Firebase storage
import axios from 'axios';
import './SellPage.css';

const SellPage = () => {
    const [itemName, setItemName] = useState('');
    const [price, setPrice] = useState('');
    const [image, setImage] = useState(null);
    const [imageUrl, setImageUrl] = useState('');
    const [uploading, setUploading] = useState(false);
    const [userItems, setUserItems] = useState([]);  // Stores items listed by the current user
    const [isEditing, setIsEditing] = useState(false);
    const [editItemId, setEditItemId] = useState(null);

    // Fetch items listed by the current user
    useEffect(() => {
        axios.get('https://298340b2-aa0c-4e4f-b71d-d1510816be54-00-2p830g929ktk4.pike.replit.dev/user-items')  // Replace with your actual API URL for user-specific items
            .then((response) => {
                setUserItems(response.data);
            })
            .catch((error) => {
                console.error('Error fetching user items: ', error);
            });
    }, []);

    const handleImageChange = (e) => {
        setImage(e.target.files[0]);
    };

    const handleUpload = (e) => {
        e.preventDefault();
        if (!image) return;

        const storageRef = ref(storage, `images/${image.name}`);
        const uploadTask = uploadBytesResumable(storageRef, image);

        setUploading(true);
        uploadTask.on('state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log('Upload is ' + progress + '% done');
            },
            (error) => {
                console.error('Error uploading image: ', error);
                setUploading(false);
            },
            () => {
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    setImageUrl(downloadURL);
                    setUploading(false);
                    console.log('Image uploaded successfully: ', downloadURL);
                });
            }
        );
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const newItem = {
            item_name: itemName,
            price: parseFloat(price),
            image_url: imageUrl
        };

        if (isEditing) {
            axios.put(`https://298340b2-aa0c-4e4f-b71d-d1510816be54-00-2p830g929ktk4.pike.replit.dev/items/${editItemId}`, newItem)
                .then(() => {
                    alert('Item updated successfully!');
                    setIsEditing(false);
                    setEditItemId(null);
                    // Update item list after editing
                    setUserItems((prevItems) =>
                        prevItems.map(item =>
                            item.item_id === editItemId ? { ...item, ...newItem } : item
                        )
                    );
                })
                .catch(error => {
                    console.error('Error updating item: ', error);
                });
        } else {
            axios.post('https://298340b2-aa0c-4e4f-b71d-d1510816be54-00-2p830g929ktk4.pike.replit.dev/items', newItem)
                .then((response) => {
                    alert('Item added successfully!');
                    setUserItems([...userItems, response.data]);
                })
                .catch((error) => {
                    console.error('Error adding item: ', error);
                });
        }

        // Reset form
        setItemName('');
        setPrice('');
        setImage(null);
        setImageUrl('');
    };

    const handleEdit = (item) => {
        setItemName(item.item_name);
        setPrice(item.price);
        setImageUrl(item.image_url);
        setIsEditing(true);
        setEditItemId(item.item_id);
    };

    const handleDelete = (item_id) => {
        axios.delete(`https://298340b2-aa0c-4e4f-b71d-d1510816be54-00-2p830g929ktk4.pike.replit.dev/items/${item_id}`)
            .then(() => {
                alert('Item deleted successfully!');
                setUserItems(userItems.filter((item) => item.item_id !== item_id));
            })
            .catch((error) => {
                console.error('Error deleting item: ', error);
            });
    };

    return (
        <div className="sell-container">
            <h1>{isEditing ? "Edit Item" : "Sell a Sports Item"}</h1>
            <form onSubmit={handleSubmit} className="sell-form">
                <label>
                    Item Name:
                    <input
                        type="text"
                        value={itemName}
                        onChange={(e) => setItemName(e.target.value)}
                        required
                    />
                </label>

                <label>
                    Price:
                    <input
                        type="number"
                        step="0.01"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        required
                    />
                </label>

                <label>
                    Image:
                    <input type="file" onChange={handleImageChange} />
                    <button onClick={handleUpload} disabled={uploading}>
                        {uploading ? "Uploading..." : "Upload Image"}
                    </button>
                </label>

                {imageUrl && <img src={imageUrl} alt="Uploaded" className="uploaded-image" />}

                <button type="submit" disabled={uploading || !imageUrl}>
                    {isEditing ? "Update Item" : "Add Item"}
                </button>
            </form>

            <h2>Your Listed Items</h2>
            <div className="user-items">
                {userItems.map((item) => (
                    <div key={item.item_id} className="item-card">
                        <img src={item.image_url} alt={item.item_name} />
                        <h3>{item.item_name}</h3>
                        <p>Price: ${item.price}</p>
                        <button onClick={() => handleEdit(item)}>Edit</button>
                        <button onClick={() => handleDelete(item.item_id)}>Delete</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SellPage;
