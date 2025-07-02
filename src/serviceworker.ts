import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching'
import { clientsClaim } from 'workbox-core'
import { registerRoute } from 'workbox-routing';

declare let self: ServiceWorkerGlobalScope;

self.skipWaiting()
clientsClaim()


cleanupOutdatedCaches()
precacheAndRoute(self.__WB_MANIFEST)



async function handleShareTarget(request: Request, event: FetchEvent) {
    const formData = await request.formData();

    const file = formData.get('image');
    if (!(file instanceof File)) {
        return new Response('Invalid file', { status: 400 });
    }

    if (!file.type.startsWith('image/')) {
        return new Response('File is not an image', { status: 400 });
    }

    console.log('Received image file:', file.name, file.size, file.type);

    event.waitUntil(self.clients.matchAll({ includeUncontrolled: true, type: 'window' }).then(clients => {

        return Promise.all(clients.map(async client => {
            await new Promise(resolve => setTimeout(resolve, 5_000)); // Wait for 1 second to ensure the client is ready

            if (client.visibilityState === 'visible') {
                await client.focus();
            }
            return client.postMessage({ type: 'image_shared', file });
        }));
    }));

    return Response.redirect(request.url.replace('/share-target', ''), 303);// https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest/Reference/share_target
}

registerRoute(
    ({ request }) => request.url.endsWith('/share-target'),
    async ({ event, request }) => handleShareTarget(request, event as FetchEvent), 'POST');
