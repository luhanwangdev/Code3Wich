import { useNavigate } from "react-router-dom";
import { Box, Button, Flex, Image, Text } from "@chakra-ui/react";
import Cookies from "js-cookie";
import Header from "./components/Header";
import { useEffect } from "react";

const App = () => {
  const navigate = useNavigate();

  const checkToken = () => {
    const tokenCookie = Cookies.get("token");

    if (!tokenCookie) {
      navigate("/user/signin");
    } else {
      navigate("/projects");
    }
  };

  useEffect(() => {
    checkToken();
  }, []);

  return (
    <Box minH="100vh" bg="#2C2C32" color="gray.500">
      <Header />
      {/* <Flex justifyContent="space-evenly" alignItems="center" h="87vh">
        <Flex justifyContent="center" alignItems="center" direction="column">
          <Image
            w="15rem"
            src="./assets/big-icon.png"
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
      </Flex> */}
    </Box>
  );
};

export default App;
