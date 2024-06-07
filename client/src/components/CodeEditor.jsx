import { useState, useRef } from "react";
import { Box } from "@chakra-ui/react";
import { Editor } from "@monaco-editor/react";

const CodeEditor = () => {
  const editorRef = useRef();
  const [value, setValue] = useState("");

  const onMount = (editor) => {
    editorRef.current = editor;
    editor.focus();
  };

  return (
    <Box>
      <Editor
        height="75vh"
        theme="vs-dark"
        defaultLanguage="javascript"
        defaultValue="// some comment"
        value={value}
        onChange={(value) => setValue(value)}
        onMount={onMount}
      />
    </Box>
  );
};

export default CodeEditor;
