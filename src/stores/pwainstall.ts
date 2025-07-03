import { useEventListener } from "@vueuse/core";
import { defineStore } from "pinia";
import { computed, ref } from "vue";


export const usePwaInstallStore = defineStore('pwaInstall', () => {
    function isCurrentInstanceStandalone() {
        return window.matchMedia('(display-mode: standalone)').matches;
    }

    const deferredPrompt = ref<BeforeInstallPromptEvent | null>(null);
    const isStandalone = ref<boolean>(isCurrentInstanceStandalone());

    useEventListener(window, "beforeinstallprompt", (event) => {
        event.preventDefault();
        deferredPrompt.value = event as BeforeInstallPromptEvent;
        console.warn("beforeinstallprompt event captured", event);
    });

    async function installPwa() {
        if (deferredPrompt.value) {
            await deferredPrompt.value.prompt();
            if ((await deferredPrompt.value.userChoice).outcome === 'accepted') {
                console.log("PWA install prompt accepted");
                deferredPrompt.value = null; // Clear the prompt after showing it
                isStandalone.value = true; // Update the state to reflect that the PWA is being installed
            } else {
                console.log("PWA install prompt dismissed");
            }

            console.log("PWA install prompt shown");
        } else {
            console.warn("No deferred prompt available to show");
        }
    }

    return {
        installPwa,
        isInstallAvailable: computed(() => deferredPrompt.value !== null && !isStandalone.value),
        currentInstanceIsStandalone: isStandalone,
    };
});

interface BeforeInstallPromptEvent extends Event {

    /**
     * Returns an array of DOMString items containing the platforms on which the event was dispatched.
     * This is provided for user agents that want to present a choice of versions to the user such as,
     * for example, "web" or "play" which would allow the user to chose between a web version or
     * an Android version.
     */
    readonly platforms: Array<string>;

    /**
     * Returns a Promise that resolves to a DOMString containing either "accepted" or "dismissed".
     */
    readonly userChoice: Promise<{
        outcome: 'accepted' | 'dismissed',
        platform: string
    }>;

    /**
     * Allows a developer to show the install prompt at a time of their own choosing.
     * This method returns a Promise.
     */
    prompt(): Promise<void>;

}
