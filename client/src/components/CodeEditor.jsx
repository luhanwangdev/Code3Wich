import { useState, useRef, useEffect } from "react";
import { Box, Button, Flex, Link } from "@chakra-ui/react";
import { Editor } from "@monaco-editor/react";
import SideBar from "./SideBar.jsx";
import TabNavigation from "./TabNavigator";
import { CODE_SNIPPETS } from "../constants";

const CodeEditor = () => {
  const editorRef = useRef();
  const [value, setValue] = useState("");
  const [activeFile, setActiveFile] = useState({});
  const [activeProject, setActiveProject] = useState({});
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
      setActiveProject({ project_id: 1 });
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
      `http://localhost:3000/api/file/edit?name=${name}&projectId=${project_id}`,
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
          activeProject={activeProject}
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
          language={activeFile.type}
          value={value}
          onChange={(value) => setValue(value)}
          onMount={onMount}
          options={{
            fontSize: 20,
          }}
        />
        <Flex alignItems="center">
          <Button mt="0.5rem" onClick={() => saveFile()}>
            Save
          </Button>
          <Link
            href={`http://localhost:3000/project${activeProject.project_id}/index.html`}
            color="white"
            ml="2rem"
            isExternal
          >
            Click here to go to your website!
          </Link>
        </Flex>
      </Box>
    </Flex>
  );
};

export default CodeEditor;
