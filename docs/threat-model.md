# Threat model

## What this is

`bare-buffer` is compiled into Bare. It is listed in `src/builtins.json`, so every Bare process has it. That holds whether or not the process sealed, and no code has to load anything to reach it.

So this addon is part of Bare, and [Bare's threat model](https://github.com/holepunchto/bare/blob/main/docs/threat-model.md) covers it. Read that one first. This one only says where this addon sits in it.

## What it inherits

- **The promise.** Bare promises a sealed process gets no new native code. This addon is native code that is already in, so the seal neither adds it nor takes it away.
- **The attacker.** Untrusted JavaScript in a sealed process. It writes what it likes, runs on as many threads as it wants, and calls anything it can reach in any order and all at once. It can reach all of this addon.
- **The trust.** This addon is trusted, because Bare compiles it in. Whatever you compile in is your security policy, and this is one of the things you picked.
- **The walls.** The same table applies. A thread is not a wall and neither is a realm, so nothing here gets to assume it is alone.
- **The rules.** What Bare says to report, and what Bare says is not a bug, is the same here.

## What counts

- **Counts:** `binding.c` and the JavaScript that ships with it. Sealed JavaScript reaches all of it without loading a thing.
- **Does not count:** tests, benchmarks, and scratch code.

## What this addon adds

Memory, and the code that turns bytes into text and back. It does UTF-8, UTF-16LE, latin1, base64, base64url and hex.

It adds no power. It reaches nothing outside the process, and it hands out no way to reach anything.

`allocUnsafe` gives back memory that was not cleared, so whatever the process left there is readable. That is what the name says and it is not a bug. If you do not want sealed code reading that memory, do not give it uncleared memory.

## Where the risk is

All of it is C reading lengths and offsets that JavaScript picked, over bytes that JavaScript wrote. The decoders run on input an attacker chose. That is the fourth thing on Bare's list of what is left to worry about, and the seal does nothing about it.

Buffers sit on `ArrayBuffer`, so two threads can share one and race on it. The C has to hold up when the bytes change under it.

## What to report

- Reads or writes outside a buffer, in any encoder or decoder
- Any length, offset or index that gets past the bounds checks
- Any way to see memory outside a backing store
- Anything on Bare's report list
