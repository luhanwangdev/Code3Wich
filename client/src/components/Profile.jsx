import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Image,
  Input,
  Text,
} from "@chakra-ui/react";
import Header from "./Header";

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const [projects, setProjects] = useState([]);

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
    const infoReponse = await fetch("http://localhost:3000/api/user/info", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    const user = await infoReponse.json();
    console.log(user);

    setUser(user);
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

  const handleLogout = async () => {
    Cookies.remove("token");

    navigate("/user/signin");
  };

  useEffect(() => {
    checkToken();
  }, []);

  return (
    <Box minH="100vh" bg="#2C2C32" color="gray.500">
      <Header />
      <Flex justifyContent="space-evenly" alignItems="center" h="87vh">
        <Flex justifyContent="center" alignItems="center" direction="column">
          <Image
            w="15rem"
            src="/src/assets/big-icon.png"
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
  );
};

export default Profile;
