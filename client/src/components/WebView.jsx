import { Box, DarkMode } from "@chakra-ui/react";

const WebView = ({ url }) => {
  return (
    <DarkMode>
      <Box mt="2.5rem" height="92vh">
        <iframe
          src={url}
          style={{ width: "100%", height: "100%", border: "none" }}
          title="web-view"
        />
      </Box>
    </DarkMode>
  );
};

export default WebView;
