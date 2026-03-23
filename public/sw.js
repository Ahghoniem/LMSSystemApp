self.addEventListener('push', event => {
    const data = event.data.json();
    self.registration.showNotification(data.title, {
        body: data.body,
        icon: './WhatsApp Image 2025-10-16 at 12.00.17 PM.jpeg'
    });
});
