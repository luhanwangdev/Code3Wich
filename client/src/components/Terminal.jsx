import React, { useEffect, useRef } from "react";
import * as xterm from "@xterm/xterm";
import "@xterm/xterm/css/xterm.css";
import { WebLinksAddon } from "@xterm/addon-web-links";
import { Box } from "@chakra-ui/react";

const Terminal = ({ project }) => {
  const terminalRef = useRef(null);
  const termRef = useRef(null);

  const runCommand = async () => {};

  useEffect(() => {
    const term = new xterm.Terminal({
      rows: 7,
    });
    termRef.current = term;

    const webLinksAddon = new WebLinksAddon();

    term.loadAddon(webLinksAddon);

    term.open(terminalRef.current);
    term.write("Code3Wich $ Welcome to \x1B[38;5;208mCode3Wich\x1B[0m!\r\n");

    term.onData((data) => {
      term.write(data);
      if (data === "\r") {
        term.write(`\nCode3Wich/${project.name} $ `);
      }
    });

    return () => {
      term.dispose();
      termRef.current = null;
    };
  }, [project]);

  useEffect(() => {
    if (termRef.current && project.url) {
      termRef.current.write(
        `Code3Wich $ Your website is host on \x1B[38;5;208m${project.url}\x1B[0m`
      );
      termRef.current.write("\r\n" + `Code3Wich/${project.name} $ `);
    }
  }, [project]);

  return (
    <Box>
      <div ref={terminalRef} style={{ width: "100%" }} />
    </Box>
  );
};

export default Terminal;
