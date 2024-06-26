import React, { useEffect, useRef } from "react";
import * as xterm from "@xterm/xterm";
import "@xterm/xterm/css/xterm.css";
import { WebLinksAddon } from "@xterm/addon-web-links";
import { Box, DarkMode } from "@chakra-ui/react";
import { url } from "../constants";

const Terminal = ({ files, setFiles, socket, project }) => {
  const terminalRef = useRef(null);
  const termRef = useRef(null);

  let command = "";

  const handleRunCommand = async (socket, command) => {
    socket.emit("execCommand", command);

    if (
      command.startsWith("touch ") ||
      command.startsWith("mkdir ") ||
      command.startsWith("rm ")
    ) {
      setTimeout(() => updateFiles(), 300);
    }
  };

  const updateFiles = async () => {
    const notTabFiles = files.filter((file) => !file.isTab);

    console.log(notTabFiles);

    const filesResponse = await fetch(
      `${url}/api/project/file?id=${project.id}`
    );
    const updatedFiles = await filesResponse.json();

    const readyFiles = updatedFiles.map((file) => {
      const notTab = notTabFiles.find(
        (notTabFile) => notTabFile.id === file.id
      );

      return notTab ? { ...file, isTab: false } : { ...file, isTab: true };
    });

    setFiles(readyFiles);
  };

  useEffect(() => {
    const term = new xterm.Terminal({
      rows: 7,
    });
    termRef.current = term;

    const webLinksAddon = new WebLinksAddon();

    term.loadAddon(webLinksAddon);

    term.open(terminalRef.current);
    term.write("Code3Wich $ Welcome to \x1B[38;5;208mCode3Wich\x1B[0m!\r\n");

    socket.on("execOutput", (data) => {
      console.log("Output from container:", data);
      term.write(`\r\n${data} $ `);
    });

    socket.on("execError", (error) => {
      console.error("Error during command execution:", error);
      term.write(`\n${error}`);
      term.write(`\nCode3Wich/${project.name} $ `);
    });

    socket.on("disconnect", () => {
      console.log("Terminal is disconnected from server");
    });

    term.onKey((e) => {
      if (e.key === "\x7F" && command.length > 0) {
        term.write("\b \b");
        command = command.slice(0, -1);
      } else if (e.key !== "\x7F") {
        term.write(e.key);
        command += e.key;
      }

      if (e.key === "\r") {
        handleRunCommand(socket, command);
        command = "";
      }
    });

    term.onData((data) => {
      if (data.length > 1) term.write(key);
    });

    return () => {
      term.dispose();
      termRef.current = null;

      socket.off();
    };
  }, []);

  useEffect(() => {
    if (termRef.current && project.url) {
      termRef.current.write(
        `Code3Wich $ Your website is host on\r\n\x1B[38;5;208m${project.url}\x1B[0m`
      );
      termRef.current.write("\r\n" + `Code3Wich/${project.name} $ `);
    }
  }, [project]);

  return (
    <DarkMode>
      <Box>
        <div ref={terminalRef} style={{ width: "100%" }} />
      </Box>
    </DarkMode>
  );
};

export default Terminal;
