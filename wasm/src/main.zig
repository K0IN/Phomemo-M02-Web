extern fn print(i32) void;
const std = @import("std");

const allocator = std.heap.wasm_allocator;

export fn malloc(length: usize) [*]u8 {
    const buff = allocator.alloc(u8, length) catch unreachable;
    return buff.ptr;
}

export fn free(buf: [*]u8) void {
    allocator.free(buf[0..0]);
}

fn test_fn(t: type, value: t) void {
    print(value);
}

export fn add(a: i32, b: i32) i32 {
    print(a + b);
    _ = malloc(10);
    test_fn(i32, 10);
    return a + b;
}
