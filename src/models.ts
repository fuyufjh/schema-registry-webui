// Reference: https://raw.githubusercontent.com/confluentinc/schema-registry/master/core/generated/swagger-ui/schema-registry-api-spec.yaml

export interface CompatibilityCheckResponse {
    is_compatible: boolean;
    messages: string[];
  }
  
  export interface RegisterSchemaRequest {
    version?: number;
    id?: number;
    schemaType?: string;
    references?: SchemaReference[];
    metadata?: Metadata;
    ruleSet?: RuleSet;
    schema: string;
  }
  
  export interface SchemaReference {
    name: string;
    subject: string;
    version: number;
  }
  
  export interface Config {
    compatibilityLevel: 'BACKWARD' | 'BACKWARD_TRANSITIVE' | 'FORWARD' | 'FORWARD_TRANSITIVE' | 'FULL' | 'FULL_TRANSITIVE' | 'NONE';
    alias?: string;
    normalize?: boolean;
    compatibilityGroup?: string;
    defaultMetadata?: Metadata;
    overrideMetadata?: Metadata;
    defaultRuleSet?: RuleSet;
    overrideRuleSet?: RuleSet;
  }
  
  export interface ConfigUpdateRequest {
    alias?: string;
    normalize?: boolean;
    compatibility?: 'BACKWARD' | 'BACKWARD_TRANSITIVE' | 'FORWARD' | 'FORWARD_TRANSITIVE' | 'FULL' | 'FULL_TRANSITIVE' | 'NONE';
    compatibilityGroup?: string;
    defaultMetadata?: Metadata;
    overrideMetadata?: Metadata;
    defaultRuleSet?: RuleSet;
    overrideRuleSet?: RuleSet;
  }
  
  export interface Mode {
    mode: 'READWRITE' | 'READONLY' | 'READONLY_OVERRIDE' | 'IMPORT';
  }
  
  export interface ModeUpdateRequest {
    mode: 'READWRITE' | 'READONLY' | 'READONLY_OVERRIDE' | 'IMPORT';
  }
  
  export interface SchemaString {
    schemaType?: string;
    schema: string;
    references?: SchemaReference[];
    metadata?: Metadata;
    ruleSet?: RuleSet;
  }
  
  export interface Schema {
    subject: string;
    version: number;
    id: number;
    schemaType?: string;
    references?: SchemaReference[];
    metadata?: Metadata;
    ruleset?: RuleSet;
    schema: string;
    ruleSet?: RuleSet;
  }
  
  export interface SubjectVersion {
    subject: string;
    version: number;
  }
  
  export interface ServerClusterId {
    scope: Record<string, any>;
    id: string;
  }
  
  export interface RegisterSchemaResponse {
    id: number;
    version?: number;
    schemaType?: string;
    references?: SchemaReference[];
    metadata?: Metadata;
    ruleSet?: RuleSet;
    schema?: string;
  }
  
  export interface ErrorMessage {
    error_code: number;
    message: string;
  }
  
  export interface SchemaRegistryServerVersion {
    version: string;
    commitId: string;
  }
  
  export interface Metadata {
    tags?: Record<string, string[]>;
    properties?: Record<string, string>;
    sensitive?: string[];
  }
  
  export interface Rule {
    name: string;
    doc?: string;
    kind: 'TRANSFORM' | 'CONDITION';
    mode: 'UPGRADE' | 'DOWNGRADE' | 'UPDOWN' | 'WRITE' | 'READ' | 'WRITEREAD';
    type: string;
    tags?: string[];
    params?: Record<string, string>;
    expr: string;
    onSuccess?: string;
    onFailure?: string;
    disabled?: boolean;
  }
  
  export interface RuleSet {
    migrationRules?: Rule[];
    domainRules?: Rule[];
  }