import { BrowserRouter, Routes, Route } from "react-router-dom";
import ReactDOM from "react-dom/client";
import { ChakraProvider } from "@chakra-ui/react";
import "./index.css";
import App from "./App.jsx";
import CodeEditor from "./components/CodeEditor.jsx";
import Signup from "./components/Signup.jsx";
import Signin from "./components/Signin.jsx";
import Project from "./components/Project.jsx";
import Profile from "./components/Profile.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <ChakraProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/project/:id" element={<CodeEditor />} />
        <Route path="/user/signin" element={<Signin />} />
        <Route path="/user/signup" element={<Signup />} />
        <Route path="/projects" element={<Project />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </BrowserRouter>
  </ChakraProvider>
);
