import WorkerUrl from './main.ts?worker&url'
import type { WorkerApi } from './main.ts';
import { wrap } from 'comlink';

export function getWorker() {
    const worker = new Worker(WorkerUrl, { type: "module" });
    const api = wrap<WorkerApi>(worker);
    return api;
}
