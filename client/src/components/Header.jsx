import { Link } from "react-router-dom";
import { Box, Flex, Image } from "@chakra-ui/react";

const Header = () => {
  return (
    <Box w="90vw" h="10vh">
      <Flex align="center" w="90%" h="100%" ml="0.5rem">
        <Link to="/">
          <Image
            w="15rem"
            src="/src/assets/logo.png"
            border="2px solid gray"
            borderRadius="md"
          ></Image>
        </Link>
      </Flex>
    </Box>
  );
};

export default Header;
