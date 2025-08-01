// source: https://stackoverflow.com/a/31976060
// + COM0/LPT0

/**
 * Matches (case-insensitive) any forbidden filename on Linux, macOS, and Windows.
 *
 *
 * ## Requirements
 * - No forbidden character: `* " \ / < > : | ?`
 * - No non-printable ASCII characters: `0-31` (0x00 to 0x1f)
 * - No reserved file names:
 *   - Windows: `CON PRN AUX NUL COM[0-9] LPT[0-9]` with or without extension
 *   - Linux/macOS: `. ..`
 * - Cannot end in a space or dot
 */
export const INVALID_FILENAME_REGEX = new RegExp(
    // eslint-disable-next-line no-control-regex
    /[*"\\/<>:|?\x00-\x1f]|^\.\.?$|^(?:CON|PRN|AUX|NUL|COM[0-9]|LPT[0-9])(?:\.|$)|\.$| $/i
);

/**
 * A regular expression matching invalid filename characters on Windows, Linux,
 * and macOS.
 */
// This is just a set. The "\x00-\x1f" represent ASCII control characters.
export const INVALID_FILENAME_CHARS_REGEX = new RegExp(
    /[*"\\/<>:|?\x00-\x1f]/ // eslint-disable-line no-control-regex -- allow \x00-\x1f
);

/**
 * A regular expression matching reserved filenames on Windows, Linux, and
 * macOS.
 */
/* Broken down:
    /
    ^\.\.?$                 - the filename of one or two dots
                            or:
    ^                       - start of string
    (?:CON|PRN|AUX|...)     - the filenames
    (?:\.|$)                - either a dot (file exts) or end of the filename
    /i                      - matches case insensitively
*/
export const INVALID_FILENAME_RESERVED_REGEX = new RegExp(
    /^\.\.?$|(?:CON|PRN|AUX|NUL|COM[0-9]|LPT[0-9])(?:\.|$)/i
);

/**
 * A regular expression matching invalid filename ending characters on Windows,
 * Linux, and macOS.
 */
/* Broken down:
    \.$                     - ending in a dot
     $                      - ending in a space
*/
export const INVALID_FILENAME_ENDING_REGEX = new RegExp(/\.$| $/);

export const ERROR_MESSAGE_CHARS =
    'File name cannot contain any of these characters: * " \\ / < > : | ?';
export const ERROR_MESSAGE_ENDING = "File name cannot end in a dot or a space.";
export const ERROR_MESSAGE_RESERVED =
    "File name cannot be any of these: CON PRN AUX NUL COM[0-9] LPT[0-9]";
export const ERROR_MESSAGE_DEFAULT = "Invalid filename.";

export const TITLE_QUERY_SELECTOR = "div.inline-title";

// The 'Escape' key is also included in what Obsidian handles, but it aborts the
// edit. So we don't really care about it here.
export const KEYDOWN_INTERCEPTS: ReadonlySet<string> = new Set([
    "Enter",
    "Tab",
    "ArrowDown",
]);
