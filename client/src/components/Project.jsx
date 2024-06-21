import { useEffect, useRef, useState } from "react";
import Cookies from "js-cookie";
import { Link, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import Header from "./Header";

function Project() {
  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const projectNameRef = useRef();
  const projectTypeRef = useRef();

  const { isOpen, onOpen, onClose } = useDisclosure();

  const checkToken = () => {
    const tokenCookie = Cookies.get("token");

    if (!tokenCookie) {
      onOpen();
    } else {
      fetchInfo();
      fetchProjects();
    }
  };

  const handleNavigate = () => {
    navigate("/user/signin");
    onClose();
  };

  const fetchProjects = async () => {
    const projectReponse = await fetch(
      "http://localhost:3000/api/user/projects",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      }
    );

    const projects = await projectReponse.json();
    setProjects(projects);
  };

  const fetchInfo = async () => {
    const infoReponse = await fetch("http://localhost:3000/api/user/info", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    const user = await infoReponse.json();

    setUser(user);
  };

  const createProject = async (name, typeSeletor) => {
    if (loading) {
      return;
    }
    setLoading(true);

    const type = (() => {
      switch (typeSeletor) {
        case "Vanilla JS":
          return "vanilla";
        case "Node":
          return "node";
        case "React":
          return "react";
      }
    })();

    await fetch("http://localhost:3000/api/project", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        credentials: "include",
      },
      body: JSON.stringify({
        name,
        type,
        userId: user.id,
      }),
    });

    setLoading(false);

    fetchProjects();
  };

  const deleteProject = async (id) => {
    await fetch(`http://localhost:3000/api/project?id=${id}`, {
      method: "DELETE",
    });

    fetchProjects();
  };

  useEffect(() => {
    checkToken();
  }, []);

  return (
    <Box minH="100vh" bg="#2C2C32" color="gray.500">
      <Header />
      <Modal isOpen={isOpen} onClose={handleNavigate}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Alert</ModalHeader>
          <ModalCloseButton onClick={handleNavigate} />
          <ModalBody>Please Sign in first.</ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleNavigate}>
              Sign In Now!
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Box px={6}>
        {user.name && (
          <Text my="2rem" color="white" fontSize={32}>
            {`${user.name}'s Projects:`}
          </Text>
        )}

        {projects.map((project) => (
          <Flex alignItems="center">
            <Link to={{ pathname: `/project/${project.id}` }}>
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
            <option>Vanilla JS</option>
            <option>Node</option>
            {/* <option>React</option> */}
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
    </Box>
  );
}

export default Project;
