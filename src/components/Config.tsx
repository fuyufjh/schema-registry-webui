import React, { useState, useEffect } from 'react';
import {
  Box,
  Text,
  Input,
  Button,
  Select,
  useToast,
  InputGroup,
  InputRightElement,
  Grid,
  Switch,
  Flex,
} from '@chakra-ui/react';
import { getGlobalConfig, updateGlobalConfig, getSubjects, getSubjectConfig, updateSubjectConfig, getGlobalMode, updateGlobalMode, getSubjectMode, updateSubjectMode, deleteGlobalConfig, deleteSubjectConfig, deleteSubjectMode } from '../api';
import { Config, CompatibilityLevel, Mode } from '../models';
import { assert } from 'console';

const ConfigPage: React.FC = () => {
  const [scope, setScope] = useState<'global' | string>('global');
  const [subjects, setSubjects] = useState<string[]>([]);

  // Options. Emptry string or `null` means keep default
  const [alias, setAlias] = useState<string>('');
  const [normalize, setNormalize] = useState<boolean | null>(null);
  const [compatibilityLevel, setCompatibilityLevel] = useState<CompatibilityLevel | null>(null);
  const [mode, setMode] = useState<Mode | null>(null);

  const toast = useToast();

  useEffect(() => {
    fetchSubjects();
    fetchConfig(scope);
    fetchMode(scope);
  }, [scope]);

  const fetchSubjects = async () => {
    try {
      const response = await getSubjects();
      setSubjects(response.data);
    } catch (error) {
      toast({
        title: 'Error fetching subjects',
        description: 'Unable to load subjects',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const fetchConfig = async (scope: 'global' | string) => {
    try {
      let config;
      if (scope === 'global') {
        config = await getGlobalConfig();
      } else {
        try {
          config = await getSubjectConfig(scope);
        } catch (error: any) {
          if (error.response && error.response.data && error.response.data.error_code === 40408) {
            // "Subject '...' does not have subject-level config configured"
            // Treat as empty response
            config = { data: {} };
          } else {
            throw error; // Re-throw if it's not the 40408 error
          }
        }
      }
      setCompatibilityLevel(config.data.compatibilityLevel || null);
      setAlias(config.data.alias || '');
      setNormalize(config.data.normalize || null);
    } catch (error) {
      toast({
        title: 'Error fetching config',
        description: 'Unable to load configuration',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const fetchMode = async (scope: 'global' | string) => {
    try {
      let modeResponse;
      if (scope === 'global') {
        modeResponse = await getGlobalMode();
      } else {
        try {
          modeResponse = await getSubjectMode(scope);
        } catch (error: any) {
          if (error.response && error.response.data && error.response.data.error_code === 40409) {
            // "Subject '...' does not have subject-level mode configured"
            // Treat as empty response
            modeResponse = { data: {} };
          } else {
            throw error; // Re-throw if it's not the 40409 error
          }
        }
      }
      setMode(modeResponse.data.mode || null);
    } catch (error) {
      toast({
        title: 'Error fetching mode',
        description: 'Unable to load mode configuration',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleSaveAlias = async () => {
    try {
      // If alias is empty string, the request will remove the alias
      if (scope === 'global') {
        await updateGlobalConfig({ alias });
      } else {
        await updateSubjectConfig(scope, { alias });
      }
      toast({
        title: 'Alias saved',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error saving alias',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }

    // Due to a bug (?) in the schema registry, the compatibility level is also set
    fetchConfig(scope);
  };

  const handleNormalizeChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    if (event.target.value === '') {
      return;
    }
    const normalize = event.target.value === 'true';
    setNormalize(normalize);
    try {
      if (scope === 'global') {
        await updateGlobalConfig({ normalize });
      } else {
        await updateSubjectConfig(scope, { normalize });
      }
      toast({
        title: 'Normalize setting updated',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error updating normalize setting',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }

    // Due to a bug (?) in the schema registry, the compatibility level is also set
    fetchConfig(scope);
  };

  const handleCompatibilityLevelChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    if (event.target.value === '') {
      return;
    }
    const newCompatibilityLevel = event.target.value as CompatibilityLevel;
    setCompatibilityLevel(newCompatibilityLevel);
    try {
      if (scope === 'global') {
        await updateGlobalConfig({ compatibility: newCompatibilityLevel });
      } else {
        await updateSubjectConfig(scope, { compatibility: newCompatibilityLevel });
      }
      toast({
        title: 'Compatibility level updated',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error updating compatibility level',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleModeChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    if (event.target.value === '') {
      return;
    }
    const newMode = event.target.value as Mode;
    setMode(newMode);
    try {
      if (scope === 'global') {
        await updateGlobalMode({ mode: newMode });
      } else {
        await updateSubjectMode(scope, { mode: newMode });
      }
      toast({
        title: 'Mode updated',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error updating mode',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleReset = async () => {
    try {
      if (scope === 'global') {
        await deleteGlobalConfig();
        await updateGlobalMode({ mode: 'READWRITE' });
      } else {
        try {
          await deleteSubjectConfig(scope);
        } catch (error: any) {
          if (error.response && (error.response.status === 404 || error.response.data?.error_code === 40408)) {
            // Ignore 404 errors
          } else {
            throw error;
          }
        }
        try {
          await deleteSubjectMode(scope);
        } catch (error: any) {
          if (error.response && (error.response.status === 404 || error.response.data?.error_code === 40409)) {
            // Ignore 404 errors
          } else {
            throw error;
          }
        }
      }
      
      toast({
        title: 'Configuration reset',
        description: 'The configuration has been reset to default values.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      // Refresh the config and mode after reset
      fetchConfig(scope);
      fetchMode(scope);
    } catch (error) {
      toast({
        title: 'Error resetting configuration',
        description: 'Unable to reset the configuration.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Box p={5}>
      <Box bg="gray.100" p={4} borderRadius="md" mb={6}>
        <Flex alignItems="center">
          <Text fontWeight="bold" mr={4} flexShrink={0}>Config for</Text>
          <Select
            value={scope}
            onChange={(e) => setScope(e.target.value)}
            bg="white"
          >
            <option value="global">Global</option>
            {subjects.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </Select>
        </Flex>
      </Box>

      <Grid templateColumns="auto 1fr" gap={6} alignItems="center">
        <Text>Alias</Text>
        <InputGroup>
          <Input
            value={alias}
            onChange={(e) => setAlias(e.target.value)}
            placeholder="Leave blank to unset"
          />
          <InputRightElement width="4.5rem">
            <Button h="1.75rem" size="sm" onClick={handleSaveAlias}>
              Save
            </Button>
          </InputRightElement>
        </InputGroup>

        <Text>Normalize schemas</Text>
        <Select value={String(normalize) || ''} onChange={handleNormalizeChange}>
          {normalize === null && (
            <option value="">Keep default</option>
          )}
          <option value="true">True</option>
          <option value="false">False</option>
        </Select>

        <Text>Compatibility Level</Text>
        <Select value={compatibilityLevel || ''} onChange={handleCompatibilityLevelChange}>
          {compatibilityLevel === null && (
            <option value="">Keep default</option>
          )}
          <option value="BACKWARD">BACKWARD</option>
          <option value="BACKWARD_TRANSITIVE">BACKWARD_TRANSITIVE</option>
          <option value="FORWARD">FORWARD</option>
          <option value="FORWARD_TRANSITIVE">FORWARD_TRANSITIVE</option>
          <option value="FULL">FULL</option>
          <option value="FULL_TRANSITIVE">FULL_TRANSITIVE</option>
          <option value="NONE">NONE</option>
        </Select>

        <Text>Mode</Text>
        <Select value={mode || ''} onChange={handleModeChange}>
          {mode === null && (
            <option value="">Keep default</option>
          )}
          <option value="READONLY">READONLY</option>
          <option value="WRITEONLY">WRITEONLY</option>
          <option value="READWRITE">READWRITE</option>
        </Select>
      </Grid>
      <Button onClick={handleReset} colorScheme="red" mt={6}>
        Reset to Default
      </Button>
    </Box>
  );
};

export default ConfigPage;

