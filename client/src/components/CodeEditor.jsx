import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Button,
  Flex,
  DarkMode,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
} from "@chakra-ui/react";
import { Editor } from "@monaco-editor/react";
import SideBar from "./SideBar.jsx";
import TabNavigation from "./TabNavigator";
import Header from "./Header.jsx";
import Terminal from "./Terminal.jsx";
import WebView from "./WebView.jsx";
import { io } from "socket.io-client";
import { url } from "../constants.js";

const CodeEditor = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const editorRef = useRef(null);
  const activeFileRef = useRef(null);
  const valueRef = useRef(null);
  const renderRef = useRef(null);
  const socketRef = useRef(null);
  const [value, setValue] = useState("");
  const [auth, setAuth] = useState("");
  const [activeFile, setActiveFile] = useState({});
  const [files, setFiles] = useState([]);
  const [project, setProject] = useState({});
  const [render, setRender] = useState(false);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const { isOpen, onOpen } = useDisclosure();

  const onMount = (editor, monaco) => {
    editorRef.current = editor;
    editor.focus();
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      saveFile();
      setTimeout(() => renderView(), 300);
    });
  };

  const saveFile = async () => {
    const { name, type, project_id, parentId } = activeFileRef.current;

    await fetch(`${url}/api/file/edit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        type,
        projectId: project_id,
        parentId,
        code: valueRef.current,
      }),
    });
  };

  const fetchFiles = async () => {
    const filesResponse = await fetch(`${url}/api/project/file?id=${id}`);
    const files = await filesResponse.json();

    if (files.length > 0) {
      const updatedFiles = files.map((file, index) => ({
        ...file,
        isTab: index === 0 ? true : file.isTab || false,
      }));
      console.log(updatedFiles);

      setFiles(updatedFiles);
      setActiveFile(updatedFiles[0]);
    }
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

  const checkAuth = async (project) => {
    const infoReponse = await fetch(`${url}/api/user/info`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (infoReponse.status !== 200) {
      setAuth("TokenExpired");
      onOpen();
      return;
    }

    const user = await infoReponse.json();
    if (user.id !== project.user_id) {
      setAuth("NotUser");
      onOpen();
      return;
    }
  };

  const handleNavigate = () => {
    navigate("/user/signin");
  };

  const renderView = () => {
    setRender(!renderRef.current);
  };

  useEffect(() => {
    fetchProject();
    fetchFiles();
  }, []);

  useEffect(() => {
    console.log(project);
    if (project.id) {
      checkAuth(project);
      socketRef.current = io(url);

      socketRef.current.on("connect", () => {
        console.log("Connected to server");
        setIsSocketConnected(true);

        socketRef.current.emit(
          "register",
          `project${project.id}`,
          (response) => {
            if (response === "success") {
              console.log("success");
              fetch(`${url}/api/project/terminal?id=${project.id}`);
            }
          }
        );

        // socketRef.current.on("registered", () => {
        //   fetch(`${url}/api/project/terminal?id=${project.id}`);
        // });
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
    activeFileRef.current = activeFile;
  }, [activeFile]);

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  useEffect(() => {
    renderRef.current = render;
  }, [render]);

  return (
    <DarkMode>
      <Box minH="100vh" bg="#2C2C32" color="gray.500">
        <Header />
        <Modal isOpen={isOpen} onClose={handleNavigate}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader color="white">Alert</ModalHeader>
            <ModalCloseButton onClick={handleNavigate} color="gray.500" />
            <ModalBody color="white">
              {auth === "TokenExpired"
                ? "Your token is expired, please sign in again!"
                : "Your account have no authentication to edit this project, please sign in with right account!"}
            </ModalBody>

            <ModalFooter>
              <Button colorScheme="blue" mr={3} onClick={handleNavigate}>
                Sign In Now!
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
        <Flex px={6} py={6} h="89vh">
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
              files={files.filter((file) => !file.isFolder && file.isTab)}
              setFiles={setFiles}
              activeFile={activeFile}
              setActiveFile={setActiveFile}
            />
            <Editor
              height="72%"
              theme="vs-dark"
              language={activeFile.type}
              value={value}
              onChange={(value) => setValue(value)}
              onMount={onMount}
              options={{
                fontSize: 20,
              }}
            />
            {isSocketConnected && (
              <Terminal
                files={files}
                socket={socketRef.current}
                project={project}
                setFiles={setFiles}
              />
            )}
            {/* <Flex alignItems="center">
              <Button
                // mt="0.5rem"
                onClick={() => {
                  saveFile();
                  renderView();
                }}
              >
                Save
              </Button>
            </Flex> */}
          </Box>
          <Box flex="3">
            {project.id && (
              <WebView url={project.url} type={project.type} key={render} />
            )}
          </Box>
        </Flex>
      </Box>
    </DarkMode>
  );
};

export default CodeEditor;
