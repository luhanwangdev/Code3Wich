import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ReactDOM from "react-dom/client";
import { ChakraProvider } from "@chakra-ui/react";
import "./index.css";
import App from "./App.jsx";
import User from "./components/User.jsx";
import CodeEditor from "./components/CodeEditor.jsx";
import Login from "./components/Login.jsx";
import Signup from "./components/Signup.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <ChakraProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/user/:id" element={<User />} />
        <Route path="/project/:id" element={<CodeEditor />} />
        <Route path="/user/login" element={<Login />} />
        <Route path="/user/signup" element={<Signup />} />
      </Routes>
    </BrowserRouter>
  </ChakraProvider>
);
