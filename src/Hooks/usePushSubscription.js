import { useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../Constants';

const publicVapidKey = import.meta.env.VITE_VAPID_KEY; 
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

export default function usePushSubscription(userId) {
  useEffect(() => {
    if (!userId) return;

    async function subscribeUser() {
      try {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') return;
        const register = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
        let subscription = await register.pushManager.getSubscription();
        if (!subscription) {
          subscription = await register.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
          });
        }
        await axios.post(`${API_BASE_URL}notifications/subscribe`, {
          userId,
          subscription
        });
        console.log('User subscribed to push notifications successfully.');
      } catch (err) {
        console.error('Push Subscription Error:', err);
      }
    }

    subscribeUser();
  }, [userId]);
}
