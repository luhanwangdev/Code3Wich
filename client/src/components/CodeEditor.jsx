import { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Box, Button, Flex, Link } from "@chakra-ui/react";
import { Editor } from "@monaco-editor/react";
import SideBar from "./SideBar.jsx";
import TabNavigation from "./TabNavigator";

const CodeEditor = () => {
  const { id } = useParams();
  const editorRef = useRef();
  const [value, setValue] = useState("");
  const [activeFile, setActiveFile] = useState({});
  const [files, setFiles] = useState([]);
  const [url, setUrl] = useState("");

  const onMount = (editor) => {
    editorRef.current = editor;
    editor.focus();
  };

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

  const packageProject = async () => {
    const packageResponse = await fetch(
      `http://localhost:3000/api/project/package`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
        }),
      }
    );

    const packageData = await packageResponse.json();
    setUrl(packageData.url);
  };

  useEffect(() => {
    const fetchFiles = async () => {
      const filesResponse = await fetch(
        `http://localhost:3000/api/file/project?projectId=${id}`
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

  return (
    <Box minH="100vh" bg="#2C2C32" color="gray.500" px={6} py={8}>
      <Flex>
        <Box flex="1">
          <SideBar
            files={files}
            setFiles={setFiles}
            activeFile={activeFile}
            setActiveFile={setActiveFile}
            projectId={id}
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

            <Button
              ml="2rem"
              mt="0.5rem"
              backgroundColor="orange"
              onClick={() => packageProject()}
            >
              Generate your URL!
            </Button>

            <Link href={url} color="white" ml="2rem" isExternal>
              {url}
            </Link>
          </Flex>
        </Box>
      </Flex>
    </Box>
  );
};

export default CodeEditor;
