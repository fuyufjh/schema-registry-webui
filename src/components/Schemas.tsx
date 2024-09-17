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
} from "@chakra-ui/react";

interface Schema {
  id: number;
  subject: string;
  version: number;
  schema: string;
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
    // TODO: Replace with actual API call
    const mockSchemas: Schema[] = [
      { id: 1, subject: "user", version: 1, schema: '{"type":"record","name":"User","fields":[{"name":"id","type":"int"},{"name":"name","type":"string"}]}' },
      { id: 2, subject: "product", version: 1, schema: '{"type":"record","name":"Product","fields":[{"name":"id","type":"int"},{"name":"name","type":"string"},{"name":"price","type":"double"}]}' },
    ];
    setSchemas(mockSchemas);
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
    </Box>
  );
};

export default Schemas;
