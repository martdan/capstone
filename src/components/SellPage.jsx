import React, { useState, useEffect } from 'react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';  // Firebase storage setup
import axios from 'axios';
import './SellPage.css';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';

const SellPage = () => {
    const [itemName, setItemName] = useState('');
    const [price, setPrice] = useState('');
    const [image, setImage] = useState(null);  // For the file object
    const [imageUrl, setImageUrl] = useState('');  // For the uploaded image URL
    const [uploading, setUploading] = useState(false);  // Track upload status
    const [userItems, setUserItems] = useState([]);  // Store items listed by the current user
    const [isEditing, setIsEditing] = useState(false);
    const [editItemId, setEditItemId] = useState(null);
    const [user] = useAuthState(auth);  // Firebase Authentication
    const userId = user?.uid;  // Firebase user ID

    // Fetch items listed by the current user
    useEffect(() => {
        if (userId) {
            axios.get(`https://298340b2-aa0c-4e4f-b71d-d1510816be54-00-2p830g929ktk4.pike.replit.dev/user-items?user_id=${userId}`)  // Pass user_id as query param
                .then((response) => {
                    setUserItems(response.data);
                })
                .catch((error) => {
                    console.error('Error fetching user items: ', error);
                });
        }
    }, [userId]);

    const handleImageChange = (e) => {
        setImage(e.target.files[0]);  // Set the file object
    };

    const handleUpload = (e) => {
        e.preventDefault();  // Prevent the default form behavior
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
                    setImageUrl(downloadURL);  // Save the image URL after upload
                    setUploading(false);
                    console.log('Image uploaded successfully: ', downloadURL);
                });
            }
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!imageUrl) {
            alert("Please upload an image first.");
            return;
        }

        const newItem = {
            item_name: itemName,
            price: parseFloat(price),
            image_url: imageUrl,
            user_id: userId  // Include the user_id when adding an item
        };

        try {
            if (isEditing) {
                await axios.put(`https://298340b2-aa0c-4e4f-b71d-d1510816be54-00-2p830g929ktk4.pike.replit.dev/items/${editItemId}`, newItem);
                alert('Item updated successfully!');
                setIsEditing(false);
                setEditItemId(null);
                setUserItems((prevItems) =>
                    prevItems.map(item =>
                        item.item_id === editItemId ? { ...item, ...newItem } : item
                    )
                );
            } else {
                const response = await axios.post('https://298340b2-aa0c-4e4f-b71d-d1510816be54-00-2p830g929ktk4.pike.replit.dev/items', newItem);
                alert('Item added successfully!');
                setUserItems([...userItems, response.data]);
            }

            // Reset form fields
            setItemName('');
            setPrice('');
            setImage(null);
            setImageUrl('');
        } catch (error) {
            console.error('Error adding item: ', error);  // Add this to log the error
            alert('Error adding item: ' + (error.response ? error.response.data : error.message));
        }
    };

    // Handle item deletion
    const handleDelete = async (item_id) => {
        try {
            await axios.delete(`https://298340b2-aa0c-4e4f-b71d-d1510816be54-00-2p830g929ktk4.pike.replit.dev/items/${item_id}`);
            alert('Item deleted successfully!');
            setUserItems(userItems.filter((item) => item.item_id !== item_id));
        } catch (error) {
            console.error('Error deleting item:', error);
        }
    };

    // Handle editing an existing item
    const handleEdit = (item) => {
        setItemName(item.item_name);
        setPrice(item.price);
        setImageUrl(item.image_url);
        setIsEditing(true);
        setEditItemId(item.item_id);
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
                    Upload Image:
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
                {userItems.length === 0 ? (
                    <p>No items listed.</p>
                ) : (
                    userItems.map((item) => (
                        <div key={item.item_id} className="item-card">
                            <img src={item.image_url} alt={item.item_name} />
                            <h3>{item.item_name}</h3>
                            <p>Price: ${item.price}</p>
                            <button onClick={() => handleEdit(item)}>Edit</button>
                            <button onClick={() => handleDelete(item.item_id)}>Delete</button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default SellPage;



//https://298340b2-aa0c-4e4f-b71d-d1510816be54-00-2p830g929ktk4.pike.replit.dev