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
  const editorRef = useRef();
  const socketRef = useRef(null);
  const [value, setValue] = useState("");
  const [auth, setAuth] = useState("");
  const [activeFile, setActiveFile] = useState({});
  const [files, setFiles] = useState([]);
  const [project, setProject] = useState({});
  const [render, setRender] = useState(false);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const onMount = (editor) => {
    editorRef.current = editor;
    editor.focus();
  };

  const saveFile = async () => {
    const { name, type, project_id, parentId } = activeFile;
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
    setRender(!render);
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

      console.log(socketRef.current);

      socketRef.current.on("connect", () => {
        console.log("Connected to server");
        setIsSocketConnected(true);

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
            {isSocketConnected && (
              <Terminal
                socket={socketRef.current}
                project={project}
                setFiles={setFiles}
              />
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
