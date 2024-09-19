import axios from 'axios';
import {
  CompatibilityCheckResponse,
  RegisterSchemaRequest,
  Config,
  ConfigUpdateRequest,
  Mode,
  ModeUpdateRequest,
  Schema,
  SubjectVersion,
  RegisterSchemaResponse,
  SchemaRegistryServerVersion,
  ModeResponse
} from './models';

const api = axios.create({
  baseURL: process.env.CONFLUENT_SCHEMA_REGISTRY_URL || '/',
});

// Subjects API
export const getSubjects = () => api.get<string[]>('/subjects');
export const getSubjectVersions = (subject: string) => api.get<number[]>(`/subjects/${subject}/versions`);
export const deleteSubject = (subject: string, permanent?: boolean) => api.delete<number[]>(`/subjects/${subject}`, { params: { permanent } });

// Schemas API
export const getSchemaById = (id: number) => api.get<string>(`/schemas/ids/${id}`);
export const getSchemaTypes = () => api.get<string[]>('/schemas/types');
export const getSchemaVersions = (id: number) => api.get<SubjectVersion[]>(`/schemas/ids/${id}/versions`);

// Subject Versions API
export const getSubjectVersion = (subject: string, version: number | 'latest') => 
  api.get<Schema>(`/subjects/${subject}/versions/${version}`);
export const registerSchema = (subject: string, request: RegisterSchemaRequest) => 
  api.post<RegisterSchemaResponse>(`/subjects/${subject}/versions`, request);
export const checkSchemaCompatibility = (subject: string, version: 'latest' | number, request: RegisterSchemaRequest) => 
  api.post<CompatibilityCheckResponse>(`/compatibility/subjects/${subject}/versions/${version}`, request);
export const deleteSchemaVersion = (subject: string, version: number) => 
  api.delete<number>(`/subjects/${subject}/versions/${version}`);

// Config API
export const getGlobalConfig = () => api.get<Config>('/config');
export const updateGlobalConfig = (request: ConfigUpdateRequest) => api.put<Config>('/config', request);
export const deleteGlobalConfig = () => api.delete<Config>('/config');
export const getSubjectConfig = (subject: string) => api.get<Config>(`/config/${subject}`);
export const updateSubjectConfig = (subject: string, request: ConfigUpdateRequest) => 
  api.put<Config>(`/config/${subject}`, request);
export const deleteSubjectConfig = (subject: string) => api.delete(`/config/${subject}`);

// Mode API
export const getGlobalMode = () => api.get<ModeResponse>('/mode');
export const updateGlobalMode = (request: ModeUpdateRequest) => api.put<Mode>('/mode', request);
export const getSubjectMode = (subject: string) => api.get<ModeResponse>(`/mode/${subject}`);
export const updateSubjectMode = (subject: string, request: ModeUpdateRequest) => 
  api.put<Mode>(`/mode/${subject}`, request);
export const deleteSubjectMode = (subject: string) => api.delete(`/mode/${subject}`);

// Other APIs
export const getSchemaRegistryVersion = () => api.get<SchemaRegistryServerVersion>('/v1/metadata/version');
