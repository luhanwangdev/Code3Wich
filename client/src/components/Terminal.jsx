import React, { useEffect, useRef } from "react";
import * as xterm from "@xterm/xterm";
import "@xterm/xterm/css/xterm.css";
import { WebLinksAddon } from "@xterm/addon-web-links";
import { Box } from "@chakra-ui/react";

const Terminal = ({ url }) => {
  const terminalRef = useRef(null);
  const termRef = useRef(null);

  useEffect(() => {
    const term = new xterm.Terminal({
      rows: 7,
    });
    termRef.current = term;

    const webLinksAddon = new WebLinksAddon();

    term.loadAddon(webLinksAddon);
    term.open(terminalRef.current);
    term.write(
      "\x1B[38;5;208mCode3Wich\x1B[0m $ Welcome to \x1B[38;5;208mCode3Wich\x1B[0m!\r\n"
    );

    term.onData((data) => {
      term.write(data);
      if (data === "\r") {
        term.write("\n\x1B[38;5;208mCode3Wich\x1B[0m $ ");
      }
    });

    return () => {
      term.dispose();
      termRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (termRef.current && url) {
      termRef.current.write(
        `\x1B[38;5;208mCode3Wich\x1B[0m $ Your website is host on \x1B[38;5;208m${url}\x1B[0m`
      );
      termRef.current.write("\r\n\x1B[38;5;208mCode3Wich\x1B[0m $ ");
    }
  }, [url]);

  return (
    <Box>
      <div ref={terminalRef} style={{ width: "100%" }} />
    </Box>
  );
};

export default Terminal;
