import { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Box, Button, Flex, DarkMode } from "@chakra-ui/react";
import { Editor } from "@monaco-editor/react";
import SideBar from "./SideBar.jsx";
import TabNavigation from "./TabNavigator";
import Header from "./Header.jsx";
import Terminal from "./Terminal.jsx";
import WebView from "./WebView.jsx";
import { io } from "socket.io-client";
import { url } from "../constants.js";

const CodeEditor = () => {
  const { id } = useParams();
  const editorRef = useRef();
  const socketRef = useRef(null);
  const [value, setValue] = useState("");
  const [activeFile, setActiveFile] = useState({});
  const [files, setFiles] = useState([]);
  const [project, setProject] = useState({});
  const [render, setRender] = useState(false);

  const onMount = (editor) => {
    editorRef.current = editor;
    editor.focus();
  };

  const saveFile = async () => {
    const { name, type, project_id, parentId } = activeFile;
    await fetch(`http://localhost:3000/api/file/edit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        type,
        projectId: project_id,
        parentId,
        code: value,
      }),
    });
  };

  const fetchFiles = async () => {
    const filesResponse = await fetch(`${url}/api/project/file?id=${id}`);
    const files = await filesResponse.json();

    setFiles(files);
    setActiveFile(files[0]);
  };

  const fetchCode = async () => {
    const codeResponse = await fetch(
      `${url}/api/file/edit?id=${activeFile.id}`
    );
    const code = await codeResponse.json();
    setValue(code.code);
  };

  const fetchProject = async () => {
    const projectResponse = await fetch(`${url}/api/project?id=${id}`);
    const project = await projectResponse.json();
    setProject(project);
  };

  const renderView = () => {
    setRender(!render);
  };

  useEffect(() => {
    fetchProject();
    fetchFiles();
  }, []);

  useEffect(() => {
    console.log(project);
    if (project.id) {
      socketRef.current = io(url);

      console.log(socketRef.current);

      socketRef.current.on("connect", () => {
        console.log("Connected to server");

        socketRef.current.emit("register", `project${project.id}`);

        socketRef.current.on("registered", () => {
          fetch(`${url}/api/project/terminal?id=${project.id}`);
        });
      });

      return () => {
        socketRef.current.off("connect");
        socketRef.current.disconnect();
      };
    }
  }, [project]);

  useEffect(() => {
    if (activeFile.id !== undefined) {
      fetchCode();
      // fetchProject();
    }
  }, [activeFile]);

  return (
    <DarkMode>
      <Box minH="100vh" bg="#2C2C32" color="gray.500">
        <Header />
        <Flex px={6} py={6}>
          <Box flex="1">
            <SideBar
              files={files}
              setFiles={setFiles}
              activeFile={activeFile}
              setActiveFile={setActiveFile}
              projectId={id}
            />
          </Box>
          <Box flex="3">
            <TabNavigation
              files={files.filter((file) => !file.isFolder)}
              activeFile={activeFile}
              setActiveFile={setActiveFile}
            />
            <Editor
              height="70vh"
              theme="vs-dark"
              language={activeFile.type}
              value={value}
              onChange={(value) => setValue(value)}
              onMount={onMount}
              options={{
                fontSize: 20,
              }}
            />
            {socketRef.current && (
              <Terminal socket={socketRef.current} project={project} />
            )}
            <Flex alignItems="center">
              <Button
                mt="0.5rem"
                onClick={() => {
                  saveFile();
                  renderView();
                }}
              >
                Save
              </Button>

              {/* <Button mt="0.5rem" ml="2rem" bg="orange">
            <Link href={url} color="white" isExternal>
              {url}
            </Link>
          </Button> */}
            </Flex>
          </Box>
          <Box flex="3">
            {project.id && <WebView url={project.url} key={render} />}
          </Box>
        </Flex>
      </Box>
    </DarkMode>
  );
};

export default CodeEditor;
