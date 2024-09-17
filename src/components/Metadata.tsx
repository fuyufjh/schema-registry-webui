import React, { useState, useEffect } from "react";
import { Box, Heading, Text, VStack } from "@chakra-ui/react";

const Metadata: React.FC = () => {
  const [metadata, setMetadata] = useState<string>("");
  const [version, setVersion] = useState<string>("");

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const idResponse = await fetch('/v1/metadata/id');
        const versionResponse = await fetch('/v1/metadata/version');
        
        if (!idResponse.ok || !versionResponse.ok) {
          throw new Error(`HTTP error! status: ${idResponse.status} or ${versionResponse.status}`);
        }
        
        const idData = await idResponse.json();
        const versionData = await versionResponse.json();
        
        setMetadata(JSON.stringify(idData, null, 2));
        setVersion(JSON.stringify(versionData, null, 2));
      } catch (error) {
        console.error("Error fetching metadata:", error);
        setMetadata("Error fetching metadata");
        setVersion("Error fetching version");
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
        <Box>
          <Heading as="h2" size="lg" mb={2}>
            ID
          </Heading>
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
        </Box>
        <Box>
          <Heading as="h2" size="lg" mb={2}>
            Version
          </Heading>
          <Box
            as="pre"
            p={4}
            borderWidth={1}
            borderRadius="md"
            width="100%"
            overflowX="auto"
          >
            {version}
          </Box>
        </Box>
      </VStack>
    </Box>
  );
};

export default Metadata;
