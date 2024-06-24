import { useState, useEffect } from "react";
import { Box, DarkMode, Text } from "@chakra-ui/react";

const WebView = ({ url, type }) => {
  const [reloadUrl, setReloadUrl] = useState("");

  useEffect(() => {
    setReloadUrl(`${url}?t=${new Date().getTime()}`);
  }, []);

  return (
    <DarkMode>
      <Box mt="2.5rem" height="92vh" background="white">
        <iframe
          src={type === "node" ? url : reloadUrl}
          style={{ width: "100%", height: "100%", border: "none" }}
          title="web-view"
        />
      </Box>
    </DarkMode>
  );
};

export default WebView;
