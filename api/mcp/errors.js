export class BadRequestError extends Error {
  constructor(message) {
    super(message);
    this.name = 'BadRequestError';
    this.statusCode = 400;
    this.code = 'BAD_REQUEST';
  }
}

export class ConfigurationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ConfigurationError';
    this.statusCode = 500;
    this.code = 'CONFIGURATION_ERROR';
  }
}

export class UpstreamError extends Error {
  constructor(message, statusCode = 502) {
    super(message);
    this.name = 'UpstreamError';
    this.statusCode = statusCode;
    this.code = 'UPSTREAM_ERROR';
  }
}
