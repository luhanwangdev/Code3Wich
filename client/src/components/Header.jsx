import { Link } from "react-router-dom";
import { Box, Flex, IconButton, Text } from "@chakra-ui/react";

const Header = () => {
  return (
    <Box bg="pink" w="100vw" h="10vh">
      <Flex justify="space-between" align="center" w="90%" h="100%" ml="4rem">
        <Link to="/">
          <Text fontSize="25" fontWeight="bold" color="red">
            mySandBox
          </Text>
        </Link>

        <Flex>
          <Link to="/signin">
            <IconButton
              aria-label="Sign In"
              icon={<InfoIcon w={30} h={30} color="black" />}
              variant="ghost"
              colorScheme="red"
              mr={2}
            />
          </Link>
          <Link to="/saved-list/:userId">
            <IconButton
              aria-label="Saved List"
              icon={<StarIcon w={30} h={30} color="black" />}
              variant="outline"
              colorScheme="black"
              mr={2}
            />
          </Link>
        </Flex>
      </Flex>
    </Box>
  );
};

export default Header;
