import { useState, useRef, useEffect } from "react";
import { Box, Button, Flex } from "@chakra-ui/react";
import { Editor } from "@monaco-editor/react";
import SideBar from "./SideBar.jsx";
import TabNavigation from "./TabNavigator";
import { CODE_SNIPPETS } from "../constants";

const CodeEditor = () => {
  const editorRef = useRef();
  const [value, setValue] = useState("");
  const [activeFile, setActiveFile] = useState({});
  const [files, setFiles] = useState([]);

  const onMount = (editor) => {
    editorRef.current = editor;
    editor.focus();
  };

  useEffect(() => {
    const fetchFiles = async () => {
      const filesResponse = await fetch(
        "http://localhost:3000/api/file/project?projectId=1"
      );
      const files = await filesResponse.json();

      setFiles(files);
      setActiveFile(files[0]);
    };

    fetchFiles();
  }, []);

  useEffect(() => {
    const fetchCode = async () => {
      const codeResponse = await fetch(
        `http://localhost:3000/api/file/edit?name=${activeFile.name}&projectId=${activeFile.project_id}`
      );
      const code = await codeResponse.json();
      setValue(code.code);
    };

    if (activeFile.name !== undefined) {
      fetchCode();
    }
  }, [activeFile]);

  const saveFile = async () => {
    const { name, type, project_id } = activeFile;
    await fetch(
      `http://localhost:3000/api/file/edit?name=${activeFile.name}&projectId=${activeFile.project_id}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          type,
          projectId: project_id,
          code: value,
        }),
      }
    );
  };

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
        <Button mt="0.5rem" onClick={() => saveFile()}>
          Save
        </Button>
      </Box>
    </Flex>
  );
};

export default CodeEditor;
