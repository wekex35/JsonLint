
import React, { useEffect, useRef } from 'react';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs';

import 'prismjs/components/prism-json';
import 'prismjs/themes/prism-tomorrow.css'; //Example style, you can use another
import './CodeEditor.css'
import { formatter } from '../../utils/formatter';
import { jsonlint } from '../../utils/jsonlint';
import useEditorStore from '../stores/useEditorStore';
import ActionBar from '../action-bar/ActionBar';
import useAction from '../stores/useAction';

const hightlightWithLineNumbers = (input: string, language: string, errorIndex: number) =>
  highlight(input, languages.js, language)
    .split("\n")
    .map((line, i) => {
      return `<span class="${errorIndex - 1 == i ? "error" : ""}"><span class='editorLineNumber'>${i + 1}</span>${line}</span>`
    })
    .join("\n");

function CodeEditor() {
  const { fontSize, validate, toggleValidate } = useAction();
  const [
    code,
    errorIndex,
    errorMessage,
    setErrorMessage,
    setCode,
    setErrorIndex,
    setCodeErrorMessage,
  ] = useEditorStore(
    (state) => [
      state.code,
      state.errorIndex,
      state.errorMessage,
      state.setErrorMessage,
      state.setCode,
      state.setErrorIndex,
      state.setCodeErrorMessage,
    ],
  )

  useEffect(() => {
    window.addEventListener('message', async event => {
      const message = event.data; // The JSON data our extension sent
      switch (message.type) {
        case "CODE":
          beautify(message.value)
          break;
      }
    });
  }, [])

  useEffect(() => {
   let  timer = setTimeout(() => {
      errorCheck(false);
    }, 500);
    return () => {
      clearTimeout(timer);
    }
  }, [code])

  const preRef = useRef<HTMLDivElement>(null);


  const errorCheck = (forceValidate : boolean) => {
    if(validate || forceValidate){
    try {
      const validCode = JSON.stringify(jsonlint.parse(code), null, 2);
      setCodeErrorMessage({
        errorIndex: -1,
        errorMessage: "Valid Json"
      })
      return validCode;
    } catch (error) {
      let errMsg = `${error}`;
      console.log("error", errMsg);

      const lineMatch = errMsg.match(/line (\d+)/);
      let lineNumber = -1
      if (lineMatch) {
        lineNumber = parseInt(lineMatch[1], 10);
      }
      setCodeErrorMessage({
        errorIndex: lineNumber,
        errorMessage: errMsg
      })
    }
    }
  }

  const beautify = (textCode: string) => {
    if(validate){
        textCode = formatter.formatJson(textCode, "   ")
    }
    setCode(textCode)
    return false;
  };
  const validateHandler = () => {
    let textCode = formatter.formatJson(code, "   ")
    setCode(textCode)
    errorCheck(true)
  }
  return (

    <div ref={preRef}>
      <ActionBar validateHandler={validateHandler}/>
      <Editor
        value={code}
        onValueChange={code => beautify(code)}
        highlight={code => hightlightWithLineNumbers(code, "js", errorIndex)}
        padding={10}
        textareaId="codeArea"
        className={`editor ${errorMessage == "Valid Json" ? "error_valid" : "error_invalid"}`}
        style={{
          fontFamily: '"Fira code", "Fira Mono", monospace',
          fontSize: fontSize,
          outline: 0
        }}
      />
      
      <div  className={`message ${errorMessage == "Valid Json" ? "message_valid" : "message_invalid"}`}>
        {errorMessage.split("\n").map((line) => <>{line}<br/></>)}
      </div>
    </div>
  );
}

export default CodeEditor