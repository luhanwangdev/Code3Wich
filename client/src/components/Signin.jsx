import { useRef } from "react";
import Cookies from "js-cookie";
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
} from "@chakra-ui/react";
import Header from "./Header";
import { url } from "../constants";
import bigIcon from "/src/assets/big-icon.png";

const Signin = () => {
  const navigate = useNavigate();
  const userEmailRef = useRef();
  const userPasswordRef = useRef();

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSignin = async (email, password) => {
    if (!email || !isValidEmail(email)) {
      alert("Please enter a valid email address.");
      return;
    }

    if (!password) {
      alert("Please enter your password.");
      return;
    }

    const signinResponse = await fetch(`${url}/api/user/signin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });
    const signinData = await signinResponse.json();

    const { access_token, access_expired } = signinData;
    Cookies.set("token", access_token, { expires: access_expired });

    navigate(`/projects`);
  };

  return (
    <DarkMode>
      <Box minH="100vh" bg="#2C2C32" color="gray.500">
        <Header />
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
            <FormControl mb="4" p="0 2rem">
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
            <Flex justifyContent="center" alignItems="center" h="15vh">
              <Button
                colorScheme="cyan"
                width="80%"
                onClick={() =>
                  handleSignin(
                    userEmailRef.current.value,
                    userPasswordRef.current.value
                  )
                }
              >
                Sign in
              </Button>
            </Flex>
            <Flex flexDirection="column" alignItems="center" h="15vh">
              <Box width="80%" height="3px" bg="gray.600" my="4" mb="3rem" />
              <Button
                colorScheme="cyan"
                variant="outline"
                width="80%"
                onClick={() => {
                  navigate("/user/signup");
                }}
              >
                Register New Account
              </Button>
            </Flex>
          </Box>
        </Flex>
      </Box>
    </DarkMode>
  );
};

export default Signin;
