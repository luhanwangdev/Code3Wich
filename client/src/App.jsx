import { useNavigate } from "react-router-dom";
import { Box } from "@chakra-ui/react";
import Header from "./components/Header";
import { useEffect } from "react";
import { url } from "./constants";

const App = () => {
  const navigate = useNavigate();

  const checkToken = async () => {
    const infoReponse = await fetch(`${url}/api/user/info`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (infoReponse.status === 200) {
      navigate("/projects");
    } else {
      navigate("/user/signin");
    }
  };

  useEffect(() => {
    checkToken();
  }, []);

  return (
    <Box minH="100vh" bg="#2C2C32" color="gray.500">
      <Header />
    </Box>
  );
};

export default App;
