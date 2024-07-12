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

    setTimeout(() => updateFiles(), 300);
  };

  const handleCreateFile = async (name, isFolder) => {
    const fileResponse = await fetch(`${url}/api/file/check`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        projectId,
      }),
    });

    const { existed } = await fileResponse.json();
    if (existed) {
      if (isFolder) alert("Folder is existed");
      else alert("File is existed");
      return;
    }

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

    setTimeout(() => updateFiles(), 100);

    // alert(`File created: ${fileName}`);
    setFileName("");
    onClose();
  };

  const updateFiles = async () => {
    const notTabFiles = files.filter((file) => !file.isTab);

    console.log(notTabFiles);

    const filesResponse = await fetch(
      `${url}/api/project/file?id=${projectId}`
    );
    const updatedFiles = await filesResponse.json();

    const readyFiles = updatedFiles.map((file) => {
      const notTab = notTabFiles.find(
        (notTabFile) => notTabFile.id === file.id
      );

      return notTab ? { ...file, isTab: false } : { ...file, isTab: true };
    });

    setFiles(readyFiles);
  };

  const clickFile = async (file) => {
    if (!file.isFolder) {
      setFiles((prevFiles) =>
        prevFiles.map((prevFile) =>
          prevFile.id === file.id ? { ...prevFile, isTab: true } : prevFile
        )
      );

      setActiveFile({
        id: file.id,
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

    return () => {
      document.removeEventListener("click", handleClick);
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
        w="100%"
        h="95%"
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
            <ModalHeader color="white">
              {isCreatingFolder ? "Create New Folder" : "Create New File"}
            </ModalHeader>
            <ModalCloseButton color="white" />
            <ModalBody color="white">
              <FormControl id="file-name" isRequired>
                <FormLabel>
                  {isCreatingFolder ? "Folder Name" : "File name"}
                </FormLabel>
                <Input
                  color="white"
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
