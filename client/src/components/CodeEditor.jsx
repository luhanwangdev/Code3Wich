import { useState, useRef } from "react";
import { Box, Flex } from "@chakra-ui/react";
import { Editor } from "@monaco-editor/react";
import SideBar from "./SideBar.jsx";
import LanguageSelector from "./LanguageSelector";
import { CODE_SNIPPETS } from "../constants";

const CodeEditor = () => {
  const editorRef = useRef();
  const [value, setValue] = useState("");
  const [language, setLanguage] = useState("javascript");

  const onMount = (editor) => {
    editorRef.current = editor;
    editor.focus();
  };

  const onSelect = (language) => {
    setLanguage(language);
    setValue(CODE_SNIPPETS[language]);
  };

  return (
    <Flex>
      <Box flex="1">
        <SideBar />
      </Box>
      <Box flex="6">
        <LanguageSelector language={language} onSelect={onSelect} />
        <Editor
          height="75vh"
          theme="vs-dark"
          defaultLanguage="javascript"
          language={language}
          defaultValue={CODE_SNIPPETS[language]}
          value={value}
          onChange={(value) => setValue(value)}
          onMount={onMount}
        />
      </Box>
    </Flex>
  );
};

export default CodeEditor;
