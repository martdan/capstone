import React, { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // Import axios to make API requests to your backend
import { useAuthState } from 'react-firebase-hooks/auth'; // For checking auth state
import { auth } from '../firebase'; // Firebase auth import
import Navbar from './Navbar'; // Import Navbar
import './AuthPage.css'
import logo from './logo.png'
import background from './sport background.png'

const AuthPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLogin, setIsLogin] = useState(true); // Toggle between login and sign-up
    const [errorMessage, setErrorMessage] = useState(''); // State to store error messages
    const [user, loading] = useAuthState(auth); // Track user authentication status
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isLogin) {
            // Login the user
            signInWithEmailAndPassword(auth, email, password)
                .then(() => {
                    navigate('/shopping'); // Redirect to shopping page after login
                })
                .catch((error) => {
                    setErrorMessage(error.message);
                    console.error("Error logging in: ", error);
                });
        } else {
            // Sign up the user
            createUserWithEmailAndPassword(auth, email, password)
                .then((userCredential) => {
                    const user = userCredential.user;
                    console.log("User signed up successfully:", user);

                    // Send user data to backend to add to NeonSQL database
                    axios.post('https://ee23a926-c235-476f-bc72-c44c89de4608-00-3suz77jp7z7v7.sisko.replit.dev/people', {
                        firebase_uid: user.uid,   // Firebase UID
                        email: user.email,        // User email
                        name: user.displayName    // You can add user display name if available
                    }).then(() => {
                        console.log("User added to NeonSQL database");

                        // Sign the user out after successful sign-up and database insertion
                        auth.signOut().then(() => {
                            console.log("User signed out after sign-up");
                            setIsLogin(true); // Switch to login view after sign-up
                            navigate('/');    // Redirect to login page after sign-out
                        });
                    }).catch((error) => {
                        console.error("Error adding user to the database: ", error);
                        setErrorMessage("Error adding user to the database.");
                    });
                })
                .catch((error) => {
                    setErrorMessage(error.message);
                    console.error("Error signing up: ", error);
                });
        }
    };

    if (loading) {
        return <p>Loading...</p>; // Show a loading state while Firebase checks the authentication state
    }

    return (
        <div>
            {user ? <Navbar /> : null} {/* Show Navbar only if the user is logged in */}
            <div className="auth-page" style={{ backgroundImage: `url(${background})` }}>
                <div className="auth-header">
                    <img src={logo} alt="Sport Mart Logo" className="auth-logo" />
                </div>
                <div className="auth-container">
                    <h1>{isLogin ? "Login" : "Sign Up"}</h1>
                    <form onSubmit={handleSubmit}>
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <button type="submit">{isLogin ? "Login" : "Sign Up"}</button>
                    </form>

                    {errorMessage && <p className="error-message">{errorMessage}</p>} {/* Display error messages */}

                    <button onClick={() => setIsLogin(!isLogin)} className="toggle-button">
                        {isLogin ? "Create an account" : "Already have an account? Login"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;


//https://298340b2-aa0c-4e4f-b71d-d1510816be54-00-2p830g929ktk4.pike.replit.dev