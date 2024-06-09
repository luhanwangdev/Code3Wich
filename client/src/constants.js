import { faHtml5, faCss3, faJs } from "@fortawesome/free-brands-svg-icons";

export const LANGUAGE_VERSIONS = {
  javascript: "18.15.0",
  typescript: "5.0.3",
  python: "3.10.0",
  java: "15.0.2",
  csharp: "6.12.0",
  php: "8.2.3",
};

export const CODE_SNIPPETS = {
  javascript: `\nfunction greet(name) {\n\tconsole.log("Hello, " + name + "!");\n}\n\ngreet("Alex");\n`,
  html: `html`,
  css: `css`,
};

export const ICON = {
  javascript: { icon: faJs, style: { color: "#ffce47" } },
  html: { icon: faHtml5, style: { color: "#ff6e3d" } },
  css: { icon: faCss3, style: { color: "#1899fb" } },
};
