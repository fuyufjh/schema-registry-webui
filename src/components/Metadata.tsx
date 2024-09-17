import React, { useState, useEffect } from "react";
import { Box, Heading, Text, VStack } from "@chakra-ui/react";

const Metadata: React.FC = () => {
  const [metadata, setMetadata] = useState<string>("");

  useEffect(() => {
    // TODO: Replace this with actual API call to fetch metadata
    const fetchMetadata = async () => {
      try {
        // Simulating API call
        const response = await new Promise<string>((resolve) => {
          setTimeout(() => {
            resolve(JSON.stringify({
              version: "1.0.0",
              compatibilityLevel: "BACKWARD",
              schemaCount: 10,
              subjectCount: 5
            }, null, 2));
          }, 1000);
        });
        setMetadata(response);
      } catch (error) {
        console.error("Error fetching metadata:", error);
        setMetadata("Error fetching metadata");
      }
    };

    fetchMetadata();
  }, []);

  return (
    <Box>
      <Heading as="h1" size="xl" mb={4}>
        Metadata
      </Heading>
      <VStack align="start" spacing={4}>
        <Text>Schema Registry Metadata:</Text>
        <Box
          as="pre"
          p={4}
          borderWidth={1}
          borderRadius="md"
          width="100%"
          overflowX="auto"
        >
          {metadata}
        </Box>
      </VStack>
    </Box>
  );
};

export default Metadata;
