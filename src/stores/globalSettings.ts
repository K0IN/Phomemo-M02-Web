import { ref, watch } from 'vue'
import { defineStore } from 'pinia'

export type GlobalSettings = {
    pixelPerLine: number;
    showAllBluetoothDevices: boolean;
};

const LOCAL_STORAGE_KEY = 'globalSettings';

function loadSettings(): GlobalSettings {
    try {
        const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (raw) return JSON.parse(raw);
    } catch { }
    return {
        pixelPerLine: 384,
        showAllBluetoothDevices: false,
    };
}

export const useGlobalSettingsStore = defineStore('global-settings', () => {
    const settings = ref<GlobalSettings>(loadSettings());

    watch(settings, (val) => {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(val));
    }, { deep: true });


    function setPixelPerLine(val: number) {
        settings.value.pixelPerLine = val;
    }

    function setShowAllBluetoothDevices(val: boolean) {
        settings.value.showAllBluetoothDevices = val;
    }

    return {
        settings,
        setPixelPerLine,
        setShowAllBluetoothDevices,
    };
});

