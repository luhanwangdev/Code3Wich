import {
  Tabs,
  TabList,
  Tab,
  Text,
  DarkMode,
  Button,
  IconButton,
  Box,
} from "@chakra-ui/react";
import { CloseIcon } from "@chakra-ui/icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ICON } from "../constants";

const TabNavigation = ({
  files,
  setFiles,
  activeFile,
  setActiveFile,
  setValue,
}) => {
  const fileNames = files.map((file) => file.name);

  const removeTab = (id) => {
    setFiles((prevFiles) =>
      prevFiles.map((prevFile) =>
        prevFile.id === id ? { ...prevFile, isTab: false } : prevFile
      )
    );

    const firstTabFile = files.find((file) => file.isTab);
    setActiveFile(firstTabFile);
  };

  return (
    <DarkMode>
      <Tabs index={fileNames.indexOf(activeFile.name)}>
        <TabList>
          {!files[0] && (
            <>
              <Box my="1.25rem"></Box> {setValue(null)}
            </>
          )}
          {files.map((file) => (
            <Tab onClick={() => setActiveFile(file)}>
              <FontAwesomeIcon
                icon={ICON[file.type].icon}
                style={ICON[file.type].style}
              />
              <Text mx="0.3rem">{file.name}</Text>
              <IconButton
                aria-label="Close tab"
                icon={<CloseIcon />}
                variant="ghost"
                color="gray.500"
                ml={1}
                h="16px"
                w="16px"
                minW="16px"
                fontSize="10px"
                onClick={(e) => {
                  e.stopPropagation();
                  removeTab(file.id);
                }}
              />
            </Tab>
          ))}
        </TabList>
      </Tabs>
    </DarkMode>
  );
};

export default TabNavigation;
