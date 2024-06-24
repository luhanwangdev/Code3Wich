import { useState, useEffect } from "react";
import { Box, DarkMode } from "@chakra-ui/react";

const WebView = ({ url }) => {
  const [reloadUrl, setReloadUrl] = useState("");

  useEffect(() => {
    setReloadUrl(`${url}?t=${new Date().getTime()}`);
  }, []);

  return (
    <DarkMode>
      <Box mt="2.5rem" height="92vh" background="white">
        <iframe
          src={reloadUrl}
          style={{ width: "100%", height: "100%", border: "none" }}
          title="web-view"
        />
      </Box>
    </DarkMode>
  );
};

export default WebView;
