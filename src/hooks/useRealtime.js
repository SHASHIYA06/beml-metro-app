import { useState, useEffect } from 'react';
import { supabaseService } from '../services/supabase';

export function useRealtime(user) {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!user) return;

    // Subscribe to entries
    const entriesSubscription = supabaseService.subscribeToEntries((payload) => {
      handleNotification(payload);
    });

    // Subscribe to documents
    const docsSubscription = supabaseService.subscribeToDocuments((payload) => {
      handleNotification(payload);
    });

    return () => {
      entriesSubscription.unsubscribe();
      docsSubscription.unsubscribe();
    };
  }, [user]);

  const handleNotification = (payload) => {
    const notification = {
      id: Date.now(),
      type: payload.eventType,
      data: payload.new || payload.old,
      timestamp: new Date()
    };

    setNotifications(prev => [notification, ...prev].slice(0, 10));

    // Show browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('BEML Metro Update', {
        body: getNotificationMessage(notification),
        icon: '/logo.png'
      });
    }
  };

  const getNotificationMessage = (notification) => {
    switch (notification.type) {
      case 'INSERT':
        return 'New work entry submitted';
      case 'UPDATE':
        return 'Entry status updated';
      case 'DELETE':
        return 'Entry deleted';
      default:
        return 'New update available';
    }
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  return { notifications, clearNotifications };
}
