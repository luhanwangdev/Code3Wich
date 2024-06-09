import { Tabs, TabList, Tab, Text } from "@chakra-ui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ICON } from "../constants";

const TabNavigation = ({ files, activeFile, setActiveFile }) => {
  const fileNames = files.map((file) => file.name);
  return (
    <Tabs index={fileNames.indexOf(activeFile.name)}>
      <TabList>
        {files.map((file) => (
          <Tab
            onClick={() => setActiveFile({ name: file.name, type: file.type })}
          >
            <FontAwesomeIcon
              icon={ICON[file.type].icon}
              style={ICON[file.type].style}
            />
            <Text mx="0.5rem">{file.name}</Text>
          </Tab>
        ))}
      </TabList>
    </Tabs>
  );
};

export default TabNavigation;
