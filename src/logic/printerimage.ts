export type PrinterImage = {
    width: number;
    height: number;
    bits: Uint8ClampedArray; // every pixel is 1 bit (black or white) the image is stored x -> xn for each row
};
