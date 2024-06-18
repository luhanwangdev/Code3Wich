import { Box } from "@chakra-ui/react";
import React from "react";

const WebView = ({ url }) => {
  return (
    <Box mt="2.5rem" height="92vh">
      <iframe
        src={url}
        style={{ width: "100%", height: "100%", border: "none" }}
        title="web-view"
      />
    </Box>
    // <div style={{ width: "100%", height: "100%", overflow: "hidden" }}>
    //   <iframe
    //     src={url}
    //     style={{ width: "100%", height: "100%", border: "none" }}
    //     title="web-view"
    //   />
    // </div>
  );
};

export default WebView;
