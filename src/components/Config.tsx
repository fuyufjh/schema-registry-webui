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
} from '@chakra-ui/react';
import { getGlobalConfig, updateGlobalConfig } from '../api';
import { Config, CompatibilityLevel } from '../models';

const ConfigPage: React.FC = () => {
  const [alias, setAlias] = useState<string>('');
  const [normalize, setNormalize] = useState<boolean>(false);
  const [compatibilityLevel, setCompatibilityLevel] = useState<CompatibilityLevel>('NONE');
  const toast = useToast();

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const config = await getGlobalConfig();
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

  const handleSaveAlias = async () => {
    try {
      await updateGlobalConfig({ alias });
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
      await updateGlobalConfig({ normalize });
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
      await updateGlobalConfig({ compatibility: newCompatibilityLevel });
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

  return (
    <Box p={5}>
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
      </Grid>
    </Box>
  );
};

export default ConfigPage;

