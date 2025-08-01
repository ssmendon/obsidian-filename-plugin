import {
    INVALID_FILENAME_CHARS_REGEX,
    INVALID_FILENAME_ENDING_REGEX,
    INVALID_FILENAME_REGEX,
    INVALID_FILENAME_RESERVED_REGEX,
} from "./constants";

/**
 * A code representing why the filename was rejected.
 *
 * Each code is a 'truthy' value.
 */
export enum InvalidReason {
    // The name is empty.
    Empty = 1,
    // The name contains invalid characters, like: / \ < > (and so on).
    Chars,
    // The name ends in an invalid character, like a space or a dot.
    Ending,
    // The name is reserved, like "CON" on Windows.
    Reserved,
}

/**
 * Tests if a filename is invalid across Windows, Linux, and macOS, and provides
 * the reason for the filename's invalidity.
 *
 * @param name The filename to evaluate.
 * @param reason If 'true', returns an InvalidReason specifying why
 *               it failed to validate. If 'false', just returns a boolean.
 * @returns Either an InvalidReason specifying why it was rejected, or 'false'
 *          if it was valid.
 */
export function isFilenameInvalid(
    name: string | null,
    reason = false
): InvalidReason | boolean {
    if (!reason) {
        return !name || INVALID_FILENAME_REGEX.test(name);
    } else if (!name) {
        return InvalidReason.Empty;
    } else if (INVALID_FILENAME_CHARS_REGEX.test(name)) {
        return InvalidReason.Chars;
    } else if (INVALID_FILENAME_ENDING_REGEX.test(name)) {
        return InvalidReason.Ending;
    } else if (INVALID_FILENAME_RESERVED_REGEX.test(name)) {
        return InvalidReason.Reserved;
    } else {
        return false;
    }
}
