import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Select,
  Text,
} from "@chakra-ui/react";
import Header from "./components/Header";

function App() {
  const [user, setUser] = useState({});
  const [projects, setProjects] = useState([]);
  const projectNameRef = useRef();
  const projectTypeRef = useRef();

  const fetchProjects = async () => {
    const projectReponse = await fetch(
      `http://localhost:3000/api/project/user?id=${user.id}`
    );
    const projects = await projectReponse.json();
    setProjects(projects);
  };

  const createProject = async (name, type) => {
    let isDynamic = false;
    if (type === "Dynamic") {
      isDynamic = true;
    }

    await fetch("http://localhost:3000/api/project", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        userId: user.id,
        isDynamic,
      }),
    });

    fetchProjects();
  };

  const deleteProject = async (id) => {
    await fetch(`http://localhost:3000/api/project?id=${id}`, {
      method: "DELETE",
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
      <Text my="2rem" color="white" fontSize={32}>
        {`${user.name}'s Projects:`}
      </Text>
      {projects.map((project) => (
        <Flex alignItems="center">
          <Link to={`project/${project.id}`}>
            <Text my="1rem" color="orange" fontSize={20}>
              {project.name}
            </Text>
          </Link>
          <Button
            ml="2rem"
            onClick={() => {
              deleteProject(project.id);
            }}
          >
            Delete
          </Button>
        </Flex>
      ))}
      <FormControl mt="2rem">
        <FormLabel>Project Name:</FormLabel>
        <Input type="text" ref={projectNameRef} width="200px" />
        <FormLabel>Project Type:</FormLabel>
        <Select
          placeholder="Select project type"
          ref={projectTypeRef}
          width="200px"
        >
          <option>Static</option>
          <option>Dynamic</option>
        </Select>
        <Button
          m="1rem"
          onClick={() => {
            createProject(
              projectNameRef.current.value,
              projectTypeRef.current.value
            );
          }}
        >
          +
        </Button>
      </FormControl>
    </Box>
  );
}

export default App;
