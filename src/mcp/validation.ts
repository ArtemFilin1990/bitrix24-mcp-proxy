export class BadRequestError extends Error {
  statusCode = 400;
}

export const ensureObject = <T extends object>(value: unknown, message: string): T | undefined => {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value !== 'object' || Array.isArray(value)) {
    throw new BadRequestError(message);
  }

  return value as T;
};

export const ensureString = (value: unknown, message: string): string | undefined => {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new BadRequestError(message);
  }

  return value.trim();
};

export const ensurePositiveNumber = (value: unknown, message: string): number => {
  if (typeof value !== 'number' || Number.isNaN(value) || !Number.isFinite(value) || value <= 0) {
    throw new BadRequestError(message);
  }

  return value;
};

export const ensureNumber = (value: unknown, message: string): number | undefined => {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value !== 'number' || Number.isNaN(value) || !Number.isFinite(value)) {
    throw new BadRequestError(message);
  }

  return value;
};

export const ensureBoolean = (value: unknown, message: string): boolean | undefined => {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value !== 'boolean') {
    throw new BadRequestError(message);
  }

  return value;
};

export const ensureArray = <T>(value: unknown, message: string): T[] | undefined => {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (!Array.isArray(value)) {
    throw new BadRequestError(message);
  }

  return value as T[];
};
