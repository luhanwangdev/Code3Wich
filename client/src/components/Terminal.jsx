import React, { useEffect, useRef } from "react";
import { socket } from "../socket.js";
import * as xterm from "@xterm/xterm";
import "@xterm/xterm/css/xterm.css";
import { WebLinksAddon } from "@xterm/addon-web-links";
import { Box } from "@chakra-ui/react";

const Terminal = ({ project }) => {
  const terminalRef = useRef(null);
  const termRef = useRef(null);

  let command = "";

  const socketWithServer = (socket, term) => {
    socket.on("connect", () => {
      console.log("Connected to server");
      socket.emit("register", "terminal");
    });

    // socket.on("execStart", (message) => {
    //   console.log(message);
    // });

    socket.on("execOutput", (data) => {
      console.log("Output from container:", data);

      const cleanData = data.replace(
        /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
        ""
      );
      // const lines = cleanData.split("\n\r");
      // lines.pop();

      // console.log(lines);
      // console.log(finalOutput);

      // const finalOutput = lines.join("\n");
      console.log("Output from container:", cleanData);

      term.write(`\r\n${cleanData} $ `);
      // term.write(`\r\napple\nbbbccccc $ `);
      // term.write(`\r\nCode3Wich/${project.name} $ `);
    });

    // socket.on("execComplete", (output) => {
    //   console.log("Command execution complete:", output);
    // });

    socket.on("execError", (error) => {
      console.error("Error during command execution:", error);
      term.write(`\n${error}`);
      term.write(`\nCode3Wich/${project.name} $ `);
    });

    // socket.on("execEnd", (message) => {
    //   console.log(message);
    // });

    socket.on("disconnect", () => {
      console.log("Terminal is disconnected from server");
    });
  };

  const runCommand = async (socket, command) => {
    console.log(`command: ${command}`);

    socket.emit("execCommand", command);

    // const terminalResponse = await fetch(
    //   "http://localhost:3000/api/project/terminal",
    //   {
    //     method: "POST",
    //     headers: {
    //       "Content-Type": "application/json",
    //     },
    //     body: JSON.stringify({
    //       projectId: project.id,
    //       command,
    //     }),
    //   }
    // );
    // const terminal = await terminalResponse.json();

    // term.write(`\n${terminal.response}`);
    // term.write(`\nCode3Wich/${project.name} $ `);
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
    socketWithServer(socket, term);

    term.onKey((e) => {
      if (e.key === "\x7F" && command.length > 0) {
        term.write("\b \b");
        command = command.slice(0, -1);
      } else if (e.key !== "\x7F") {
        term.write(e.key);
        command += e.key;
      }

      if (e.key === "\r") {
        runCommand(socket, command);
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
