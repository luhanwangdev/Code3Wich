import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Text,
} from "@chakra-ui/react";
import Header from "./components/Header";

function App() {
  const [user, setUser] = useState({});
  const [projects, setProjects] = useState([]);
  const projectNameRef = useRef();

  const fetchProjects = async () => {
    const projectReponse = await fetch(
      `http://localhost:3000/api/project/user?id=${user.id}`
    );
    const projects = await projectReponse.json();
    setProjects(projects);
    console.log(projects);
  };

  const createProject = async (name) => {
    await fetch("http://localhost:3000/api/project", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        userId: user.id,
      }),
    });

    fetchProjects();
  };

  useEffect(() => {
    setUser({
      name: "Kyle",
      id: 1,
    });
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [user]);

  return (
    <Box minH="100vh" bg="#2C2C32" color="gray.500" px={6} py={8}>
      <Header />
      <Text color="white" fontSize={40} fontWeight="bold">
        Welcome to mySandBox!
      </Text>
      <Text my="2rem" color="white" fontSize={32}>
        {`${user.name}'s Projects:`}
      </Text>
      {projects.map((project) => (
        <Link to={`project/${project.id}`}>
          <Text my="1rem" color="orange" fontSize={20}>
            {project.name}
          </Text>
        </Link>
      ))}
      <FormControl mt="2rem">
        <FormLabel>Project Name:</FormLabel>
        <Input type="text" ref={projectNameRef} width="200px" />
        <Button
          m="1rem"
          onClick={() => {
            createProject(projectNameRef.current.value);
          }}
        >
          +
        </Button>
      </FormControl>
    </Box>
  );
}

export default App;
