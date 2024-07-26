import { useEffect, useRef, useState } from "react";
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

const Signin = () => {
  const navigate = useNavigate();
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

  const handleSignin = async (email, password) => {
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
      userEmailRef.current.value = null;
      userPasswordRef.current.value = null;
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
      userEmailRef.current.value = null;
      userPasswordRef.current.value = null;
      return;
    }

    const signInResponse = await fetch(`${url}/api/user/signin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        email,
        password,
      }),
    });

    if (signInResponse.status === 200) {
      navigate(`/projects`);
      return;
    }

    toast({
      title: "Wrong Email or Password!",
      position: "top",
      description: "Please check them all again.",
      status: "error",
      duration: 2000,
      isClosable: true,
      variant: "subtle",
    });
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
                  <FormLabel color="lightblue" my="1rem">
                    Email
                  </FormLabel>
                  <Input
                    type="email"
                    bg="gray.700"
                    borderColor="gray.600"
                    ref={userEmailRef}
                    defaultValue="test@example.com"
                  />
                  <FormLabel color="lightblue" my="1rem">
                    Password
                  </FormLabel>
                  <Input
                    type="password"
                    bg="gray.700"
                    borderColor="gray.600"
                    ref={userPasswordRef}
                    defaultValue="test"
                  />
                </FormControl>
                <Flex justifyContent="center" alignItems="center" h="15vh">
                  <Button
                    colorScheme="cyan"
                    width="100%"
                    onClick={() =>
                      handleSignin(
                        userEmailRef.current.value,
                        userPasswordRef.current.value
                      )
                    }
                  >
                    Sign In
                  </Button>
                </Flex>
                <Flex flexDirection="column" alignItems="center" h="15vh">
                  <Box
                    width="80%"
                    height="3px"
                    bg="gray.600"
                    my="4"
                    mb="3rem"
                  />
                  <Button
                    colorScheme="cyan"
                    variant="outline"
                    width="100%"
                    onClick={() => {
                      navigate("/user/signup");
                    }}
                  >
                    Sign Up
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

export default Signin;
