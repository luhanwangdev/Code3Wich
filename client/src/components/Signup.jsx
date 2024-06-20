import { useRef } from "react";
import { useNavigate } from "react-router-dom";
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

const Signup = () => {
  const navigate = useNavigate();
  const userNameRef = useRef();
  const userEmailRef = useRef();
  const userPasswordRef = useRef();

  const createUser = async (name, email, password) => {
    const userResponse = await fetch("http://localhost:3000/api/user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        password,
      }),
    });
    const userId = await userResponse.json();

    navigate(`/user/${userId}`);
  };

  return (
    <Box minH="100vh" bg="#2C2C32" color="gray.500" px={6} py={8}>
      <Header />
      <Flex justifyContent="space-evenly" alignItems="center" h="80vh">
        <Flex justifyContent="center" alignItems="center" direction="column">
          <Image
            w="15rem"
            src="/src/assets/big-icon.png"
            border="2px solid gray"
            borderRadius="50%"
          ></Image>
          <Box>
            <Text my="2rem" color="lightblue" fontSize={28}>
              Code3Wich, <br />
              coding like eating sandwich
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
          <Flex justifyContent="center" alignItems="center" h="20vh">
            <Button
              colorScheme="teal"
              width="80%"
              onClick={() =>
                createUser(
                  userNameRef.current.value,
                  userEmailRef.current.value,
                  userPasswordRef.current.value
                )
              }
            >
              Sign up
            </Button>
          </Flex>
        </Box>
      </Flex>
    </Box>
  );
};

export default Signup;
