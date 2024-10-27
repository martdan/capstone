import React, { useState, useEffect } from 'react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';  // Firebase storage setup
import axios from 'axios';
import './SellPage.css';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';
import './SellPage.css'

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

    // Debugging: Log userId
    useEffect(() => {
        console.log("User ID:", userId);  // Ensure the userId is properly set
    }, [userId]);

    // Fetch items listed by the current user
    useEffect(() => {
        if (userId) {
            axios.get(`https://ee23a926-c235-476f-bc72-c44c89de4608-00-3suz77jp7z7v7.sisko.replit.dev/user-items?user_id=${userId}`)  // Pass user_id as query param
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
        e.preventDefault();
        if (!image) {
            alert("Please select an image before uploading.");
            return;
        }

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
                alert("Error uploading image. Please try again.");
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
            user_id: userId // Ensure the user_id when adding an item is valid
        };

        try {
            if (isEditing) {
                await axios.put(`https://ee23a926-c235-476f-bc72-c44c89de4608-00-3suz77jp7z7v7.sisko.replit.dev/items/${editItemId}`, newItem);
                alert('Item updated successfully!');
                setIsEditing(false);
                setEditItemId(null);
                setUserItems((prevItems) =>
                    prevItems.map(item => item.item_id === editItemId ? { ...item, ...newItem } : item)
                );
            } else {
                const response = await axios.post('https://ee23a926-c235-476f-bc72-c44c89de4608-00-3suz77jp7z7v7.sisko.replit.dev/items', newItem);
                alert('Item added successfully!');
                setUserItems([...userItems, response.data]);
            }

            // Reset form fields
            setItemName('');
            setPrice('');
            setImage(null);
            setImageUrl('');
        } catch (error) {
            // Improved error handling
            console.error('Error adding item:', error?.response?.data || error.message);

            // Show a more descriptive error alert
            const errorMessage = error.response?.data?.error || error.message || 'Unknown error occurred';
            alert('Error adding item: ' + errorMessage);
        }
    };


    // Handle item deletion
    const handleDelete = async (item_id) => {
        try {
            await axios.delete(`https://ee23a926-c235-476f-bc72-c44c89de4608-00-3suz77jp7z7v7.sisko.replit.dev/items/${item_id}`);
            alert('Item deleted successfully!');
            setUserItems(userItems.filter((item) => item.item_id !== item_id));
        } catch (error) {
            console.error('Error deleting item:', error);
            alert('Error deleting item: ' + (error.response ? error.response.data : error.message));
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
        <div className="sell-page-wrapper">
            <h1 className={isEditing ? "form-heading-edit" : "form-heading-sell"}>
                {isEditing ? "Edit Item" : "Sell a Sports Item"}
            </h1>
            <form onSubmit={handleSubmit} className="sitem-sell-form">
                <label className="form-label">
                    Product Title:
                    <input
                        type="text"
                        value={itemName}
                        onChange={(e) => setItemName(e.target.value)}
                        required
                        className="input-product-title"
                    />
                </label>

                <label className="form-label">
                    Price:
                    <input
                        type="number"
                        step="0.01"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        required
                        className="input-price"
                    />
                </label>

                <label className="form-label">
                    Upload Image:
                    <input type="file" onChange={handleImageChange} className="input-upload" />
                    <button onClick={handleUpload} disabled={uploading} className="button-upload">
                        {uploading ? "Uploading..." : "Upload Image"}
                    </button>
                </label>

                {imageUrl && <img src={imageUrl} alt="Uploaded" className="preview-uploaded-image" />}

                <button type="submit" disabled={uploading || !imageUrl} className="button-submit">
                    {isEditing ? "Update Item" : "Add Item"}
                </button>
            </form>

            <h2 className="listed-items-heading">Your Listed Items</h2>
            <div className="listed-items-grid">
                {userItems.length === 0 ? (
                    <p className="no-items-message">No items listed.</p>
                ) : (
                    userItems.map((item) => (
                        <div key={item.item_id} className="listed-item-card">
                            <img src={item.image_url} alt={item.item_name} className="listed-item-image" />
                            <h3 className="listed-item-title">{item.item_name}</h3>
                            <p className="listed-item-price">Price: ${item.price}</p>
                            <button onClick={() => handleEdit(item)} className="button-edit">Edit</button>
                            <button onClick={() => handleDelete(item.item_id)} className="button-delete">Delete</button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default SellPage;




//https://ee23a926-c235-476f-bc72-c44c89de4608-00-3suz77jp7z7v7.sisko.replit.dev/