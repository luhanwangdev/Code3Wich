import { Link } from "react-router-dom";
import { Box, Flex, Image } from "@chakra-ui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFolderOpen } from "@fortawesome/free-regular-svg-icons";
import { faUser } from "@fortawesome/free-solid-svg-icons";

const Header = () => {
  return (
    <Box maxW="100vw" h="13vh" background="cyan.100" px="2rem">
      <Flex
        align="center"
        justifyContent="space-between"
        w="100%"
        h="100%"
        ml="0.5rem"
      >
        <Link to="/">
          <Image
            w="15rem"
            src="/src/assets/logo.png"
            border="2px solid gray"
            borderRadius="lg"
          ></Image>
        </Link>
        <Flex w="8vw" justifyContent="space-between" mr="2rem">
          <Link to="/projects">
            <FontAwesomeIcon
              icon={faFolderOpen}
              style={{ fontSize: "2rem", color: "#086F83" }}
            />
          </Link>
          <Link to="/profile">
            <FontAwesomeIcon
              icon={faUser}
              style={{ fontSize: "2rem", color: "#086F83" }}
            />
          </Link>
        </Flex>
      </Flex>
    </Box>
  );
};

export default Header;
