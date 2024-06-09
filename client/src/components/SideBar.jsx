import { Box, List, ListItem, Text, Link } from "@chakra-ui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ICON } from "../constants";

const SideBar = ({ files, setFiles, activeFile, setActiveFile }) => {
  console.log(ICON.html);

  return (
    <>
      <Box
        as="nav"
        width="200px"
        padding="5"
        boxShadow="md"
        mt="5rem"
        bg="gray.900"
      >
        <List spacing={3}>
          {files.map((file) => (
            <ListItem>
              <Link
                display="flex"
                alignItems="center"
                onClick={() => setActiveFile(`${file.name}`)}
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
      </Box>
    </>
  );
};

export default SideBar;
