import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching'
import { clientsClaim } from 'workbox-core'
import { registerRoute } from 'workbox-routing';

declare let self: ServiceWorkerGlobalScope;

self.skipWaiting()
clientsClaim()


cleanupOutdatedCaches()
precacheAndRoute(self.__WB_MANIFEST)

function sleepMs(time: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, time));
}

async function getClientById(clientId: string, abortSignal: AbortSignal): Promise<Client | undefined> {
    while (!abortSignal.aborted) {
        const client = await self.clients.get(clientId);
        if (client) {
            return client;
        }
        await sleepMs(250);
    }
    return undefined;
}

async function sendImageToWebApp(file: File, clientId: string) {
    // todo handle clientid == '' see https://developer.mozilla.org/en-US/docs/Web/API/FetchEvent/resultingClientId
    const abort = AbortSignal.timeout(15_000);
    const client = await getClientById(clientId, abort);
    if (!client) {
        console.warn('Client not found:', clientId);
        return;
    }

    console.log('Sending image to client:', client);
    client.postMessage({ type: 'image_shared', file });
}


async function handleShareTarget(request: Request, event: FetchEvent) {
    console.log('Handling share target request:', request.url, event);
    const formData = await request.formData();



    const file = formData.get('image');
    if (!(file instanceof File)) {
        return new Response('Invalid file', { status: 400 });
    }

    if (!file.type.startsWith('image/')) {
        return new Response('File is not an image', { status: 400 });
    }

    console.log('Received image file:', file.name, file.size, file.type);
    event.waitUntil(sendImageToWebApp(file, event.resultingClientId));
    return Response.redirect(request.url.replace('/share-target', ''), 303);// https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest/Reference/share_target
}

registerRoute(
    ({ request }) => request.url.endsWith('/share-target'),
    async ({ event, request }) => handleShareTarget(request, event as FetchEvent),
    'POST');
