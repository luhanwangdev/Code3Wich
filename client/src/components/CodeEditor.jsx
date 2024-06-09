import { useState, useRef, useEffect } from "react";
import { Box, Flex } from "@chakra-ui/react";
import { Editor } from "@monaco-editor/react";
import SideBar from "./SideBar.jsx";
import LanguageSelector from "./LanguageSelector";
import TabNavigation from "./TabNavigator";
import { CODE_SNIPPETS } from "../constants";

const CodeEditor = () => {
  const editorRef = useRef();
  const [value, setValue] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [activeFile, setActiveFile] = useState("html");
  const [files, setFiles] = useState([]);

  const onMount = (editor) => {
    editorRef.current = editor;
    editor.focus();
  };

  const onSelect = (language) => {
    setLanguage(language);
    setValue(CODE_SNIPPETS[language]);
  };

  useEffect(
    () =>
      setFiles([
        {
          name: "index.html",
          type: "html",
        },
        {
          name: "index.js",
          type: "javascript",
        },
        {
          name: "style.css",
          type: "css",
        },
      ]),
    []
  );

  return (
    <Flex>
      <Box flex="1">
        <SideBar
          files={files}
          setFiles={setFiles}
          activeFile={activeFile}
          setActiveFile={setActiveFile}
        />
      </Box>
      <Box flex="6">
        <LanguageSelector language={language} onSelect={onSelect} />
        <TabNavigation
          files={files}
          activeFile={activeFile}
          setActiveFile={setActiveFile}
        />
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
