import { useRef } from "react";
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

const SideBar = ({
  files,
  setFiles,
  activeFile,
  setActiveFile,
  activeProject,
}) => {
  const fileNameRef = useRef();
  const fileTypeRef = useRef();

  const createFile = async (name, type) => {
    const { projectId } = activeProject;
    console.log(projectId);

    await fetch(
      `http://localhost:3000/api/file/edit?name=${name}&projectId=${projectId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          type,
          projectId,
          code: "",
        }),
      }
    );
  };

  const updateFiles = async () => {
    const filesResponse = await fetch(
      "http://localhost:3000/api/file/project?projectId=1"
    );
    const files = await filesResponse.json();

    setFiles(files);
  };

  return (
    <>
      <Box
        as="nav"
        width="200px"
        padding="5"
        boxShadow="md"
        mt="2.5rem"
        bg="gray.900"
      >
        <List spacing={3}>
          {files.map((file) => (
            <ListItem>
              <Link
                display="flex"
                alignItems="center"
                onClick={() =>
                  setActiveFile({
                    name: file.name,
                    type: file.type,
                    location: file.location,
                    project_id: file.project_id,
                  })
                }
              >
                <FontAwesomeIcon
                  icon={ICON[file.type].icon}
                  style={ICON[file.type].style}
                />
                <Text mx="0.5rem">{file.name}</Text>
              </Link>
            </ListItem>
          ))}
        </List>

        <FormControl mt="2rem">
          <FormLabel>file name:</FormLabel>
          <Input type="email" ref={fileNameRef} />
          <FormLabel>file type</FormLabel>
          <Select placeholder="Select file type" ref={fileTypeRef}>
            <option>html</option>
            <option>javascript</option>
            <option>css</option>
          </Select>
          <Button
            my="1rem"
            onClick={() => {
              createFile(fileNameRef.current.value, fileTypeRef.current.value);
              updateFiles();
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
