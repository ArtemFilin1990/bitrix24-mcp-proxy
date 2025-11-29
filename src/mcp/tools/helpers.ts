/**
 * Helper functions for Bitrix24 MCP tools
 */

export class BadRequestError extends Error {
  statusCode = 400;
}

/**
 * Ensures value is a valid object
 */
export const ensureObject = <T extends object>(value: unknown, message: string): T | undefined => {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value !== 'object' || Array.isArray(value)) {
    throw new BadRequestError(message);
  }

  return value as T;
};

/**
 * Ensures value is a non-empty string
 */
export const ensureString = (value: unknown, message: string): string | undefined => {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new BadRequestError(message);
  }

  return value.trim();
};

/**
 * Ensures value is a positive number
 */
export const ensurePositiveNumber = (value: unknown, message: string): number => {
  if (typeof value !== 'number' || Number.isNaN(value) || value <= 0) {
    throw new BadRequestError(message);
  }

  return value;
};

/**
 * Ensures value is a non-negative number (0 or positive)
 */
export const ensureNonNegativeNumber = (value: unknown, message: string): number => {
  if (typeof value !== 'number' || Number.isNaN(value) || value < 0) {
    throw new BadRequestError(message);
  }

  return value;
};

/**
 * Gets optional number with default value
 */
export const getOptionalNumber = (value: unknown, defaultValue: number): number => {
  if (value === undefined || value === null) {
    return defaultValue;
  }

  if (typeof value !== 'number' || Number.isNaN(value)) {
    return defaultValue;
  }

  return value;
};

/**
 * Gets optional positive number with default value
 */
export const getOptionalPositiveNumber = (value: unknown, defaultValue: number): number => {
  if (value === undefined || value === null) {
    return defaultValue;
  }

  if (typeof value !== 'number' || Number.isNaN(value) || value <= 0) {
    return defaultValue;
  }

  return value;
};

/**
 * Ensures value is one of the allowed values
 */
export const ensureEnum = <T extends string>(value: unknown, allowed: readonly T[], message: string): T => {
  if (typeof value !== 'string' || !allowed.includes(value as T)) {
    throw new BadRequestError(`${message}. Allowed values: ${allowed.join(', ')}`);
  }

  return value as T;
};

/**
 * Validates entity type for timeline operations
 */
export const validateEntityType = (entityType: string | undefined): string => {
  const allowedEntityTypes = ['deal', 'contact', 'company', 'lead'];

  if (!entityType || !allowedEntityTypes.includes(entityType.toLowerCase())) {
    throw new BadRequestError('Parameter "entityType" must be one of: deal, contact, company, lead');
  }

  return entityType.toUpperCase();
};

/**
 * Parses ISO date string and validates format
 */
export const ensureISODate = (value: unknown, message: string): string | undefined => {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value !== 'string') {
    throw new BadRequestError(message);
  }

  // Basic ISO date format validation
  const isoDateRegex = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/;
  if (!isoDateRegex.test(value)) {
    throw new BadRequestError(`${message}. Expected ISO 8601 format (e.g., 2024-01-15 or 2024-01-15T10:30:00)`);
  }

  return value;
};

/**
 * Creates standard list payload with filter, order, start, and limit
 */
export const createListPayload = (
  filter: Record<string, unknown> | undefined,
  order: Record<string, unknown> | undefined,
  start: number,
  limit: number,
  select?: string[]
): Record<string, unknown> => {
  const payload: Record<string, unknown> = {
    filter: filter || {},
    start,
    limit,
  };

  if (order && Object.keys(order).length > 0) {
    payload.order = order;
  }

  if (select && select.length > 0) {
    payload.select = select;
  }

  return payload;
};
