import { describe, expect, test } from "vitest";
import { InvalidReason, isFilenameInvalid } from "../src/lib";

describe("lib test suite", () => {
    describe("isFilenameInvalid()", () => {
        const table = [
            // In this case, 'expected' means 'invalid filename'.
            { name: "", expected: true },
            { name: "foo", expected: false },
            { name: "bar.txt", expected: false },
            { name: "<foo>.txt", expected: true },
            { name: "<bar.txt", expected: true },
            { name: "foo>.md", expected: true },
            { name: "hello:world", expected: true },
            { name: "?", expected: true },
            { name: "Why?", expected: true },
            { name: "foo-\x00-bar.txt", expected: true },
            { name: "com1-.jpg", expected: false },
            { name: "lpt1", expected: true },
            { name: "LPT10", expected: false },
            { name: "COM0", expected: true },
            { name: "COM6.okay.txt", expected: true },
            { name: "foo.", expected: true },
            { name: "bar ", expected: true },
            { name: "hello\nworld", expected: true },
            { name: "foo\tbar", expected: true },
            { name: "بسوی-زیبایی.flv", expected: false },
        ];

        test.each(table)("$name invalid?", ({ name, expected }) => {
            expect(isFilenameInvalid(name)).toBe(expected);
        });
    });

    describe("isFilenameInvalid(reason = true)", () => {
        const table = [
            { name: "", expected: InvalidReason.Empty },
            { name: "foo", expected: false },
            { name: "bar.txt", expected: false },
            { name: "<foo>.txt", expected: InvalidReason.Chars },
            { name: "<bar.txt", expected: InvalidReason.Chars },
            { name: "foo>.md", expected: InvalidReason.Chars },
            { name: "hello:world", expected: InvalidReason.Chars },
            { name: "?", expected: InvalidReason.Chars },
            { name: "Why?", expected: InvalidReason.Chars },
            { name: "foo-\x00-bar.txt", expected: InvalidReason.Chars },
            { name: "com1-.jpg", expected: false },
            { name: "lpt1", expected: InvalidReason.Reserved },
            { name: "LPT10", expected: false },
            { name: "COM0", expected: InvalidReason.Reserved },
            { name: "COM6.okay.txt", expected: InvalidReason.Reserved },
            { name: "foo.", expected: InvalidReason.Ending },
            { name: "bar ", expected: InvalidReason.Ending },
            { name: "hello\nworld", expected: InvalidReason.Chars },
            { name: "foo\tbar", expected: InvalidReason.Chars },
            { name: "بسوی-زیبایی.flv", expected: false },
        ];

        test.each(table)("$name invalid with reason?", ({ name, expected }) => {
            expect(isFilenameInvalid(name, true)).toBe(expected);
        });
    });
});
