// Implementation of the ViewPlugin.

import { EditorView, PluginValue, ViewPlugin } from "@codemirror/view";
import {
    ERROR_MESSAGE_CHARS,
    ERROR_MESSAGE_DEFAULT,
    ERROR_MESSAGE_ENDING,
    ERROR_MESSAGE_RESERVED,
    KEYDOWN_INTERCEPTS,
    TITLE_QUERY_SELECTOR,
} from "constants";
import { InvalidReason, isFilenameInvalid } from "lib";
import { displayTooltip } from "obsidian";

/*
The recommendation is that this plugin should only update during its `update()`
function ([1]).

Title edits aren't really captured in the `update()` function, so I can't do
that. Obsidian manages this by directly hooking event listeners into the title
DOM element.

Obsidian specifically hooks into the following events:

| Event   | Why
| ------- | ----------------------------------------------- |
| input   | Display an error tooltip on invalid names       |
| keydown | Handle saving the file and jumping to note body |
| blur    | Handle saving the file                          |

This view plugin attaches an event listener to those same events, and it tries
to handle these events whenever the filename isn't cross-platform. When unloaded
it unregisters those event listeners.

For more information about what filenames are invalid, the `isFilenameInvalid`
function inside of `src/lib.ts` is the main place to look.

References:
[1]: <https://codemirror.net/docs/ref/#view.PluginValue>

## Notes

- It creates a new ViewPlugin for each opened note.
- If you don't properly destroy it, the event listeners accrue endlessly.
*/

class SMTitleViewPlugin implements PluginValue {
    readonly #titleEl: HTMLDivElement;
    readonly #abort: AbortController | undefined;
    #oldTitleText: string;

    private set oldTitleText(name: string | null) {
        if (isFilenameInvalid(name)) {
            // should never happen?
            console.warn(
                `replacing #oldTitleText with an invalid value: "${
                    this.#oldTitleText
                }" -> "${name ?? "null"}"`
            );
        }

        this.#oldTitleText = name ?? "";
    }

    constructor(view: EditorView) {
        const title = view.dom.querySelector(TITLE_QUERY_SELECTOR);
        if (!title || !(title instanceof HTMLDivElement)) {
            throw new TypeError(
                `failed to locate note title, got: ${title?.nodeName ?? "null"}`
            );
        }

        this.#titleEl = title;
        this.oldTitleText = title.textContent;
        this.#abort = new AbortController();

        // Event listener configuration
        const eventOpts: AddEventListenerOptions = {
            capture: true,
            passive: true,
            signal: this.#abort.signal,
        };

        /* eslint-disable @typescript-eslint/no-unsafe-argument
            -- .bind(this) is very loosely typed
            */
        this.#titleEl.addEventListener(
            "blur",
            this.#onblur.bind(this),
            eventOpts
        );
        this.#titleEl.addEventListener(
            "focusin",
            this.#onfocusin.bind(this),
            eventOpts
        );
        this.#titleEl.addEventListener(
            "input",
            this.#oninput.bind(this),
            eventOpts
        );
        this.#titleEl.addEventListener(
            "keydown",
            this.#onkeydown.bind(this),
            eventOpts
        );
        /* eslint-enable @typescript-eslint/no-unsafe-argument */
    }

    /**
     * Unregisters the plugin's event handlers. This basically renders it
     * inoperable in the current view, since it doesn't have an update() method.
     */
    destroy() {
        this.#abort?.abort();
    }

    /**
     * Resets the title element (aka, the filename) if it's invalid.
     *
     * Most of the event handlers call this, to stop a bad filename from being
     * saved to the disk.
     *
     * @param event An optional event to stop propagation of if the title is
     *              invalid. Useful to try and pre-empt Obsidian's builtin
     *              handlers.
     * @returns `true` if the title was invalid, and `false` otherwise.
     */
    #resetInvalidTitle(this: SMTitleViewPlugin, event?: Event): boolean {
        if (isFilenameInvalid(this.#titleEl.textContent)) {
            event?.stopImmediatePropagation();
            this.#titleEl.textContent = this.#oldTitleText;
            return true;
        } else {
            return false;
        }
    }

    // Event listeners.

    // When losing focus, check if the title is invalid and reset it.
    //
    // Cancel Obsidian's event listener in this case (if we can), since we don't
    // want to save the file if it's invalid.
    #onblur(this: SMTitleViewPlugin, event: FocusEvent) {
        if (event.eventPhase !== event.AT_TARGET) {
            return;
        }
        console.debug("SMTitleViewPlugin handling #onblur");
        this.#resetInvalidTitle(event);
    }
    // When focusing on the title, save the current contents. So we can reset
    // the title properly if it's edited more than once.
    #onfocusin(this: SMTitleViewPlugin, event: FocusEvent) {
        if (event.eventPhase !== event.AT_TARGET) {
            return;
        }
        console.debug("SMTitleViewPlugin handling #onfocusin");
        this.oldTitleText = this.#titleEl.textContent;
    }
    // When writing the title, check on every title change whether it's valid.
    // If not, display an error pop-up.
    #oninput(this: SMTitleViewPlugin, event: InputEvent) {
        if (event.eventPhase !== event.AT_TARGET) {
            return;
        }
        if (event.isComposing) {
            return;
        }
        const isInvalid = isFilenameInvalid(this.#titleEl.textContent, true);
        // If it's just an empty name, I'll let Obsidian handle it.
        if (isInvalid && isInvalid !== InvalidReason.Empty) {
            console.debug("SMTitleViewPlugin handling #oninput");
            event.stopImmediatePropagation();
            let errorMessage: string;
            switch (isInvalid as InvalidReason) {
                case InvalidReason.Chars:
                    errorMessage = ERROR_MESSAGE_CHARS;
                    break;
                case InvalidReason.Ending:
                    errorMessage = ERROR_MESSAGE_ENDING;
                    break;
                case InvalidReason.Reserved:
                    errorMessage = ERROR_MESSAGE_RESERVED;
                    break;
                default:
                    errorMessage = ERROR_MESSAGE_DEFAULT;
            }
            displayTooltip(this.#titleEl, errorMessage, {
                classes: ["mod-error", "mod-wide"], // pulled from Obsidian
                placement: "bottom",
            });
        }
    }
    // If the pressed key is something that confirms title editing, reset the
    // title before Obsidian's event handler.
    #onkeydown(this: SMTitleViewPlugin, event: KeyboardEvent) {
        if (
            event.eventPhase !== event.AT_TARGET ||
            event.isComposing ||
            event.keyCode == 229 || // eslint-disable-line @typescript-eslint/no-deprecated -- https://developer.mozilla.org/en-US/docs/Web/API/Element/keydown_event
            !KEYDOWN_INTERCEPTS.has(event.key)
        ) {
            return;
        }
        console.debug("SMTitleViewPlugin handling #onkeydown");
        this.#resetInvalidTitle();
    }
}
export const TitleViewPlugin = ViewPlugin.fromClass(SMTitleViewPlugin);
