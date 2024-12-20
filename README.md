### Details

A project with the code that brings cloudflare `DurableObject`s into incorrect state when working with wasm.
Reproduction steps:
1. Connect `wscat -c http://cf-automerge-overload.dxos.workers.dev/object-1`.
2. Send `init` to check automerge is working. The object will respond with `{}`.
3. Send `overload` to trigger large memory allocations.
4. Send `init` to see that any automerge operation now triggers the same error.

Overload triggers:

> RangeError: Invalid typed array length: undefined

Which can be seen on the screenshot in `wrangler tail` session.

<img src="https://github.com/user-attachments/assets/22e00f0b-c257-4ca1-8d19-325db93fa42f" width="400" />

The error is throws in `wasm-bindgen` code on attempt to create a `Uint8Array` from `wasm.memory.buffer`. 

```ts
let cachedUint8ArrayMemory0 = null;

function getUint8ArrayMemory0() {
    if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {
        cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8ArrayMemory0;
}
```

The buffer is actually a "valid" `ArrayBuffer` object with non-zero `byteLength`.


It is hard to get the object out of this state. `DurableObject` reset by unhandled exception or `this.ctx.abort()` doesn't help.
If we open a connection to another `DurableObject` it will be working fine until overloaded.

<img src="https://github.com/user-attachments/assets/09688f53-cc01-4b92-bc48-fa84b9129046" width="400" />
