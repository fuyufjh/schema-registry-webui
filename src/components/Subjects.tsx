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
  VStack,
  Text,
  HStack,
} from "@chakra-ui/react";
import JsonView from '@uiw/react-json-view';
import Editor from "@monaco-editor/react";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Schema } from "../models";

interface Subject {
  name: string;
  versions: number[];
  latestVersion: number;
}

const Subjects: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [newSchema, setNewSchema] = useState<string>("");
  const [selectedSchema, setSelectedSchema] = useState<Schema | null>(null);
  const { isOpen: isSchemaOpen, onOpen: onSchemaOpen, onClose: onSchemaClose } = useDisclosure();
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [subjectName, setSubjectName] = useState<string>("");

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const response = await fetch('/subjects');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const subjectNames = await response.json();
      
      const subjectsWithVersions = await Promise.all(subjectNames.map(async (name: string) => {
        const versionsResponse = await fetch(`/subjects/${name}/versions`);
        if (!versionsResponse.ok) {
          throw new Error(`HTTP error! status: ${versionsResponse.status}`);
        }
        const versions = await versionsResponse.json();

        const latestResponse = await fetch(`/subjects/${name}/versions/latest`);
        if (!latestResponse.ok) {
          throw new Error(`HTTP error! status: ${latestResponse.status}`);
        }
        const latestSchema = await latestResponse.json();
        
        return { name, versions, latestVersion: latestSchema.version };
      }));
      
      setSubjects(subjectsWithVersions);
    } catch (error) {
      console.error("Failed to fetch subjects:", error);
      toast.error(`Failed to fetch subjects: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleEdit = async (subject: Subject) => {
    setIsCreating(false);
    setSubjectName(subject.name);
    try {
      const response = await fetch(`/subjects/${subject.name}/versions/latest`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const schema = await response.json();
      setNewSchema(schema.schema);
      onOpen();
    } catch (error) {
      console.error("Failed to fetch latest schema:", error);
      toast.error(`Failed to fetch latest schema: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`/subjects/${subjectName}/versions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ schema: newSchema }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      await fetchSubjects(); // Refresh the subjects list
      onClose();
      toast.success(`Schema saved successfully. ID: ${result.id}`);
    } catch (error) {
      console.error("Failed to save new schema version:", error);
      toast.error(`Failed to save new schema version: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleVersionClick = async (subject: string, version: number) => {
    try {
      const response = await fetch(`/subjects/${subject}/versions/${version}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const schema = await response.json();
      setSelectedSchema(schema);
      onSchemaOpen();
    } catch (error) {
      console.error("Failed to fetch schema:", error);
      toast.error(`Failed to fetch schema: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleCreateSubject = () => {
    setIsCreating(true);
    setNewSchema("");
    setSubjectName("");
    onOpen();
  };

  const handlePrettify = () => {
    try {
      const parsedSchema = JSON.parse(newSchema);
      const prettifiedSchema = JSON.stringify(parsedSchema, null, 2);
      setNewSchema(prettifiedSchema);
    } catch (error) {
      console.error("Failed to prettify schema:", error);
      toast.error(`Failed to prettify schema: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <Box>
      <ToastContainer />
      <Heading as="h1" size="xl" mb={4}>
        Subjects
      </Heading>
      <Button onClick={handleCreateSubject} mb={4}>Create New Subject</Button>
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Name</Th>
            <Th>Versions</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {subjects.map((subject) => (
            <Tr key={subject.name}>
              <Td>{subject.name}</Td>
              <Td>
                {subject.versions.map((version) => (
                  <Button
                    key={version}
                    size="sm"
                    variant="link"
                    onClick={() => handleVersionClick(subject.name, version)}
                    mr={2}
                    fontWeight={version === subject.latestVersion ? "bold" : "normal"}
                  >
                    {version}
                  </Button>
                ))}
              </Td>
              <Td>
                <Button onClick={() => handleEdit(subject)}>Edit</Button>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      <Modal isOpen={isOpen} onClose={onClose} size="xl" closeOnEsc={true}>
        <ModalOverlay />
        <ModalContent maxWidth="70vw" maxHeight="90vh">
          <ModalHeader>{isCreating ? "Create New Subject" : `Edit Schema for ${subjectName}`}</ModalHeader>
          <ModalCloseButton />
          <ModalBody height="70vh">
            <FormControl mb={4}>
              <FormLabel>Subject Name</FormLabel>
              <Input
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                disabled={!isCreating}
                placeholder="Enter subject name"
              />
            </FormControl>
            <FormControl height="calc(100% - 80px)">
              <FormLabel>Schema</FormLabel>
              <Box border="1px" borderColor="gray.200" borderRadius="md">
                <Editor
                  height="40vh"
                  defaultLanguage="json"
                  value={newSchema}
                  onChange={(value) => setNewSchema(value || "")}
                  options={{
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    fontSize: 14,
                    wordWrap: "on",
                    lineNumbers: "off",
                    folding: false,
                  }}
                />
              </Box>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <HStack spacing={4} width="100%">
              <Button onClick={handlePrettify}>Prettify</Button>
              <Box flex={1} />
              <Button colorScheme="blue" onClick={handleSave}>
                {isCreating ? "Create" : "Update"}
              </Button>
              <Button onClick={onClose}>Cancel</Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isSchemaOpen} onClose={onSchemaClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Schema Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedSchema && (
              <VStack align="start" spacing={4}>
                <Text><strong>Subject:</strong> {selectedSchema.subject}</Text>
                <Text><strong>Version:</strong> {selectedSchema.version}</Text>
                <Text><strong>ID:</strong> {selectedSchema.id}</Text>
                <Box width="100%" overflowX="auto">
                  <JsonView
                    value={JSON.parse(selectedSchema.schema)}
                    displayDataTypes={false}
                    displayObjectSize={false}
                    enableClipboard={false}
                    style={{ fontSize: '0.8rem' }}
                  />
                </Box>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button onClick={onSchemaClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Subjects;
