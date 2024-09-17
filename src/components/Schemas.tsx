import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  useDisclosure,
  Heading,
  useColorModeValue,
} from '@chakra-ui/react';

import { Schema } from '../models';
import JsonView from '@uiw/react-json-view';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
      toast.error(`Failed to fetch schemas: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
    try {
      let response;
      if (selectedSchema) {
        response = await fetch(`/subjects/${newSchema.subject}/versions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ schema: newSchema.schema }),
        });
      } else {
        response = await fetch('/schemas', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newSchema),
        });
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      onClose();
      await fetchSchemas();
      toast.success(`Schema ${selectedSchema ? 'updated' : 'created'} successfully. ID: ${result.id}`);
    } catch (error) {
      console.error('Error saving schema:', error);
      toast.error(`Failed to save schema: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const [detailsSchema, setDetailsSchema] = useState<Schema | null>(null);
  const { isOpen: isDetailsOpen, onOpen: onDetailsOpen, onClose: onDetailsClose } = useDisclosure();

  // Add this line to call the hook at the top level
  const codeBgColor = useColorModeValue("gray.100", "gray.700");
  const jsonViewBgColor = useColorModeValue("white", "gray.800");

  const handleDetails = (schema: Schema) => {
    setDetailsSchema(schema);
    onDetailsOpen();
  };

  return (
    <Box>
      <ToastContainer />
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

      <Modal isOpen={isDetailsOpen} onClose={onDetailsClose}>
        <ModalOverlay />
        <ModalContent maxWidth="60vw">
          <ModalHeader>Schema Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody overflowX="auto">
            {detailsSchema && (
              <Box
                borderRadius="md"
                overflow="hidden"
              >
                <JsonView
                  value={detailsSchema}
                  style={{ backgroundColor: jsonViewBgColor }}
                  displayDataTypes={false}
                  shortenTextAfterLength={80}
                />
              </Box>
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
