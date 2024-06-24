import { useEffect, useRef, useState } from "react";
import {
  Box,
  List,
  ListItem,
  Text,
  Link,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  DarkMode,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  ModalFooter,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  useDisclosure,
} from "@chakra-ui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ICON } from "../constants";
import { url } from "../constants";

const SideBar = ({ files, setFiles, activeFile, setActiveFile, projectId }) => {
  const fileNameRef = useRef();
  const fileTypeRef = useRef();
  const fileParentRef = useRef();

  const [showFiles, setShowFiles] = useState([]);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [isMenuVisible, setMenuVisible] = useState(false);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const menuRef = useRef(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [fileName, setFileName] = useState("");
  const [mouseFile, setMouseFile] = useState("");
  const [menuFile, setMenuFile] = useState("");

  const handleContextMenu = (event) => {
    event.preventDefault();
    setMenuFile(mouseFile);
    setMenuPosition({ x: event.clientX, y: event.clientY });
    setMenuVisible(true);
  };

  const handleMouseEnter = (file) => {
    setMouseFile(file);
  };

  const handleMouseLeave = () => {
    setMouseFile(null);
  };

  const handleClick = (event) => {
    if (menuRef.current && !menuRef.current.contains(event.target)) {
      setMenuVisible(false);
    }
  };

  const handleNewFile = () => {
    setMenuVisible(false);
    setIsCreatingFolder(false);
    onOpen();
  };

  const handleNewFolder = () => {
    setMenuVisible(false);
    setIsCreatingFolder(true);
    onOpen();
  };

  const handleDeleteFile = async (id) => {
    await fetch(`${url}/api/file/${id}`, {
      method: "DELETE",
    });

    updateFiles();
  };

  const handleCreateFile = async (name, isFolder) => {
    const parentId = menuFile ? menuFile.id : 0;

    await fetch(`${url}/api/file/edit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        isFolder,
        projectId,
        parentId,
        code: "",
      }),
    });

    updateFiles();

    // alert(`File created: ${fileName}`);
    setFileName("");
    onClose();
  };

  const createFile = async (name, type, parentId) => {
    await fetch(`${url}/api/file/edit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        type,
        projectId,
        parentId,
        code: "",
      }),
    });

    updateFiles();
  };

  const updateFiles = async () => {
    const filesResponse = await fetch(
      `${url}/api/file/project?projectId=${projectId}`
    );
    const files = await filesResponse.json();

    console.log("in updateFiles");
    setFiles(files);
  };

  const clickFile = async (file) => {
    if (!file.isFolder) {
      setActiveFile({
        name: file.name,
        type: file.type,
        location: file.location,
        project_id: file.project_id,
      });
      return;
    }

    const folder = file;

    if (!folder.isOpen) {
      folder.isOpen = true;

      setShowFiles((prevShowFiles) => [
        ...prevShowFiles,
        ...files.filter((file) => file.parent_file_id === folder.id),
      ]);
    } else {
      folder.isOpen = false;

      setShowFiles((prevShowFiles) =>
        prevShowFiles.filter((file) => file.parent_file_id !== folder.id)
      );
    }
  };
  useEffect(() => {
    document.addEventListener("click", handleClick);
    // document.addEventListener("contextmenu", handleContextMenu);

    return () => {
      document.removeEventListener("click", handleClick);
      // document.removeEventListener("contextmenu", handleContextMenu);
    };
  }, []);

  useEffect(() => {
    setShowFiles(files.filter((file) => file.parent_file_id === 0));
  }, [files]);

  return (
    <DarkMode>
      <Box
        onContextMenu={(e) => handleContextMenu(e)}
        as="nav"
        w="200px"
        h="92vh"
        padding="5"
        boxShadow="md"
        mt="2.5rem"
        bg="gray.800"
      >
        {isMenuVisible && (
          <Menu isOpen={isMenuVisible}>
            <MenuButton
              as={Button}
              position="absolute"
              top={`${menuPosition.y}px`}
              left={`${menuPosition.x}px`}
              style={{ display: "none" }}
              ref={menuRef}
            />
            <MenuList
              position="absolute"
              top={`${menuPosition.y}px`}
              left={`${menuPosition.x}px`}
            >
              {((menuFile && menuFile.type === "folder") || !menuFile) && (
                <MenuItem onClick={handleNewFile}>New File</MenuItem>
              )}
              {((menuFile && menuFile.type === "folder") || !menuFile) && (
                <MenuItem onClick={handleNewFolder}>New Folder</MenuItem>
              )}
              {menuFile && (
                <MenuItem onClick={() => handleDeleteFile(menuFile.id)}>
                  Delete
                </MenuItem>
              )}
            </MenuList>
          </Menu>
        )}

        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              {isCreatingFolder ? "Create New Folder" : "Create New File"}
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <FormControl id="file-name" isRequired>
                <FormLabel>
                  {isCreatingFolder ? "Folder Name" : "File name"}
                </FormLabel>
                <Input
                  placeholder={
                    isCreatingFolder ? "Enter Folder Name" : "Enter File name"
                  }
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                />
              </FormControl>
            </ModalBody>
            <ModalFooter>
              <Button
                colorScheme="blue"
                mr={3}
                onClick={() =>
                  isCreatingFolder
                    ? handleCreateFile(fileName, true)
                    : handleCreateFile(fileName, false)
                }
              >
                Create
              </Button>
              <Button onClick={onClose}>Cancel</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
        <List spacing={3}>
          {showFiles.map((file) => (
            <Box>
              <Link
                display="flex"
                alignItems="center"
                onClick={() => clickFile(file)}
                _hover={{ color: "cyan.200", textDecoration: "none" }}
                onMouseEnter={() => handleMouseEnter(file)}
                onMouseLeave={handleMouseLeave}
              >
                <FontAwesomeIcon
                  icon={ICON[file.type].icon}
                  style={ICON[file.type].style}
                />
                <Text mx="0.5rem">{file.name}</Text>
              </Link>
            </Box>
          ))}
        </List>

        {/* <FormControl mt="2rem">
          <FormLabel>file name:</FormLabel>
          <Input type="text" ref={fileNameRef} />
          <FormLabel>file type</FormLabel>
          <Select placeholder="Select file type" ref={fileTypeRef}>
            <option>html</option>
            <option>javascript</option>
            <option>css</option>
            <option>folder</option>
          </Select>
          <FormLabel>parent file id:</FormLabel>
          <Input type="text" ref={fileParentRef} />
          <Button
            my="1rem"
            onClick={() => {
              createFile(
                fileNameRef.current.value,
                fileTypeRef.current.value,
                parseInt(fileParentRef.current.value)
              );
            }}
          >
            +
          </Button>
        </FormControl> */}
      </Box>
    </DarkMode>
  );
};

export default SideBar;
