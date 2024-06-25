import { faHtml5, faCss3, faJs } from "@fortawesome/free-brands-svg-icons";
import { faFolder } from "@fortawesome/free-solid-svg-icons";
import { faFile } from "@fortawesome/free-regular-svg-icons";

export const CODE_SNIPPETS = {
  javascript: `\nfunction greet(name) {\n\tconsole.log("Hello, " + name + "!");\n}\n\ngreet("Alex");\n`,
  html: `html`,
  css: `css`,
};

export const ICON = {
  javascript: { icon: faJs, style: { color: "#ffce47" } },
  typescript: { icon: faJs, style: { color: "#3178C6" } },
  html: { icon: faHtml5, style: { color: "#ff6e3d" } },
  css: { icon: faCss3, style: { color: "#1899fb" } },
  json: { icon: faFile, style: { color: "#a6a6a6" } },
  folder: { icon: faFolder, style: { color: "#a6a6a6" } },
};

// export const url = "http://localhost:3000";
export const url = "";
