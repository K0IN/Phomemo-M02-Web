extern fn print(i32) void;
const std = @import("std");

const allocator = std.heap.wasm_allocator;

extern fn printstr(str: ?[*:0]const u8, len: usize) void;

export fn runme() void {
    const a = "hello world 2";
    printstr(a.ptr, a.len);
}
