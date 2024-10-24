// src/components/AuthPage.jsx
import React, { useState } from 'react';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';

const AuthPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLogin, setIsLogin] = useState(true); // Toggle between login and sign-up
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();

        if (isLogin) {
            // Login the user
            signInWithEmailAndPassword(auth, email, password)
                .then(() => {
                    navigate('/shopping'); // Redirect to shopping page after login
                })
                .catch((error) => {
                    console.error("Error logging in: ", error);
                });
        } else {
            // Sign up the user
            createUserWithEmailAndPassword(auth, email, password)
                .then(() => {
                    // Sign the user out after sign up
                    auth.signOut().then(() => {
                        console.log("User signed up and logged out");
                        // Toggle to login view after signing up
                        setIsLogin(true);
                    });
                })
                .catch((error) => {
                    console.error("Error signing up: ", error);
                });
        }
    };

    return (
        <div>
            <h1>{isLogin ? "Login" : "Sign Up"}</h1>
            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button type="submit">{isLogin ? "Login" : "Sign Up"}</button>
            </form>
            <button onClick={() => setIsLogin(!isLogin)}>
                {isLogin ? "Create an account" : "Already have an account? Login"}
            </button>
        </div>
    );
};

export default AuthPage;

