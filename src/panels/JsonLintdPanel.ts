import { Disposable, Webview, WebviewPanel, window, Uri, ViewColumn, ExtensionContext, commands, env } from "vscode";
import { getUri } from "../utilities/getUri";
import { getNonce } from "../utilities/getNonce";

import { homedir } from 'os';
import path = require('path');
import { writeFile, writeFileSync } from "fs";
/**
 * This class manages the state and behavior of JsonLintd webview panels.
 *
 * It contains all the data and methods for:
 *
 * - Creating and rendering JsonLintd webview panels
 * - Properly cleaning up and disposing of webview resources when the panel is closed
 * - Setting the HTML (and by proxy CSS/JavaScript) content of the webview panel
 * - Setting message listeners so data can be passed between the webview and extension
 */
export class JsonLintdPanel {
  public static currentPanel: JsonLintdPanel | undefined;
  public static isClipboardLaunch: boolean;
  private readonly _panel: WebviewPanel;
  private _disposables: Disposable[] = [];

  /**
   * The JsonLintdPanel class private constructor (called only from the render method).
   *
   * @param panel A reference to the webview panel
   * @param extensionUri The URI of the directory containing the extension
   */
  private constructor(panel: WebviewPanel, extensionUri: Uri) {
    this._panel = panel;

    // Set an event listener to listen for when the panel is disposed (i.e. when the user closes
    // the panel or when the panel is closed programmatically)
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

    // Set the HTML content for the webview panel
    this._panel.webview.html = this._getWebviewContent(this._panel.webview, extensionUri);

    // Set an event listener to listen for messages passed from the webview context
    this._setWebviewMessageListener(this._panel.webview);
  }

  /**
   * Renders the current webview panel if it exists otherwise a new webview panel
   * will be created and displayed.
   *
   * @param context The URI of the directory containing the extension.
   */
  public static render(context: ExtensionContext, isClipboard : boolean) {
    JsonLintdPanel.isClipboardLaunch = isClipboard;
    const extensionUri = context.extensionUri;
    if (JsonLintdPanel.currentPanel) {
      // If the webview panel already exists reveal it
      JsonLintdPanel.currentPanel._panel.reveal(ViewColumn.One);
    } else {
      // If a webview panel does not already exist create and show a new one
      const panel = window.createWebviewPanel(
        // Panel view type
        "JsonLint {}",
        // Panel title
        "JsonLint {}",
        // The editor column the panel should be displayed in
        { viewColumn: ViewColumn.Beside, preserveFocus: true },
        // Extra panel configurations
        {
          // Enable JavaScript in the webview
          enableScripts: true,
          // Restrict the webview to only load resources from the `out` and `webview-ui/build` directories
          localResourceRoots: [Uri.joinPath(extensionUri, "out"), Uri.joinPath(extensionUri, "webview-ui/build")],
        }
      );

   
      JsonLintdPanel.currentPanel = new JsonLintdPanel(panel, extensionUri);

    }
  }

  /**
   * Cleans up and disposes of webview resources when the webview panel is closed.
   */
  public dispose() {

    
    JsonLintdPanel.currentPanel = undefined;
    JsonLintdPanel.isClipboardLaunch = false;

    // Dispose of the current webview panel
    this._panel.dispose();

    // Dispose of all disposables (i.e. commands) for the current webview panel
    while (this._disposables.length) {
      const disposable = this._disposables.pop();
      if (disposable) {
        disposable.dispose();
      }
    }
  }

  /**
   * Defines and returns the HTML that should be rendered within the webview panel.
   *
   * @remarks This is also the place where references to the React webview build files
   * are created and inserted into the webview HTML.
   *
   * @param webview A reference to the extension webview
   * @param extensionUri The URI of the directory containing the extension
   * @returns A template string literal containing the HTML that should be
   * rendered within the webview panel
   */
  private _getWebviewContent(webview: Webview, extensionUri: Uri) {
    // The CSS file from the React build output
    const stylesUri = getUri(webview, extensionUri, ["webview-ui", "build", "assets", "index.css"]);
    // The JS file from the React build output
    const scriptUri = getUri(webview, extensionUri, ["webview-ui", "build", "assets", "index.js"]);

    type Mutable<Type> = {
      -readonly [Key in keyof Type]: Type[Key];
    };


    const sendMessage = (type: string, value: string) => {
      webview.postMessage({
        type, value
      });
    };

    console.log("JsonLintdPanel.isClipboardLaunch out ==>",JsonLintdPanel.isClipboardLaunch);
    if(JsonLintdPanel.isClipboardLaunch ){
      console.log("JsonLintdPanel.isClipboardLaunch In");
     
      env.clipboard.readText().then((text) => {
        sendMessage("CODE", text);
      });
    }

    const copyAndSend = async () => {
      if(JsonLintdPanel.currentPanel){
      await commands.executeCommand('editor.action.clipboardCopyWithSyntaxHighlightingAction');
      env.clipboard.readText().then((text) => {
        sendMessage("CODE", text);
      });}
    };

    window.onDidChangeTextEditorSelection(async (e) => {
      (e.selections && e.selections.length === 1 && !(e.selections[0] as any).isEmpty) && copyAndSend();
    });


    const editor = window.activeTextEditor;
    if (editor && (editor.selections && editor.selections.length === 1 && !(editor.selections[0] as any).isEmpty)) { copyAndSend(); };

    const nonce = getNonce();



    // Tip: Install the es6-string-html VS Code extension to enable code highlighting below
    return /*html*/ `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta
              http-equiv="Content-Security-Policy"
              content="img-src vscode-resource: data: https:; script-src vscode-resource:; style-src 'unsafe-inline' vscode-resource:;"
          />
          <link rel="stylesheet" type="text/css" href="${stylesUri}">
          <title>JsonLint {}</title>
        </head>
        <body>
          <div id="root"></div>
          <script type="module" nonce="${nonce}" src="${scriptUri}"></script>
        </body>
      </html>
    `;
  }
  /**
   * Sets up an event listener to listen for messages passed from the webview context and
   * executes code based on the message that is recieved.
   *
   * @param webview A reference to the extension webview
   * @param context A reference to the extension context
   */
  private _setWebviewMessageListener(webview: Webview) {
    let lastUsedImageUri:any = Uri.file(path.resolve(homedir(), 'Desktop/JsonLint.png'));
    const saveImage = async (data: any) => {
      const uri = await window.showSaveDialog({
        // eslint-disable-next-line @typescript-eslint/naming-convention
        filters: { Images: ['png'] },
        defaultUri: lastUsedImageUri
      });
      lastUsedImageUri = uri;
      uri && writeFileSync(uri.fsPath, Buffer.from(data, 'base64'));
    };
    webview.onDidReceiveMessage(
      async (message: any) => {
        console.log({hello : message});
        
        const command = message.type;
        const value = message.value;

        switch (command) {
          case "hello":
            // Code that should run in response to the hello message command
            window.showInformationMessage(value);
            
          case "SAVE":
            // Code that should run in response to the hello message command
            window.showInformationMessage(value);
            await saveImage(value);
            return;
          // Add more switch case statements here as more webview message commands
          // are created within the webview context (i.e. inside media/main.js)
        }
      },
      undefined,
      this._disposables
    );
  }
}
