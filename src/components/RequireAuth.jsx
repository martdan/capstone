// src/components/RequireAuth.js
import React from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';
import { Navigate } from 'react-router-dom';

const RequireAuth = ({ children }) => {
    const [user] = useAuthState(auth);

    if (!user) {
        return <Navigate to="/" />;
    }

    return children;
};

export default RequireAuth;
