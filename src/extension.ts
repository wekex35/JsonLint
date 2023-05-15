import { commands, ExtensionContext } from "vscode";
import { JsonLintdPanel } from "./panels/JsonLintdPanel";

export function activate(context: ExtensionContext) {
  // Create the show JsonLint command
  const launchCommand = commands.registerCommand("JsonLint.launch", () => {
    JsonLintdPanel.render(context,false);
  });

  const launchCommandFromClipBoard = commands.registerCommand("JsonLint.launchFromClipBoard", () => {
    console.log("JsonLint.launchFromClipBoard");
    
    JsonLintdPanel.render(context,true);
  });

  // Add command to the extension context
  context.subscriptions.push(launchCommand,launchCommandFromClipBoard);
}


