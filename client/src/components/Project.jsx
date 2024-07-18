import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  DarkMode,
  Flex,
  FormControl,
  Input,
  Select,
  Text,
  Link as ChakraLink,
  useToast,
  Alert,
  AlertIcon,
  LightMode,
} from "@chakra-ui/react";
import { faTrashCan } from "@fortawesome/free-solid-svg-icons";
import Header from "./Header";
import { io } from "socket.io-client";
import { url, projectLimit } from "../constants";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

function Project() {
  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const projectNameRef = useRef();
  const projectTypeRef = useRef();
  const toast = useToast();

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
      setProjects(projects);
    } else {
      toast({
        title: "Not Signed in!",
        position: "top",
        description: "Please sign in first.",
        status: "error",
        duration: 2000,
        isClosable: true,
        variant: "subtle",
      });
      navigate("/user/signin");
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
      toast({
        title: "Not Signed in!",
        position: "top",
        description: "Please sign in first.",
        status: "error",
        duration: 2000,
        isClosable: true,
        variant: "subtle",
      });
      navigate("/user/signin");
    }
  };

  const createProject = async (name, typeSeletor) => {
    if (projects.length >= projectLimit) {
      toast({
        title: `Member in free trial can only have up to ${projectLimit} projects at the same time.`,
        position: "top",
        description: "Please delete some of them before creating new project.",
        status: "warning",
        duration: 3000,
        isClosable: true,
        variant: "subtle",
      });

      projectNameRef.current.value = null;
      projectTypeRef.current.value = "Select project type";
      return;
    }

    if (!(name && typeSeletor)) {
      toast({
        title: "Project name and Project type are both required!",
        position: "top",
        description: "Please fill them both.",
        status: "error",
        duration: 2000,
        isClosable: true,
        variant: "subtle",
      });
      return;
    }

    if (name.length > 10) {
      toast({
        title: "Project name can have a maximum of 10 characters!",
        position: "top",
        description: "Please set the name less then 10 characters.",
        status: "error",
        duration: 2000,
        isClosable: true,
        variant: "subtle",
      });
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
      toast({
        title: "Project creation failed.",
        position: "top",
        description: "Something goes wrong, please try again.",
        status: "error",
        duration: 2000,
        isClosable: true,
        variant: "subtle",
      });
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
        <LightMode>
          <Alert status="info" variant="solid">
            <AlertIcon />
            Due to cost considerations, all projects will be deleted daily at
            3:00 am.
          </Alert>
        </LightMode>

        <Box px={6}>
          <Text
            m="2rem"
            ml="7rem"
            fontSize={32}
            fontWeight="bold"
            bgGradient="linear(to-r, #add8e6, #ece75f)"
            bgClip="text"
          >
            Your Projects:
          </Text>

          <Flex wrap="wrap" w="80vw" mx="auto">
            {projects.map((project) => (
              <Box
                w="21vw"
                h="40vh"
                maxH="350px"
                maxW="400px"
                p="20px"
                bg="gray.700"
                boxShadow="lg"
                borderRadius="10%"
                border="2px"
                borderColor="gray.600"
                m="2rem 2.5rem"
              >
                <Flex h="100%" justifyContent="center" alignItems="center">
                  <Box w="90%">
                    <Box p="0 1rem">
                      <Flex my="0.5rem">
                        <Text color="lightblue">Project Name</Text>
                        <Box color="teal.100" ml="auto" fontWeight="bold">
                          {project.type === "node" ? "Node" : "VanillaJS"}
                        </Box>
                      </Flex>

                      <Text
                        my="0.5rem"
                        color="teal.200"
                        fontSize={28}
                        fontWeight="bold"
                      >
                        {project.name}
                      </Text>
                      {project.status === "loading" && (
                        <Text color="lightblue" mt="0.5rem" mb="7rem">
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
                        mt="3vh"
                      >
                        <Link to={{ pathname: `/project/${project.id}` }}>
                          <Button colorScheme="cyan" width="12vw">
                            Edit
                          </Button>
                        </Link>
                        <Button
                          colorScheme="gray"
                          width="2vw"
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
                </Flex>
              </Box>
            ))}
            <Box
              w="21vw"
              h="40vh"
              maxH="350px"
              maxW="400px"
              p="20px"
              bg="gray.700"
              boxShadow="lg"
              borderRadius="10%"
              border="2px"
              borderColor="gray.600"
              m="2rem 2.5rem"
            >
              <Flex h="100%" justifyContent="center" alignItems="center">
                <Box w="80%">
                  <FormControl>
                    <Text color="lightblue" my="0.5rem">
                      Project Name:
                    </Text>
                    <Input type="text" ref={projectNameRef} />
                    <Text color="lightblue" my="0.5rem">
                      Project Type:
                    </Text>
                    <Select
                      placeholder="Select project type"
                      ref={projectTypeRef}
                    >
                      <option>Vanilla JS</option>
                      <option>Node</option>
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
