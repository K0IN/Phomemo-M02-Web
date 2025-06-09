# Image to b/w converter

## Usage

Install the package:

```
npm install image-converter-wasm
```

Import and instantiate in your project:

```js
import { instantiate } from 'image-converter-wasm';
import { print } from './src/environment.js'; // or your own print function

const imports = { env: { print } };
const instance = await instantiate(undefined, imports);

console.log(instance.add(1, 2)); // Example usage
```

- The WASM binary is loaded automatically from the package.
- See `out/main-component.d.ts` for available methods and types.

## Test image source

<https://de.wikipedia.org/wiki/Mona_Lisa#/media/Datei:Mona_Lisa,_by_Leonardo_da_Vinci,_from_C2RMF_retouched.jpg>
