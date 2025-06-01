import { expose } from "comlink";
import { convertImageToBits } from "@/logic/imagehelper";

const obj = convertImageToBits;

expose(obj);
export type WorkerApi = typeof obj;
