

export class BadRequestError extends Error {
  constructor(message = "Solicitud incorrecta") {
    super(message);
    this.name = "BadRequestError";
    this.statusCode = 400;
  }
}

export class UnAuthorizedError extends Error {
  constructor(message = "No autorizado") {
    super(message);
    this.name = "UnauthorizedError";
    this.statusCode = 401;
  }
}

export class ForbiddenError extends Error {
  constructor(message = "Prohibido") {
    super(message);
    this.name = "ForbiddenError";
    this.statusCode = 403;
  }
}

export class NotFoundError extends Error {
  constructor(message = "No encontrado") {
    super(message);
    this.name = "NotFoundError";
    this.statusCode = 404;
  }
}

export class ConflictError extends Error {
  constructor(message = "Conflicto") {
    super(message);
    this.name = "ConflictError";
    this.statusCode = 409;
  }
}

export class InternalServerError extends Error {
  constructor(message = "Error interno del servidor") {
    super(message);
    this.name = "InternalServerError";
    this.statusCode = 500;
  }
}
export class ValidationError extends Error {
  constructor(message = "Error de validación") {
    super(message);
    this.name = "ValidationError";
    this.statusCode = 422;
  }
}

export class TooManyRequestsError extends Error {
  constructor(message = "Demasiadas solicitudes") {
    super(message);
    this.name = "TooManyRequestsError";
    this.statusCode = 429;
  }
}

export class TokenExpiredError extends Error {
  constructor(message = "Token expirado") {
    super(message);
    this.name = "TokenExpiredError";
    this.statusCode = 401;
  }
}

export class InvalidTokenError extends Error {
  constructor(message = "Token inválido") {
    super(message);
    this.name = "InvalidTokenError";
    this.statusCode = 401;
  }
}


export class OutOfStockError extends Error {
  constructor(message = "Producto agotado") {
    super(message);
    this.name = "OutOfStockError";
    this.statusCode = 400;
  }
}

export class PrescriptionRequiredError extends Error {
  constructor(message = "Requiere receta médica") {
    super(message);
    this.name = "PrescriptionRequiredError";
    this.statusCode = 403;
  }
}

export class ExpiredProductError extends Error {
  constructor(message = "Producto vencido") {
    super(message);
    this.name = "ExpiredProductError";
    this.statusCode = 400;
  }
}

export class OrderNotCancellableError extends Error {
  constructor(message = "El pedido no puede cancelarse") {
    super(message);
    this.name = "OrderNotCancellableError";
    this.statusCode = 400;
  }
}


export class ServiceUnavailableError extends Error {
  constructor(message = "Servicio no disponible") {
    super(message);
    this.name = "ServiceUnavailableError";
    this.statusCode = 503;
  }
}

export class PaymentFailedError extends Error {
  constructor(message = "Pago fallido") {
    super(message);
    this.name = "PaymentFailedError";
    this.statusCode = 402;
  }
}