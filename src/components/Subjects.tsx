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
  const [newSubject, setNewSubject] = useState<Partial<Subject>>({});
  const [selectedSchema, setSelectedSchema] = useState<Schema | null>(null);
  const { isOpen: isSchemaOpen, onOpen: onSchemaOpen, onClose: onSchemaClose } = useDisclosure();

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

  const handleEdit = (subject: Subject) => {
    setSelectedSubject(subject);
    setNewSubject(subject);
    onOpen();
  };

  const handleCreate = () => {
    setSelectedSubject(null);
    setNewSubject({});
    onOpen();
  };

  const handleSave = async () => {
    // TODO: Implement actual API call to save/update subject
    if (selectedSubject) {
      // Update existing subject
      setSubjects(subjects.map(s => s.name === selectedSubject.name ? { ...s, ...newSubject } : s));
    } else {
      // Create new subject
      setSubjects([...subjects, newSubject as Subject]);
    }
    onClose();
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

  return (
    <Box>
      <Heading as="h1" size="xl" mb={4}>
        Subjects
      </Heading>
      <Button onClick={handleCreate} mb={4}>
        Create New Subject
      </Button>
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

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{selectedSubject ? "Edit Subject" : "Create New Subject"}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Name</FormLabel>
                <Input
                  value={newSubject.name || ""}
                  onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
                />
              </FormControl>
              {selectedSubject && (
                <FormControl>
                  <FormLabel>Versions</FormLabel>
                  <Input
                    value={newSubject.versions?.join(", ") || ""}
                    onChange={(e) => setNewSubject({ ...newSubject, versions: e.target.value.split(",").map(v => parseInt(v.trim())) })}
                  />
                </FormControl>
              )}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleSave}>
              Save
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
