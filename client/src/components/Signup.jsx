import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  DarkMode,
  Flex,
  FormControl,
  FormLabel,
  Image,
  Input,
  Text,
  useToast,
} from "@chakra-ui/react";
import Header from "./Header";
import { url } from "../constants";
import bigIcon from "/src/assets/big-icon.png";

const Signup = () => {
  const navigate = useNavigate();
  const userNameRef = useRef();
  const userEmailRef = useRef();
  const userPasswordRef = useRef();
  const toast = useToast();

  const checkLogIn = async () => {
    const infoReponse = await fetch(`${url}/api/user/info`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (infoReponse.status === 200) {
      navigate("/profile");
    }
  };

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const createUser = async (name, email, password) => {
    if (!name) {
      toast({
        title: "Name is empty.",
        position: "top",
        description: "Please enter your name.",
        status: "error",
        duration: 2000,
        isClosable: true,
        variant: "subtle",
      });
      return;
    }

    if (name.length > 20) {
      toast({
        title: "Name can have a maximum of 10 characters!",
        position: "top",
        description: "Please set the name less then 10 characters.",
        status: "error",
        duration: 2000,
        isClosable: true,
        variant: "subtle",
      });
      return;
    }

    if (!email || !isValidEmail(email)) {
      toast({
        title: "Invalid email address.",
        position: "top",
        description: "Please enter a valid email address.",
        status: "error",
        duration: 2000,
        isClosable: true,
        variant: "subtle",
      });
      return;
    }

    if (!password) {
      toast({
        title: "Password is empty.",
        position: "top",
        description: "Please enter your password.",
        status: "error",
        duration: 2000,
        isClosable: true,
        variant: "subtle",
      });
      return;
    }

    const signUpResponse = await fetch(`${url}/api/user/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        name,
        email,
        password,
      }),
    });

    if (signUpResponse.status === 200) {
      navigate(`/projects`);
      return;
    }

    toast({
      title: "The email is already registered!",
      position: "top",
      description: "Please try another email.",
      status: "error",
      duration: 2000,
      isClosable: true,
      variant: "subtle",
    });
    userNameRef.current.value = null;
    userEmailRef.current.value = null;
    userPasswordRef.current.value = null;
  };

  useEffect(() => {
    checkLogIn();
  }, []);

  return (
    <DarkMode>
      <Box minH="100vh" bg="#2C2C32" color="gray.500">
        <Header />
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
                <FormControl mb="4">
                  <FormLabel color="lightblue" mb="1rem">
                    Name
                  </FormLabel>
                  <Input
                    type="text"
                    bg="gray.700"
                    borderColor="gray.600"
                    ref={userNameRef}
                  />
                  <FormLabel color="lightblue" my="1rem">
                    Email
                  </FormLabel>
                  <Input
                    type="email"
                    bg="gray.700"
                    borderColor="gray.600"
                    ref={userEmailRef}
                  />
                  <FormLabel color="lightblue" my="1rem">
                    Password
                  </FormLabel>
                  <Input
                    type="password"
                    bg="gray.700"
                    borderColor="gray.600"
                    ref={userPasswordRef}
                  />
                </FormControl>
                <Flex justifyContent="center" alignItems="center" h="10vh">
                  <Button
                    colorScheme="cyan"
                    width="100%"
                    onClick={() =>
                      createUser(
                        userNameRef.current.value,
                        userEmailRef.current.value,
                        userPasswordRef.current.value
                      )
                    }
                  >
                    Sign Up
                  </Button>
                </Flex>
                <Flex justifyContent="center" alignItems="center" h="5vh">
                  <Box
                    width="80%"
                    height="3px"
                    bg="gray.600"
                    my="2"
                    mb="1rem"
                  />
                </Flex>
                <Flex justifyContent="center" alignItems="center">
                  <Button
                    colorScheme="cyan"
                    variant="outline"
                    width="100%"
                    onClick={() => navigate("/user/signin")}
                  >
                    Sign In
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

export default Signup;
