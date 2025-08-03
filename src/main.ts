import { Plugin } from "obsidian";
import { TitleViewPlugin } from "./viewplugin";

// The main code is in the `viewplugin` class. This just registers the editor
// plugin.
export default class SMFilenamesPlugin extends Plugin {
    override onload(): void {
        this.registerEditorExtension([TitleViewPlugin]);
        // eslint-disable-next-line no-unused-labels -- removed by esbuild
        DEV: this.registerEvent(
            this.app.vault.on("rename", ({ name }) => {
                console.debug("rename occurred:", name);
            })
        );
    }
}
