<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { Settings } from 'lucide-vue-next'

import Separator from './ui/separator/Separator.vue'
import Switch from './ui/switch/Switch.vue'
import { useGlobalSettingsStore } from '@/stores/globalSettings'
import { usePwaInstallStore } from '@/stores/pwainstall'

const globalSettings = useGlobalSettingsStore();
const pwaInstall = usePwaInstallStore();

</script>

<template>
    <Popover>
        <PopoverTrigger as-child>
            <Button variant="secondary">
                <Settings />
            </Button>
        </PopoverTrigger>
        <PopoverContent class="w-80" side="left" align="start">
            <div class="grid gap-4">
                <div class="space-y-2">
                    <h4 class="font-medium leading-none">
                        Printer Settings
                    </h4>
                    <p class="text-sm text-muted-foreground">
                        Configure your printer parameters
                    </p>
                </div>

                <Separator />

                <div class="flex flex-col gap-4">
                    <div>
                        <Label for="pixelsPerLine">Pixels per Line</Label>
                        <Input id="pixelsPerLine" type="number" v-model="globalSettings.settings.pixelPerLine"
                            class="mt-1" />
                        <div class="text-xs text-muted-foreground mt-1">Common values: 384, 576</div>
                    </div>
                    <div>
                        <Label class="mb-1">Quick Presets</Label>
                        <div class="flex gap-2 mt-1">
                            <Button size="sm"
                                :variant="globalSettings.settings.pixelPerLine === 384 ? 'default' : 'outline'"
                                @click="globalSettings.setPixelPerLine(384)">384px</Button>
                            <Button size="sm"
                                :variant="globalSettings.settings.pixelPerLine === 576 ? 'default' : 'outline'"
                                @click="globalSettings.setPixelPerLine(576)">576px</Button>
                        </div>
                    </div>

                    <Separator />

                    <div>
                        <Label class="mb-1">Advanced Settings</Label>
                        <p class="text-xs text-muted-foreground mb-2">
                            These settings are for advanced users. Use with caution.
                        </p>
                        <div class="flex items-center space-x-2">
                            <Switch id="showAllBluetoothDevices"
                                v-model="globalSettings.settings.showAllBluetoothDevices"
                                @update:model-value="(val) => globalSettings.setShowAllBluetoothDevices(val)" />
                            <Label for="showAllBluetoothDevices">
                                Show All Bluetooth Devices
                            </Label>
                        </div>
                    </div>

                    <Separator v-if="pwaInstall.isInstallAvailable" />

                    <Button size="sm" variant="default" @click="pwaInstall.installPwa()"
                        v-if="pwaInstall.isInstallAvailable">
                        Install Web App
                    </Button>

                </div>
            </div>
        </PopoverContent>
    </Popover>
</template>
