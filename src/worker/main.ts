import { expose } from "comlink";
import { convertImageToBits } from "@/logic/imagehelper";

const exposedFunction = convertImageToBits;
expose(exposedFunction);
export type WorkerApi = typeof exposedFunction;
