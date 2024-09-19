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
import { getGlobalConfig, updateGlobalConfig, getSubjects, getSubjectConfig, updateSubjectConfig, getGlobalMode, updateGlobalMode, getSubjectMode, updateSubjectMode } from '../api';
import { Config, CompatibilityLevel, Mode } from '../models';

const ConfigPage: React.FC = () => {
  const [scope, setScope] = useState<'global' | string>('global');
  const [subjects, setSubjects] = useState<string[]>([]);
  const [alias, setAlias] = useState<string>('');
  const [normalize, setNormalize] = useState<boolean>(false);
  const [compatibilityLevel, setCompatibilityLevel] = useState<CompatibilityLevel>('NONE');
  const [mode, setMode] = useState<Mode>('READWRITE');
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
        config = await getSubjectConfig(scope);
      }
      setCompatibilityLevel(config.data.compatibilityLevel);
      setAlias(config.data.alias || '');
      setNormalize(config.data.normalize || false);
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
        modeResponse = await getSubjectMode(scope);
      }
      setMode(modeResponse.data);
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
  };

  const handleNormalizeChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const normalize = event.target.checked;
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
  };

  const handleCompatibilityLevelChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
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
            placeholder="Leave blank to disable"
          />
          <InputRightElement width="4.5rem">
            <Button h="1.75rem" size="sm" onClick={handleSaveAlias}>
              Save
            </Button>
          </InputRightElement>
        </InputGroup>

        <Text>Normalize schemas</Text>
        <Switch
          isChecked={normalize}
          onChange={handleNormalizeChange}
        />

        <Text>Compatibility Level</Text>
        <Select value={compatibilityLevel} onChange={handleCompatibilityLevelChange}>
          <option value="BACKWARD">BACKWARD</option>
          <option value="BACKWARD_TRANSITIVE">BACKWARD_TRANSITIVE</option>
          <option value="FORWARD">FORWARD</option>
          <option value="FORWARD_TRANSITIVE">FORWARD_TRANSITIVE</option>
          <option value="FULL">FULL</option>
          <option value="FULL_TRANSITIVE">FULL_TRANSITIVE</option>
          <option value="NONE">NONE</option>
        </Select>

        <Text>Mode</Text>
        <Select value={mode} onChange={handleModeChange}>
          <option value="READONLY">READONLY</option>
          <option value="WRITEONLY">WRITEONLY</option>
          <option value="READWRITE">READWRITE</option>
        </Select>
      </Grid>
    </Box>
  );
};

export default ConfigPage;

