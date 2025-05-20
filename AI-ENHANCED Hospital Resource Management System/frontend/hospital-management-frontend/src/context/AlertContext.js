// src/context/AlertContext.js
import React, { createContext, useState, useEffect } from 'react';
import socketService from '../services/socketService';
import { getAlerts, acknowledgeAlert, markAsRead, markAllAsRead } from '../services/alertService';
import { toast } from 'react-toastify';

export const AlertContext = createContext();

export const AlertProvider = ({ children }) => {
  const [alerts, setAlerts] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch active alerts when component mounts
    const fetchAlerts = async () => {
      try {
        setLoading(true);
        const response = await getAlerts({ status: 'Active' });
        if (response.data.success) {
          setAlerts(response.data.data);
          setUnreadCount(response.data.data.filter(alert => !alert.read).length);
        } else {
          setError('Failed to fetch alerts');
          toast.error('Failed to fetch alerts');
        }
        setLoading(false);
      } catch (error) {
        setError('Failed to fetch alerts');
        console.error('Error fetching alerts:', error);
        setLoading(false);
      }
    };

    fetchAlerts();

    // Listen for new alerts
    socketService.on('new-alert', handleNewAlert);
    socketService.on('alert-updated', handleAlertUpdate);

    return () => {
      socketService.off('new-alert', handleNewAlert);
      socketService.off('alert-updated', handleAlertUpdate);
    };
  }, []);

  // Handle new alert
  const handleNewAlert = ({ alert }) => {
    setAlerts((prevAlerts) => [alert, ...prevAlerts]);
    if (!alert.read) {
      setUnreadCount((prevCount) => prevCount + 1);
    }
    
    // Play sound or show notification
    const audio = new Audio('/notification.mp3');
    audio.play().catch(e => console.log('Error playing notification sound', e));
    
    toast.info(`New Alert: ${alert.title}`, {
      position: "top-right",
      autoClose: 5000,
    });
  };

  // Handle alert update
  const handleAlertUpdate = ({ alert }) => {
    setAlerts((prevAlerts) =>
      prevAlerts.map((a) => {
        if (a._id === alert._id) {
          // If it was changing from unread to read, update the counter
          if (!a.read && alert.read) {
            setUnreadCount((prevCount) => Math.max(0, prevCount - 1));
          }
          return alert;
        }
        return a;
      })
    );
    
    if (alert.status === 'Resolved') {
      toast.success(`Alert resolved: ${alert.title}`);
    }
  };

  // Mark alert as read
  const handleMarkAsRead = async (alertId) => {
    try {
      const response = await markAsRead(alertId);
      if (response.data.success) {
        setAlerts((prevAlerts) =>
          prevAlerts.map((alert) =>
            alert._id === alertId ? { ...alert, read: true } : alert
          )
        );
        setUnreadCount((prevCount) => Math.max(0, prevCount - 1));
      } else {
        toast.error('Failed to mark alert as read');
      }
    } catch (error) {
      console.error('Error marking alert as read:', error);
      toast.error('Error marking alert as read');
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      const response = await markAllAsRead();
      if (response.data.success) {
        setAlerts((prevAlerts) =>
          prevAlerts.map((alert) => ({ ...alert, read: true }))
        );
        setUnreadCount(0);
        toast.success('All alerts marked as read');
      } else {
        toast.error('Failed to mark all alerts as read');
      }
    } catch (error) {
      console.error('Error marking all alerts as read:', error);
      toast.error('Error marking all alerts as read');
    }
  };

  // Acknowledge alert
  const handleAcknowledgeAlert = async (alertId) => {
    try {
      const response = await acknowledgeAlert(alertId);
      if (response.data.success) {
        socketService.emit('acknowledge-alert', { alertId });
        setAlerts((prevAlerts) =>
          prevAlerts.map((alert) =>
            alert._id === alertId ? { ...alert, status: 'Acknowledged' } : alert
          )
        );
        toast.success('Alert acknowledged');
      } else {
        toast.error('Failed to acknowledge alert');
      }
    } catch (error) {
      console.error('Error acknowledging alert:', error);
      toast.error('Error acknowledging alert');
    }
  };

  return (
    <AlertContext.Provider
      value={{
        alerts,
        unreadCount,
        loading,
        error,
        markAsRead: handleMarkAsRead,
        markAllAsRead: handleMarkAllAsRead,
        acknowledgeAlert: handleAcknowledgeAlert
      }}
    >
      {children}
    </AlertContext.Provider>
  );
};