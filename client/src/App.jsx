import { Link } from "react-router-dom";
import { Box, Text } from "@chakra-ui/react";
import Header from "./components/Header";

function App() {
  return (
    <Box minH="100vh" bg="#2C2C32" color="gray.500">
      <Header />
      <Box px={6}>
        <Text my="2rem" color="white" fontSize={32}>
          App.jsx
        </Text>
      </Box>
    </Box>
  );
}

export default App;
