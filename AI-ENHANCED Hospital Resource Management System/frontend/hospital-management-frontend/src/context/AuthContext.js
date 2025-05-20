// src/context/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import axios from '../services/api';
import { jwtDecode } from 'jwt-decode'; // Fixed import statement
import socketService from '../services/socketService';
import { toast } from 'react-toastify';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    // Check if token exists and is valid
    if (token) {
      try {
        const decoded = jwtDecode(token); // Updated function call
        const currentTime = Date.now() / 1000;
        
        if (decoded.exp < currentTime) {
          // Token expired
          logout();
        } else {
          // Set auth token header
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          loadUser();
          
          // Connect to socket when token is valid
          socketService.connect(token);
        }
      } catch (error) {
        console.error('Invalid token:', error);
        logout();
      }
    } else {
      setIsLoading(false);
    }
    
    // Cleanup socket connection on unmount
    return () => {
      socketService.disconnect();
    };
  }, [token]);

  // Load user data from token
  const loadUser = async () => {
    try {
      const res = await axios.get('/auth/me');
      if (res.data.success) {
        setUser(res.data.data);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading user:', error);
      logout();
    }
  };

  // Login user
  const login = async (email, password) => {
    try {
      setIsLoading(true);
      const res = await axios.post('/auth/login', { email, password });
      
      if (res.data.success) {
        const { token, user } = res.data;
        
        localStorage.setItem('token', token);
        setToken(token);
        setUser(user);
        setIsAuthenticated(true);
        
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Connect to socket after successful login
        socketService.connect(token);
        
        toast.success('Login successful');
        setIsLoading(false);
        return { success: true, user };
      } else {
        setIsLoading(false);
        toast.error(res.data.error || 'Login failed');
        return { success: false, message: res.data.error || 'Login failed' };
      }
    } catch (error) {
      setIsLoading(false);
      console.error('Login error:', error);
      toast.error(error.message || 'Login failed');
      return { 
        success: false, 
        message: error.message || 'Login failed' 
      };
    }
  };

  // Register user
  const register = async (userData) => {
    try {
      setIsLoading(true);
      const res = await axios.post('/auth/register', userData);
      
      if (res.data.success) {
        const { token, user } = res.data;
        
        localStorage.setItem('token', token);
        setToken(token);
        setUser(user);
        setIsAuthenticated(true);
        
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Connect to socket after successful registration
        socketService.connect(token);
        
        toast.success('Registration successful');
        setIsLoading(false);
        return { success: true, user };
      } else {
        setIsLoading(false);
        toast.error(res.data.error || 'Registration failed');
        return { success: false, message: res.data.error || 'Registration failed' };
      }
    } catch (error) {
      setIsLoading(false);
      console.error('Registration error:', error);
      toast.error(error.message || 'Registration failed');
      return { 
        success: false, 
        message: error.message || 'Registration failed' 
      };
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    setIsLoading(false);
    
    // Disconnect socket on logout
    socketService.disconnect();
    
    toast.info('You have been logged out');
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoading,
      login,
      register,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};