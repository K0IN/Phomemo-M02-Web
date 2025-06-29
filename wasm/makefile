main.wasm: src/main.zig
	zig build-exe src/main.zig -target wasm32-freestanding -fno-entry --export=runme -OReleaseSmall 

main-component.wasm: main.wasm main.wit
	wasm-tools component embed main.wit --world host main.wasm -o main-embed-component.wasm 
	wasm-tools component new main-embed-component.wasm -o main-component.wasm
	rm main-embed-component.wasm # remove temp files

node_modules:
	npm install

out/src/environment.js: src/environment.js
	mkdir -p out/src
	cp src/environment.js out/src/environment.js

out/src/types.js: ./types.js
	mkdir -p out/src
	cp types.js out/src/types.js


out/main-component.js: main-component.wasm node_modules out/src/environment.js out/src/types.js
 	# --async-mode jspi
	npx jco transpile main-component.wasm -o out --no-nodejs-compat --tla-compat --map env=./src/environment.js --optimize 0S --map example:host/types=./src/types.js --tracing --no-wasi-shim

build: main-component.wasm out/main-component.js

clean:
	rm -f *.wasm
	rm -rf out
	rm *.o
