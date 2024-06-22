import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
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

  const checkToken = () => {
    const tokenCookie = Cookies.get("token");

    if (!tokenCookie) {
      navigate("/user/signin");
    } else {
      fetchInfo();
      fetchProjects();
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

  const fetchProjects = async () => {
    console.log(`${url}/api/user/projects`);
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
    Cookies.remove("token");

    navigate("/user/signin");
  };

  useEffect(() => {
    checkToken();
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
            <ModalBody color="white">
              Your token is expired. Please Sign in again.
            </ModalBody>

            <ModalFooter>
              <Button colorScheme="blue" mr={3} onClick={handleNavigate}>
                Sign In Now!
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
        <Flex justifyContent="space-evenly" alignItems="center" h="87vh">
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
            maxW="800px"
            p="20px"
            bg="gray.800"
            boxShadow="lg"
            borderRadius="10%"
            border="1px"
            borderColor="gray.600"
          >
            <Box mb="4" p="0 2rem">
              <Text color="lightblue" my="1rem">
                Name
              </Text>
              <Text my="1rem" color="teal.300" fontSize={28} fontWeight="bold">
                {user.name}
              </Text>
              <Text color="lightblue" my="1rem">
                Email
              </Text>
              <Text my="1rem" color="teal.300" fontSize={28} fontWeight="bold">
                {user.email}
              </Text>
              <Text color="lightblue" my="1rem">
                Project count
              </Text>
              <Text my="1rem" color="teal.300" fontSize={28} fontWeight="bold">
                {projects.length}
              </Text>
            </Box>
            <Flex justifyContent="center" alignItems="center" h="20vh">
              <Button
                colorScheme="cyan"
                width="80%"
                onClick={() => handleLogout()}
              >
                Log out
              </Button>
            </Flex>
          </Box>
        </Flex>
      </Box>
    </DarkMode>
  );
};

export default Profile;
