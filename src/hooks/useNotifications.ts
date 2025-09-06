import { useEffect, useState } from 'react';

interface NotificationState {
  permission: NotificationPermission;
  isSupported: boolean;
}

export const useNotifications = () => {
  const [notificationState, setNotificationState] = useState<NotificationState>({
    permission: 'default',
    isSupported: 'Notification' in window
  });

  useEffect(() => {
    if ('Notification' in window) {
      setNotificationState(prev => ({
        ...prev,
        permission: Notification.permission
      }));
    }
  }, []);

  const requestPermission = async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    const permission = await Notification.requestPermission();
    setNotificationState(prev => ({ ...prev, permission }));
    
    return permission === 'granted';
  };

  const sendNotification = (title: string, options?: NotificationOptions) => {
    if (notificationState.permission === 'granted') {
      new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options
      });
    }
  };

  const sendSOSNotification = (emergencyType: string, location?: string) => {
    sendNotification(`🚨 ${emergencyType} Emergency Alert`, {
      body: location ? `Emergency at ${location}` : 'Emergency assistance needed',
      requireInteraction: true,
      tag: 'sos-alert'
    });
  };

  const sendVolunteerNotification = (emergencyType: string, distance: string) => {
    sendNotification(`🆘 Volunteer Needed`, {
      body: `${emergencyType} emergency ${distance} away needs your help`,
      requireInteraction: true,
      tag: 'volunteer-request'
    });
  };

  return {
    ...notificationState,
    requestPermission,
    sendNotification,
    sendSOSNotification,
    sendVolunteerNotification
  };
};