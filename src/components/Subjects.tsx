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
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Checkbox,
  Select,
} from "@chakra-ui/react";
import JsonView from '@uiw/react-json-view';
import Editor from "@monaco-editor/react";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Schema } from "../models";
import { getSubjects, getSubjectVersions, getSubjectVersion, registerSchema, deleteSubject } from "../api";
import { AxiosError } from "axios";

interface Subject {
  name: string;
  versions: number[];
  latestVersion: number;
  schemaType: string;
}

const Subjects: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [newSchema, setNewSchema] = useState<string>("");
  const [selectedSchema, setSelectedSchema] = useState<Schema | null>(null);
  const { isOpen: isSchemaOpen, onOpen: onSchemaOpen, onClose: onSchemaClose } = useDisclosure();
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [subjectName, setSubjectName] = useState<string>("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [subjectToDelete, setSubjectToDelete] = useState<string | null>(null);
  const [isPermanentDelete, setIsPermanentDelete] = useState<boolean>(false);
  const [schemaType, setSchemaType] = useState<string>("AVRO");
  const cancelRef = React.useRef<HTMLButtonElement>(null);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const handleError = (error: unknown, errorContext: string) => {
    let errorMessage: string;
    if (error instanceof AxiosError) {
      errorMessage = error.response?.data?.message || error.message;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    } else {
      errorMessage = String(error);
    }

    console.error(`${errorContext}:`, error);
    toast.error(`${errorContext}: ${errorMessage}`);
  };

  const fetchSubjects = async () => {
    try {
      const response = await getSubjects();
      const subjectNames = response.data;
      
      const subjectsWithVersions = await Promise.all(subjectNames.map(async (name: string) => {
        const versionsResponse = await getSubjectVersions(name);
        const versions = versionsResponse.data;

        const latestResponse = await getSubjectVersion(name, 'latest');
        const latestSchema = latestResponse.data;
        
        return { name, versions, latestVersion: latestSchema.version };
      })) as Subject[];
      
      setSubjects(subjectsWithVersions);
    } catch (error) {
      handleError(error, "Failed to fetch subjects");
    }
  };


  const handleEdit = async (subject: Subject) => {
    setIsCreating(false);
    setSubjectName(subject.name);
    setSchemaType(subject.schemaType);
    try {
      const response = await getSubjectVersion(subject.name, 'latest');
      const schema = response.data;
      setNewSchema(schema.schema);
      onOpen();
    } catch (error) {
      handleError(error, "Failed to fetch latest schema");
    }
  };

  const handleSave = async () => {
    try {
      const response = await registerSchema(subjectName, { schema: newSchema, schemaType });
      const result = response.data;
      await fetchSubjects(); // Refresh the subjects list
      onClose();
      toast.success(`Schema saved successfully. ID: ${result.id}`);
    } catch (error) {
      handleError(error, "Failed to save new schema version");
    }
  };

  const handleVersionClick = async (subject: string, version: number) => {
    try {
      const response = await getSubjectVersion(subject, version);
      const schema = response.data;
      setSelectedSchema(schema);
      onSchemaOpen();
    } catch (error) {
      handleError(error, "Failed to fetch schema");
    }
  };

  const handleCreateSubject = () => {
    setIsCreating(true);
    setNewSchema("");
    setSubjectName("");
    setSchemaType("AVRO");
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

  const handleDelete = async () => {
    if (subjectToDelete) {
      try {
        await deleteSubject(subjectToDelete, isPermanentDelete);
        await fetchSubjects(); // Refresh the subjects list
        setIsDeleteDialogOpen(false);
        toast.success(`Subject "${subjectToDelete}" deleted successfully`);
      } catch (error) {
        console.error("Failed to delete subject:", error);
        toast.error(`Failed to delete subject: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
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
                <Button onClick={() => handleEdit(subject)} mr={2}>Edit</Button>
                <Button onClick={() => {
                  setSubjectToDelete(subject.name);
                  setIsDeleteDialogOpen(true);
                }} colorScheme="red">Delete</Button>
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
            <FormControl mb={4}>
              <FormLabel>Schema Type</FormLabel>
              <Select
                value={schemaType}
                onChange={(e) => setSchemaType(e.target.value)}
                disabled={!isCreating}
              >
                <option value="AVRO">AVRO</option>
                <option value="PROTOBUF">PROTOBUF</option>
                <option value="JSON">JSON</option>
              </Select>
            </FormControl>
            <FormControl height="calc(100% - 140px)">
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

      <AlertDialog
        isOpen={isDeleteDialogOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => setIsDeleteDialogOpen(false)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Subject
            </AlertDialogHeader>

            <AlertDialogBody>
              <VStack align="start" spacing={4}>
                <Text>Are you sure you want to delete the subject "{subjectToDelete}"?</Text>
                <Checkbox
                  isChecked={isPermanentDelete}
                  onChange={(e) => setIsPermanentDelete(e.target.checked)}
                >
                  Permanent Delete
                </Checkbox>
              </VStack>
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleDelete} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default Subjects;
