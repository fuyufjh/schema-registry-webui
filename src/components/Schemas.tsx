import React, { useState, useEffect } from "react";
import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Text,
  Code,
  UnorderedList,
  ListItem,
  useColorModeValue
} from "@chakra-ui/react";

interface Schema {
  id: number;
  subject: string;
  version: number;
  schema: string;
  schemaType?: string;
  references?: SchemaReference[];
  metadata?: Metadata;
  ruleset?: RuleSet;
}

interface SchemaReference {
  name: string;
  subject: string;
  version: number;
}

interface Metadata {
  tags: Record<string, string[]>;
}

interface RuleSet {
  // RuleSet properties are not specified in the provided OpenAPI spec
  // You may need to define this based on your specific requirements
}

const Schemas: React.FC = () => {
  const [schemas, setSchemas] = useState<Schema[]>([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedSchema, setSelectedSchema] = useState<Schema | null>(null);
  const [newSchema, setNewSchema] = useState<Partial<Schema>>({});

  useEffect(() => {
    fetchSchemas();
  }, []);

  const fetchSchemas = async () => {
    try {
      const response = await fetch('/schemas');
      if (!response.ok) {
        throw new Error('Failed to fetch schemas');
      }
      const data: Schema[] = await response.json();
      setSchemas(data);
    } catch (error) {
      console.error('Error fetching schemas:', error);
      // TODO: Handle error state, perhaps set an error message in state
    }
  };

  const handleCreate = () => {
    setSelectedSchema(null);
    setNewSchema({});
    onOpen();
  };

  const handleEdit = (schema: Schema) => {
    setSelectedSchema(schema);
    setNewSchema(schema);
    onOpen();
  };

  const handleSave = async () => {
    if (selectedSchema) {
      // TODO: Update existing schema
      console.log("Updating schema:", newSchema);
    } else {
      // TODO: Create new schema
      console.log("Creating new schema:", newSchema);
    }
    onClose();
    await fetchSchemas();
  };

  const [detailsSchema, setDetailsSchema] = useState<Schema | null>(null);
  const { isOpen: isDetailsOpen, onOpen: onDetailsOpen, onClose: onDetailsClose } = useDisclosure();

  // Add this line to call the hook at the top level
  const codeBgColor = useColorModeValue("gray.100", "gray.700");

  const handleDetails = (schema: Schema) => {
    setDetailsSchema(schema);
    onDetailsOpen();
  };

  return (
    <Box>
      <Heading as="h1" size="xl" mb={4}>
        Schemas
      </Heading>
      <Button onClick={handleCreate} mb={4}>
        Create New Schema
      </Button>
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>ID</Th>
            <Th>Subject</Th>
            <Th>Version</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {schemas.map((schema) => (
            <Tr key={schema.id}>
              <Td>{schema.id}</Td>
              <Td>{schema.subject}</Td>
              <Td>{schema.version}</Td>
              <Td>
              <Button onClick={() => handleDetails(schema)} mr={2}>Details</Button>
              <Button onClick={() => handleEdit(schema)}>Edit</Button>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{selectedSchema ? "Edit Schema" : "Create New Schema"}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Subject</FormLabel>
              <Input
                value={newSchema.subject || ""}
                onChange={(e) => setNewSchema({ ...newSchema, subject: e.target.value })}
              />
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>Schema</FormLabel>
              <Textarea
                value={newSchema.schema || ""}
                onChange={(e) => setNewSchema({ ...newSchema, schema: e.target.value })}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleSave}>
              Save
            </Button>
            <Button onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isDetailsOpen} onClose={onDetailsClose} size="xl">
        <ModalOverlay />
        <ModalContent maxWidth="90vw">
          <ModalHeader>Schema Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody overflowX="auto">
            {detailsSchema && (
              <>
                <Text><strong>ID:</strong> {detailsSchema.id}</Text>
                <Text><strong>Subject:</strong> {detailsSchema.subject}</Text>
                <Text><strong>Version:</strong> {detailsSchema.version}</Text>
                <Text><strong>Schema Type:</strong> {detailsSchema.schemaType ? detailsSchema.schemaType : "None"}</Text>
                <Text><strong>Schema:</strong></Text>
                <Code
                  display="block"
                  whiteSpace="pre-wrap"
                  overflowX="auto"
                  maxWidth="100%"
                  p={2}
                  borderRadius="md"
                  bg={codeBgColor}
                >
                  {JSON.stringify(JSON.parse(detailsSchema.schema), null, 2)}
                </Code>
                <Text><strong>References:</strong></Text>
                {detailsSchema.references && detailsSchema.references.length > 0 ? (
                  <UnorderedList>
                    {detailsSchema.references.map((ref, index) => (
                      <ListItem key={index}>
                        {ref.name} (Subject: {ref.subject}, Version: {ref.version})
                      </ListItem>
                    ))}
                  </UnorderedList>
                ) : (
                  <Text>None</Text>
                )}
                <Text><strong>Metadata:</strong></Text>
                {detailsSchema.metadata ? (
                  <>
                    <Text><strong>Metadata:</strong></Text>
                    <UnorderedList>
                      {Object.entries(detailsSchema.metadata.tags).map(([key, values]) => (
                        <ListItem key={key}>
                          {key}: {values.join(', ')}
                        </ListItem>
                      ))}
                    </UnorderedList>
                  </>
                ): (
                  <Text>None</Text>
                )}
                <Text><strong>Ruleset:</strong></Text>
                {detailsSchema.ruleset ? (
                  <Code>{JSON.stringify(detailsSchema.ruleset, null, 2)}</Code>
                ) : (
                  <Text>None</Text>
                )}
              </>
            )}
          </ModalBody>
          <ModalFooter>
            <Button onClick={onDetailsClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Schemas;
