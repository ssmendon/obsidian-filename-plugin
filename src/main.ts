import { Plugin } from "obsidian";
import { TitleViewPlugin } from "viewplugin";

// The main code is in the `viewplugin` class. This just registers the editor
// plugin.
export default class SMFilenamesPlugin extends Plugin {
    onload() {
        this.registerEditorExtension([TitleViewPlugin]);
        DEV: this.registerEvent(
            this.app.vault.on("rename", ({ name }) => {
                console.debug("rename occurred:", name);
            })
        );
    }
}
