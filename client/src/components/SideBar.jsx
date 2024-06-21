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
} from "@chakra-ui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ICON } from "../constants";

const SideBar = ({ files, setFiles, activeFile, setActiveFile, projectId }) => {
  const fileNameRef = useRef();
  const fileTypeRef = useRef();
  const fileParentRef = useRef();

  const [showFiles, setShowFiles] = useState([]);

  const createFile = async (name, type, parentId) => {
    await fetch(`http://localhost:3000/api/file/edit`, {
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
      `http://localhost:3000/api/file/project?projectId=${projectId}`
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

  const handleContextMenu = (e) => {
    e.preventDefault();
    console.log("right-click");
  };

  useEffect(() => {
    setShowFiles(files.filter((file) => file.parent_file_id === 0));
  }, [files]);

  return (
    <>
      <Box
        onContextMenu={(e) => handleContextMenu(e)}
        as="nav"
        width="200px"
        padding="5"
        boxShadow="md"
        mt="2.5rem"
        bg="gray.900"
      >
        <List spacing={3}>
          {showFiles.map((file) => (
            <Box>
              <Link
                display="flex"
                alignItems="center"
                onClick={() => clickFile(file)}
                _hover={{ color: "cyan.200", textDecoration: "none" }}
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

        <FormControl mt="2rem">
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
        </FormControl>
      </Box>
    </>
  );
};

export default SideBar;
