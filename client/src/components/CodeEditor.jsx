import { useState, useRef, useEffect } from "react";
import { Box, Button, Flex } from "@chakra-ui/react";
import { Editor } from "@monaco-editor/react";
import SideBar from "./SideBar.jsx";
import LanguageSelector from "./LanguageSelector";
import TabNavigation from "./TabNavigator";
import { CODE_SNIPPETS } from "../constants";

const CodeEditor = () => {
  const editorRef = useRef();
  const [value, setValue] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [activeFile, setActiveFile] = useState({});
  const [files, setFiles] = useState([]);

  const onMount = (editor) => {
    editorRef.current = editor;
    editor.focus();
  };

  // const onSelect = (activeFile) => {
  //   // setLanguage(language);
  //   console.log(activeFile);
  //   console.log(activeFile.type);
  //   console.log(CODE_SNIPPETS[activeFile.type]);
  //   setValue(CODE_SNIPPETS[activeFile.type]);
  // };

  useEffect(() => {
    const fetchFile = async () => {
      const fileResponse = await fetch(
        "http://localhost:3000/api/file/project?projectId=1"
      );
      const fileData = await fileResponse.json();

      setFiles(fileData);
      setActiveFile(fileData[0]);
    };

    fetchFile();
  }, []);

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
        {/* <LanguageSelector language={language} onSelect={onSelect} /> */}
        <TabNavigation
          files={files}
          activeFile={activeFile}
          setActiveFile={setActiveFile}
        />
        <Editor
          height="75vh"
          theme="vs-dark"
          defaultLanguage="javascript"
          language={activeFile.type}
          defaultValue={CODE_SNIPPETS[activeFile.type]}
          value={value}
          onChange={(value) => setValue(value)}
          onMount={onMount}
          options={{
            fontSize: 20,
          }}
        />
        <Button mt="0.5rem">Save</Button>
      </Box>
    </Flex>
  );
};

export default CodeEditor;
