import { Y } from './types.js';

export const print = console.log;
export const printstr = console.log;
export const createnode = () => new Y('test');
export const printnode = (node) => {
    console.log("Node:", node);
}
