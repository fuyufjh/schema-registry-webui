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
} from "@chakra-ui/react";

interface Subject {
  name: string;
  versions: number[];
}

const Subjects: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [newSubject, setNewSubject] = useState<Partial<Subject>>({});

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    // TODO: Replace with actual API call
    const mockSubjects: Subject[] = [
      { name: "user", versions: [1, 2, 3] },
      { name: "product", versions: [1, 2] },
    ];
    setSubjects(mockSubjects);
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
              <Td>{subject.versions.join(", ")}</Td>
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
    </Box>
  );
};

export default Subjects;
