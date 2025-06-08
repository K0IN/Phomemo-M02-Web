main.wasm: src/main.zig
	zig build-exe src/main.zig -target wasm32-freestanding -fno-entry --export=add --export=malloc --export=free -OReleaseSmall 

main-component.wasm: main.wasm main.wit
	wasm-tools component embed main.wit --world host main.wasm -o main-embed-component.wasm 
	wasm-tools component new main-embed-component.wasm -o main-component.wasm
	rm main-embed-component.wasm # remove temp files

node_modules:
	npm install

out/main-component.js: main-component.wasm node_modules src/environment.js
 	# --async-mode jspi
	npx jco transpile main-component.wasm -o out --no-nodejs-compat --tla-compat --instantiation async --map env=./src/environment.js --optimize 0S 

build: main-component.wasm out/main-component.js

test: out/main-component.js
	deno run --allow-net --allow-read main.ts 

clean:
	rm -f *.wasm
	rm -rf out
	rm *.o
