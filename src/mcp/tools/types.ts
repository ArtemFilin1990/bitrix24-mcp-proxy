/**
 * TypeScript interfaces for Bitrix24 MCP tools
 */

export interface ToolParameter {
  type: string;
  description: string;
  optional?: boolean;
  additionalProperties?: boolean;
  enum?: string[];
}

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, ToolParameter>;
}

export interface BitrixRequest {
  method: string;
  payload: Record<string, unknown>;
}

// Filter types for list operations
export interface ListFilter {
  [key: string]: unknown;
}

export interface ListOrder {
  [key: string]: 'ASC' | 'DESC';
}

// Common entity fields
export interface EntityFields {
  [key: string]: unknown;
}

// Deal-specific types
export interface DealFilter extends ListFilter {
  STAGE_ID?: string;
  CATEGORY_ID?: number;
  ASSIGNED_BY_ID?: number;
  OPPORTUNITY?: number;
  '>=OPPORTUNITY'?: number;
  '<=OPPORTUNITY'?: number;
  '>=DATE_CREATE'?: string;
  '<=DATE_CREATE'?: string;
}

// Lead-specific types
export interface LeadFilter extends ListFilter {
  STATUS_ID?: string;
  ASSIGNED_BY_ID?: number;
  SOURCE_ID?: string;
  '>=DATE_CREATE'?: string;
  '<=DATE_CREATE'?: string;
}

// Contact-specific types
export interface ContactFilter extends ListFilter {
  NAME?: string;
  LAST_NAME?: string;
  PHONE?: string;
  EMAIL?: string;
  COMPANY_ID?: number;
}

// Company-specific types
export interface CompanyFilter extends ListFilter {
  TITLE?: string;
  COMPANY_TYPE?: string;
  INDUSTRY?: string;
}

// Task-specific types
export interface TaskFilter extends ListFilter {
  RESPONSIBLE_ID?: number;
  STATUS?: number;
  PRIORITY?: number;
  CREATED_BY?: number;
  GROUP_ID?: number;
}

// Activity-specific types
export interface ActivityFilter extends ListFilter {
  OWNER_ID?: number;
  OWNER_TYPE_ID?: number;
  TYPE_ID?: number;
  COMPLETED?: 'Y' | 'N';
  RESPONSIBLE_ID?: number;
}

// User-specific types
export interface UserFilter extends ListFilter {
  ACTIVE?: boolean;
  ID?: number;
  EMAIL?: string;
}

// Timeline comment types
export type EntityType = 'deal' | 'contact' | 'company' | 'lead';

// Entity type mapping for Bitrix24 API
export const ENTITY_TYPE_IDS: Record<string, number> = {
  lead: 1,
  deal: 2,
  contact: 3,
  company: 4,
};

// Status entity types for crm.status.list
export const STATUS_ENTITY_IDS = [
  'STATUS', // Lead statuses
  'DEAL_STAGE', // Deal stages (default pipeline)
  'SOURCE', // Sources
  'CONTACT_SOURCE',
  'COMPANY_TYPE',
  'EMPLOYEES',
  'INDUSTRY',
  'DEAL_TYPE',
  'HONORIFIC',
] as const;
