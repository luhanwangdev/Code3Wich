import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Flex, Text, keyframes, Button, Image } from "@chakra-ui/react";
import Header from "./components/Header";
import crossPlatform from "/src/assets/cross-platform.png";
import fileSharing from "/src/assets/file-sharing.png";
import vanillaJS from "/src/assets/vanilla.png";
import server from "/src/assets/server.png";
import terminal from "/src/assets/terminal.png";
import realTime from "/src/assets/real-time.png";
import { url } from "./constants";

const App = () => {
  const navigate = useNavigate();
  const [login, setLogin] = useState(false);

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

  const typing = keyframes`
    from { width: 0; }
    to { width: 100%; }
  `;

  const blink = keyframes`
    50% { border-color: gray; }
    to { border-color: transparent; }
  `;

  const contentFadeIn = keyframes`
    from { opacity: 0; }
    to { opacity: 1; }
  `;

  const textGradient = keyframes`
    from { background-position: 100%; }
    to { background-position: 0; }
  `;

  useEffect(() => {
    checkLogIn();
  }, []);

  return (
    <Box bg="#2C2C32" color="gray.500">
      <Header />
      <Flex alignItems="center" justifyContent="center" minH="80vh">
        <Box my="auto">
          <Flex justifyContent="center" mt="5rem" mb="2rem">
            <Box>
              <Box
                as="div"
                whiteSpace="nowrap"
                overflow="hidden"
                display="inline-block"
                width="fit-content"
                borderRight="2px solid"
                borderColor="gray"
                animation={`${typing} 1s steps(23) 0.5s 1 normal both, ${blink} 1s step-end forwards 0.6s`}
              >
                <Text
                  mt="2rem"
                  fontSize={70}
                  fontWeight="bold"
                  bgColor="lightblue"
                  bgClip="text"
                  display="inline"
                >
                  Create, Edit, and Share
                </Text>
              </Box>
            </Box>
          </Flex>
          <Flex justifyContent="center" mb="5rem">
            <Box>
              <Box
                as="div"
                whiteSpace="nowrap"
                overflow="hidden"
                display="inline-block"
                borderRight="2px solid"
                borderColor="transparent"
                animation={`${typing} 1.2s steps(26) 1.8s 1 normal both, ${blink} 1s step-end infinite 1.3s`}
              >
                <Text
                  fontSize={70}
                  fontWeight="bold"
                  bgColor="lightblue"
                  bgClip="text"
                  display="inline"
                >
                  Your Code Instantly{" "}
                  <Text
                    as="span"
                    bgGradient="linear(to-r, #ee6b6e, #e9d062, #ee6b6e, #e9d062, #ee6b6e)"
                    bgClip="text"
                    bgSize="200% 100%"
                    animation={`${textGradient} 2s linear infinite`}
                  >
                    Online.
                  </Text>
                </Text>
              </Box>
            </Box>
          </Flex>
          <Flex
            justifyContent="center"
            animation={`${contentFadeIn} 2.5s ease 3s forwards`}
            style={{ opacity: 0 }}
          >
            <Button
              width="300px"
              height="70"
              color="#2C2C32"
              bg="#9ed1d7"
              _hover={{
                bgGradient: "linear(to-r, #ee6b6e, #e9d062, #ee6b6e, #e9d062)",
                bgSize: "300% 100%",
                animation: `${textGradient} 10s ease-in infinite`,
              }}
              onClick={() => {
                if (login) {
                  navigate("/profile");
                } else {
                  navigate("/user/signup");
                }
              }}
            >
              <Text
                fontSize={30}
                fontWeight="bold"
                bgColor="#2c2c32"
                bgClip="text"
                display="inline"
              >
                Start a free trial
              </Text>
            </Button>
          </Flex>
        </Box>
      </Flex>
      <Flex
        mx="7rem"
        mt="7rem"
        justifyContent="space-around"
        animation={`${contentFadeIn} 2.5s ease 3s forwards`}
        style={{ opacity: 0 }}
      >
        <Box>
          <Flex my="3rem">
            <Box flex="4">
              <Text
                my="3rem"
                fontSize={40}
                fontWeight="bold"
                bgColor="lightblue"
                bgClip="text"
              >
                Static Web Hosting
              </Text>
              <Text
                fontSize={20}
                fontWeight="bold"
                bgColor="lightblue"
                bgClip="text"
              >
                For projects using vanilla JavaScript, you can host and view
                your static web pages directly.
              </Text>
            </Box>
            <Box flex="3">
              <Image mx="auto" w="15rem" src={vanillaJS}></Image>
            </Box>
          </Flex>
          <Flex my="3rem">
            <Box flex="3">
              <Image mx="auto" w="15rem" src={server}></Image>
            </Box>
            <Box flex="4">
              <Text
                my="3rem"
                fontSize={40}
                fontWeight="bold"
                bgColor="lightblue"
                bgClip="text"
              >
                Dynamic Server Support
              </Text>
              <Text
                fontSize={20}
                fontWeight="bold"
                bgColor="lightblue"
                bgClip="text"
              >
                For Node.js projects, you can host servers and interact with
                corresponding APIs to get return results.
              </Text>
            </Box>
          </Flex>
          <Flex my="3rem">
            <Box flex="4">
              <Text
                my="3rem"
                fontSize={40}
                fontWeight="bold"
                bgColor="lightblue"
                bgClip="text"
              >
                Integrated Terminal Interface
              </Text>
              <Text
                fontSize={20}
                fontWeight="bold"
                bgColor="lightblue"
                bgClip="text"
              >
                Perform any operation through the terminal interface.
                <br /> Download modules. <br />
                Create files and more through the terminal.
              </Text>
            </Box>
            <Box flex="3">
              <Image mx="auto" w="15rem" src={terminal}></Image>
            </Box>
          </Flex>
          <Flex my="3rem">
            <Box flex="3">
              <Image mx="auto" w="15rem" src={realTime}></Image>
            </Box>
            <Box flex="4">
              <Text
                my="3rem"
                fontSize={40}
                fontWeight="bold"
                bgColor="lightblue"
                bgClip="text"
              >
                Real-Time Results Display
              </Text>
              <Text
                fontSize={20}
                fontWeight="bold"
                bgColor="lightblue"
                bgClip="text"
              >
                Instantly see your web project results on the screen as you
                code.
              </Text>
            </Box>
          </Flex>
          <Flex my="3rem">
            <Box flex="4">
              <Text
                my="3rem"
                fontSize={40}
                fontWeight="bold"
                bgColor="lightblue"
                bgClip="text"
              >
                Cross-Platform Compatibility
              </Text>
              <Text
                fontSize={20}
                fontWeight="bold"
                bgColor="lightblue"
                bgClip="text"
              >
                Whether you're using a smartphone, iPad, or computer, you can
                compile code directly from our website.
              </Text>
            </Box>
            <Box flex="3">
              <Image mx="auto" w="15rem" src={crossPlatform}></Image>
            </Box>
          </Flex>
          <Flex my="3rem">
            <Box flex="3">
              <Image mx="auto" w="15rem" src={fileSharing}></Image>
            </Box>
            <Box flex="4">
              <Text
                my="3rem"
                fontSize={40}
                fontWeight="bold"
                bgColor="lightblue"
                bgClip="text"
              >
                Persistent and Shareable Projects
              </Text>
              <Text
                fontSize={20}
                fontWeight="bold"
                bgColor="lightblue"
                bgClip="text"
              >
                Your compiled projects are preserved and can be accessed via a
                unique URL, allowing you to share your creations with friends
                and family.
              </Text>
            </Box>
          </Flex>
          <Flex mt="8rem" justifyContent="center">
            <Box>
              <Text
                my="3rem"
                fontSize={18}
                fontWeight="bold"
                bgGradient="linear(to-r, #ee6b6e, #e9d062, #ee6b6e, #e9d062, #ee6b6e)"
                bgClip="text"
                bgSize="200% 100%"
                animation={`${textGradient} 2s linear infinite`}
              >
                &copy; Code3Wich Inc.
              </Text>
            </Box>
          </Flex>
        </Box>
      </Flex>
    </Box>
  );
};

export default App;
