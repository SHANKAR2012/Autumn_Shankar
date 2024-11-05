import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ component: Component, requiredRole }) => {
  const token = localStorage.getItem('access_token');
   // Assuming you store the user's role in localStorage after login

  // Check if the user is authenticated (token is present) and if their role matches the required role
  if (!token) {
    return <Navigate to="/login" />;
  }

  if (requiredRole ) {
    return <Navigate to="/unauthorized" />;  // Redirect to an unauthorized page or error page
  }

  return <Component />;
};

export default ProtectedRoute;