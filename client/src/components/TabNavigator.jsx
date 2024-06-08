import { Tabs, TabList, Tab, Text } from "@chakra-ui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHtml5, faCss3, faJs } from "@fortawesome/free-brands-svg-icons";

const TabNavigation = ({ activeFile, setActiveFile }) => {
  return (
    <Tabs index={["html", "js", "css"].indexOf(activeFile)}>
      <TabList>
        <Tab onClick={() => setActiveFile("html")}>
          <FontAwesomeIcon icon={faHtml5} style={{ color: "#ff6e3d" }} />
          <Text mx="0.5rem">index.html</Text>
        </Tab>
        <Tab onClick={() => setActiveFile("js")}>
          <FontAwesomeIcon icon={faJs} style={{ color: "#ffce47" }} />
          <Text mx="0.5rem">index.js</Text>
        </Tab>
        <Tab onClick={() => setActiveFile("css")}>
          <FontAwesomeIcon icon={faCss3} style={{ color: "#1899fb" }} />
          <Text mx="0.5rem">style.css</Text>
        </Tab>
      </TabList>
    </Tabs>
  );
};

export default TabNavigation;
