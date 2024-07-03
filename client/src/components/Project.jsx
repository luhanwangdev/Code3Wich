import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  DarkMode,
  Flex,
  FormControl,
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
  Link as ChakraLink,
} from "@chakra-ui/react";
import { faTrashCan } from "@fortawesome/free-solid-svg-icons";
import Header from "./Header";
import { io } from "socket.io-client";
import { url } from "../constants";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

function Project() {
  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const projectNameRef = useRef();
  const projectTypeRef = useRef();

  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleNavigate = () => {
    navigate("/user/signin");
    onClose();
  };

  const fetchProjects = async () => {
    const projectReponse = await fetch(`${url}/api/user/projects`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (projectReponse.status === 200) {
      const projects = await projectReponse.json();
      console.log(projects);
      setProjects(projects);
    } else {
      console.log(projectReponse.status);
      onOpen();
    }
  };

  const fetchInfo = async () => {
    const infoReponse = await fetch(`${url}/api/user/info`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (infoReponse.status === 200) {
      const user = await infoReponse.json();
      setUser(user);
    } else {
      onOpen();
    }
  };

  const createProject = async (name, typeSeletor) => {
    if (!(name && typeSeletor)) {
      alert("Project name and Project rype are both required!");
      return;
    }

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
        case "Bun":
          return "bun";
      }
    })();

    const createResponse = await fetch(`${url}/api/project`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        name,
        type,
        userId: user.id,
      }),
    });

    setLoading(false);

    projectNameRef.current.value = null;
    projectTypeRef.current.value = "Select project type";

    if (createResponse.status === 200) {
      fetchProjects();
    } else {
      alert("Project creation failed. Please try again.");
    }
  };

  const deleteProject = async (id) => {
    await fetch(`${url}/api/project?id=${id}`, {
      method: "DELETE",
    });

    fetchProjects();
  };

  useEffect(() => {
    fetchInfo();
    fetchProjects();
    const socket = io(url);

    socket.on("connect", () => {
      socket.on("projectStatus", (data) => {
        const { id, status } = data;
        if (status === "success") {
          fetchProjects();
          console.log(`project${id} is created successfully.`);
        } else {
          console.log(`project${id} is failed.`);
        }
      });
    });

    return () => {
      socket.off("connect");
      socket.off("projectStatus");
      socket.disconnect();
    };
  }, []);

  return (
    <DarkMode>
      <Box minH="100vh" bg="#2C2C32" color="gray.500">
        <Header />
        <Modal isOpen={isOpen} onClose={handleNavigate}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader color="white">Alert</ModalHeader>
            <ModalCloseButton onClick={handleNavigate} color="gray.500" />
            <ModalBody color="white">Please Sign in first.</ModalBody>

            <ModalFooter>
              <Button colorScheme="blue" mr={3} onClick={handleNavigate}>
                Sign In Now!
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
        <Box px={6}>
          {user.name && (
            <Text
              m="2rem"
              ml="7rem"
              color="teal.300"
              fontSize={32}
              fontWeight="bold"
            >
              {`${user.name}'s Projects:`}
            </Text>
          )}

          <Flex wrap="wrap" w="75vw" mx="auto">
            {projects.map((project) => (
              <Box
                w="20vw"
                h="40vh"
                maxH="300px"
                maxW="400px"
                p="20px"
                bg="gray.700"
                boxShadow="lg"
                borderRadius="10%"
                border="2px"
                borderColor="gray.600"
                m="2rem"
              >
                <Box p="0 1rem">
                  <Text color="lightblue" my="0.5rem">
                    Project Name
                  </Text>
                  <Text
                    my="0.5rem"
                    color="teal.200"
                    fontSize={28}
                    fontWeight="bold"
                  >
                    {project.name}
                  </Text>
                  {project.status === "loading" && (
                    <Text color="lightblue" my="0.5rem">
                      Loading Project...
                    </Text>
                  )}
                  {project.status === "done" && (
                    <Text color="lightblue" my="0.5rem">
                      Project URL
                    </Text>
                  )}
                  {project.status === "done" && (
                    <Box
                      my="0.5rem"
                      color="gray.300"
                      fontSize="14px"
                      fontWeight="bold"
                    >
                      <ChakraLink href={project.url} isExternal>
                        {project.url}
                      </ChakraLink>
                    </Box>
                  )}
                </Box>
                {project.status === "done" && (
                  <Flex
                    justifyContent="space-between"
                    alignItems="center"
                    h="13vh"
                  >
                    <Link to={{ pathname: `/project/${project.id}` }}>
                      <Button colorScheme="cyan" width="13vw">
                        Edit
                      </Button>
                    </Link>
                    <Button
                      colorScheme="gray"
                      width="3vw"
                      onClick={() => deleteProject(project.id)}
                    >
                      <FontAwesomeIcon
                        icon={faTrashCan}
                        style={{ fontSize: "1rem", color: "#9DECF9" }}
                      />
                    </Button>
                  </Flex>
                )}
              </Box>
            ))}
            <Box
              w="20vw"
              h="40vh"
              maxH="300px"
              maxW="400px"
              p="20px"
              bg="gray.700"
              boxShadow="lg"
              borderRadius="10%"
              border="2px"
              borderColor="gray.600"
              m="2rem"
            >
              <Flex justifyContent="center">
                <Box w="200px">
                  <FormControl>
                    <Text color="lightblue" my="0.5rem">
                      Project Name:
                    </Text>
                    <Input type="text" ref={projectNameRef} width="200px" />
                    <Text color="lightblue" my="0.5rem">
                      Project Type:
                    </Text>
                    <Select
                      placeholder="Select project type"
                      ref={projectTypeRef}
                      width="200px"
                    >
                      <option>Vanilla JS</option>
                      <option>Node</option>
                      {/* <option>Bun</option> */}
                      {/* <option>React</option> */}
                    </Select>
                    <Button
                      mt="2rem"
                      colorScheme="cyan"
                      width="100%"
                      onClick={() => {
                        createProject(
                          projectNameRef.current.value,
                          projectTypeRef.current.value
                        );
                      }}
                    >
                      Create
                    </Button>
                  </FormControl>
                </Box>
              </Flex>
            </Box>
          </Flex>
        </Box>
      </Box>
    </DarkMode>
  );
}

export default Project;
