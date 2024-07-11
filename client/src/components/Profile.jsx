import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  DarkMode,
  Flex,
  Image,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import Header from "./Header";
import { url } from "../constants";
import bigIcon from "/src/assets/big-icon.png";

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const [projects, setProjects] = useState([]);

  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleNavigate = () => {
    navigate("/user/signin");
    onClose();
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
      onOpen();
    }
  };

  const handleLogout = async () => {
    await fetch(`${url}/api/user/logout`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    navigate("/user/signin");
  };

  useEffect(() => {
    fetchInfo();
    fetchProjects();
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
        <Flex justifyContent="space-evenly" alignItems="center" h="89vh">
          <Flex justifyContent="center" alignItems="center" direction="column">
            <Image
              w="15rem"
              src={bigIcon}
              border="2px solid gray"
              borderRadius="50%"
            ></Image>
            <Box>
              <Text my="2rem" color="lightblue" fontSize={28} fontWeight="bold">
                Code3Wich, <br />
                Coding like eating a sandwich.
              </Text>
            </Box>
          </Flex>
          <Box
            w="30vw"
            h="70vh"
            maxW="500px"
            maxH="600px"
            p="20px"
            bg="gray.800"
            boxShadow="lg"
            borderRadius="10%"
            border="1px"
            borderColor="gray.600"
          >
            <Flex
              flexDirection="column"
              w="100%"
              h="100%"
              justifyContent="center"
              alignItems="center"
            >
              <Box w="80%">
                <Box mb="4">
                  <Text color="lightblue" my="1rem">
                    Name
                  </Text>
                  <Text
                    my="1rem"
                    bgGradient="linear(to-r, #add8e6, #ece75f)"
                    bgClip="text"
                    fontSize={28}
                    fontWeight="bold"
                  >
                    {user.name}
                  </Text>
                  <Text color="lightblue" my="1rem">
                    Email
                  </Text>
                  <Text
                    my="1rem"
                    bgGradient="linear(to-r, #add8e6, #ece75f)"
                    bgClip="text"
                    fontSize={28}
                    fontWeight="bold"
                  >
                    {user.email}
                  </Text>
                  <Text color="lightblue" my="1rem">
                    Project count
                  </Text>
                  <Text
                    my="1rem"
                    bgGradient="linear(to-r, #add8e6, #ece75f)"
                    bgClip="text"
                    fontSize={28}
                    fontWeight="bold"
                  >
                    {projects.length}
                  </Text>
                </Box>
                <Flex justifyContent="center" alignItems="center" h="20vh">
                  <Button
                    colorScheme="cyan"
                    width="100%"
                    onClick={() => handleLogout()}
                  >
                    Log Out
                  </Button>
                </Flex>
              </Box>
            </Flex>
          </Box>
        </Flex>
      </Box>
    </DarkMode>
  );
};

export default Profile;
