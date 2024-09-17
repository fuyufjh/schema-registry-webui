import React from "react";
import {
  ChakraProvider,
  Box,
  Flex,
  VStack,
  Text,
  Link,
} from "@chakra-ui/react";
import theme from "./theme";
import { BrowserRouter as Router, Route, Routes, Link as RouterLink } from "react-router-dom";
import Schemas from "./components/Schemas";
import Subjects from "./components/Subjects";
import Metadata from "./components/Metadata";

const Sidebar = () => (
  <VStack align="stretch" width="200px" p={4} bg="gray.100" height="100vh">
    <Link as={RouterLink} to="/schemas">Schemas</Link>
    <Link as={RouterLink} to="/subjects">Subjects</Link>
    <Link as={RouterLink} to="/metadata">Metadata</Link>
  </VStack>
);

const App: React.FC = () => (
  <ChakraProvider theme={theme}>
    <Router>
      <Flex>
        <Sidebar />
        <Box flex={1}>
          <Box p={4}>
          <Routes>
              <Route path="/schemas" element={<Schemas />} />
              <Route path="/subjects" element={<Subjects />} />
              <Route path="/metadata" element={<Metadata />} />
              <Route path="/" element={<Text fontSize="2xl">Welcome to Confluent Schema Registry WebUI</Text>} />
            </Routes>
          </Box>
        </Box>
      </Flex>
    </Router>
  </ChakraProvider>
);

export default App;
