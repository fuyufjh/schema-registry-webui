// Reference: https://docs.confluent.io/platform/current/schema-registry/develop/api.html

// Subject-related models
export interface SubjectVersion {
  subject: string;
  version: number;
}

// Schema-related models
export interface Schema {
  schema: string;
  subject: string;
  version: number;
  id: number;
}

export interface SchemaReference {
  name: string;
  subject: string;
  version: number;
}

export interface RegisterSchemaRequest {
  schema: string;
  schemaType?: string;
  references?: SchemaReference[];
  metadata?: Record<string, string>;
  ruleSet?: Record<string, Array<any>>;
}

export interface RegisterSchemaResponse {
  id: number;
}

// Compatibility-related models
export interface CompatibilityCheckResponse {
  is_compatible: boolean;
}

// Config-related models
export type CompatibilityLevel = 'NONE' | 'BACKWARD' | 'BACKWARD_TRANSITIVE' | 'FORWARD' | 'FORWARD_TRANSITIVE' | 'FULL' | 'FULL_TRANSITIVE';

export interface Config {
  compatibilityLevel: CompatibilityLevel;
  alias?: string;
  normalize?: boolean;
}

export interface ConfigUpdateRequest {
  compatibility?: CompatibilityLevel;
  alias?: string;
  normalize?: boolean;
}

// Mode-related models
export type Mode = 'IMPORT' | 'READONLY' | 'READWRITE';

export interface ModeResponse {
  mode: Mode;
}

export interface ModeUpdateRequest {
  mode: Mode;
}

// Server-related models
export interface SchemaRegistryServerVersion {
  version: string;
  commitId: string;
}

