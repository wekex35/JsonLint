import { vscode } from "./utilities/vscode";
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import "./App.css";
import { useEffect, useState } from "react";

import CodeEditor from "./components/editor/CodeEditor";
import React from "react";

function App() {



  return (
   <CodeEditor/>
  );
}

export default App;
