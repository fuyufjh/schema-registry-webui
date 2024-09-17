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
  Textarea,
} from "@chakra-ui/react";
import JsonView from '@uiw/react-json-view';

interface Subject {
  name: string;
  versions: number[];
}

interface Schema {
  subject: string;
  version: number;
  id: number;
  schema: string;
}

const Subjects: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [newSchema, setNewSchema] = useState<string>("");
  const [selectedSchema, setSelectedSchema] = useState<Schema | null>(null);
  const { isOpen: isSchemaOpen, onOpen: onSchemaOpen, onClose: onSchemaClose } = useDisclosure();
  const [isCreating, setIsCreating] = useState<boolean>(false);

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
        return { name, versions };
      }));
      
      setSubjects(subjectsWithVersions);
    } catch (error) {
      console.error("Failed to fetch subjects:", error);
      // TODO: Handle error appropriately (e.g., show error message to user)
    }
  };

  const handleEdit = async (subject: Subject) => {
    setSelectedSubject(subject);
    setIsCreating(false);
    try {
      const latestVersion = Math.max(...subject.versions);
      const response = await fetch(`/subjects/${subject.name}/versions/${latestVersion}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const schema = await response.json();
      setNewSchema(schema.schema);
      onOpen();
    } catch (error) {
      console.error("Failed to fetch latest schema:", error);
      // TODO: Handle error appropriately (e.g., show error message to user)
    }
  };

  const handleSave = async () => {
    try {
      const subjectName = isCreating ? newSchema.split('\n')[0].trim() : selectedSubject!.name;
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
      await fetchSubjects(); // Refresh the subjects list
      onClose();
    } catch (error) {
      console.error("Failed to save new schema version:", error);
      // TODO: Handle error appropriately (e.g., show error message to user)
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
      // TODO: Handle error appropriately (e.g., show error message to user)
    }
  };

  const handleCreateSubject = () => {
    setSelectedSubject(null);
    setIsCreating(true);
    setNewSchema("");
    onOpen();
  };

  return (
    <Box>
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
                {subject.versions.map((version, index) => (
                  <Button
                    key={index}
                    size="sm"
                    variant="link"
                    onClick={() => handleVersionClick(subject.name, version)}
                    mr={2}
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

      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{isCreating ? "Create New Subject" : `Edit Schema for ${selectedSubject?.name}`}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Schema</FormLabel>
              <Textarea
                value={newSchema}
                onChange={(e) => setNewSchema(e.target.value)}
                height="300px"
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleSave}>
              {isCreating ? "Create Subject" : "Save New Version"}
            </Button>
            <Button onClick={onClose}>Cancel</Button>
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
