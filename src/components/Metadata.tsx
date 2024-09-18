import React, { useState, useEffect } from "react";
import { Box, Heading, VStack } from "@chakra-ui/react";
import { getSchemaRegistryVersion } from "../api";
import { SchemaRegistryServerVersion } from "../models";

const Metadata: React.FC = () => {
  const [version, setVersion] = useState<SchemaRegistryServerVersion | null>(null);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const registryVersion = await getSchemaRegistryVersion();
        setVersion(registryVersion.data);
      } catch (error) {
        console.error("Error fetching metadata:", error);
        setVersion(null);
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
            {version ? JSON.stringify(version, null, 2) : "Error fetching version"}
          </Box>
        </Box>
      </VStack>
    </Box>
  );
};

export default Metadata;
