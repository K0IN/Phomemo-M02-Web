import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching'
import { clientsClaim } from 'workbox-core'

declare let self: ServiceWorkerGlobalScope;

self.skipWaiting()
clientsClaim()


cleanupOutdatedCaches()
precacheAndRoute(self.__WB_MANIFEST)


self.addEventListener('fetch', event => {
    if (event.request.url.endsWith('/share-target') && event.request.method === 'POST') {
        event.respondWith(handleShareTarget(event.request));
    }
});

async function handleShareTarget(request: Request) {
    const formData = await request.formData();

    const file = formData.get('image');
    if (!(file instanceof File)) {
        return new Response('Invalid file', { status: 400 });
    }

    // Check if the file is an image
    if (!file.type.startsWith('image/')) {
        return new Response('File is not an image', { status: 400 });
    }

    // Process the image file as needed
    console.log('Received image file:', file.name, file.size, file.type);


    const allClients = await self.clients.matchAll({ includeUncontrolled: false, type: 'window' });
    for (const client of allClients) {
        client.postMessage({ type: 'image_shared', file });
    }

    return Response.redirect(request.url.replace('/share-target', ''), 303);// https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest/Reference/share_target
}
