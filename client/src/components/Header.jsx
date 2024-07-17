import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Box, DarkMode, Flex, Image, useToast } from "@chakra-ui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFolderOpen } from "@fortawesome/free-regular-svg-icons";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import logo from "/src/assets/logo.png";
import { url } from "../constants";

const Header = () => {
  const [login, setLogin] = useState(false);
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
      setLogin(true);
    }
  };

  useEffect(() => {
    checkLogIn();
  }, []);
  return (
    <DarkMode>
      <Box maxW="100vw" h="8vh" background="#9ed1d7" px="2rem">
        <Flex
          align="center"
          justifyContent="space-between"
          w="100%"
          h="100%"
          ml="0.5rem"
        >
          <Link to="/">
            <Image w="10rem" src={logo}></Image>
          </Link>

          {login && (
            <Flex w="6vw" justifyContent="space-between" mr="1rem">
              <Link to="/projects">
                <FontAwesomeIcon icon={faFolderOpen} className="faStyle" />
              </Link>
              <Link to="/profile">
                <FontAwesomeIcon icon={faUser} className="faStyle" />
              </Link>
            </Flex>
          )}
          {!login && (
            <Flex w="6vw" justifyContent="space-between" mr="1rem">
              <Link to="/user/signin">
                <FontAwesomeIcon
                  icon={faFolderOpen}
                  className="faStyle"
                  onClick={() =>
                    toast({
                      title: "Not Signed in.",
                      position: "top",
                      description: "Please sign in first.",
                      status: "warning",
                      duration: 1500,
                      isClosable: true,
                      variant: "subtle",
                    })
                  }
                />
              </Link>
              <Link to="/user/signin">
                <FontAwesomeIcon
                  icon={faUser}
                  className="faStyle"
                  onClick={() =>
                    toast({
                      title: "Not Signed in.",
                      position: "top",
                      description: "Please sign in first.",
                      status: "warning",
                      duration: 1500,
                      isClosable: true,
                      variant: "subtle",
                    })
                  }
                />
              </Link>
            </Flex>
          )}
        </Flex>
      </Box>
    </DarkMode>
  );
};

export default Header;
