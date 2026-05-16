const FIELD_LABELS = {
  sku: 'SKU',
  email: '이메일',
  name: '이름',
  price: '가격',
  category: '카테고리',
};

function labelOf(field) {
  return FIELD_LABELS[field] ?? field;
}

function mapDuplicateKeyError(err) {
  const keyValue = err.keyValue ?? {};
  const fields = Object.keys(keyValue);
  const primary = fields[0];
  const label = primary ? labelOf(primary) : '항목';
  return {
    status: 409,
    body: {
      message: `이미 사용 중인 ${label}입니다.`,
      code: 'DUPLICATE_KEY',
      fields,
    },
  };
}

function mapValidationError(err) {
  const errors = Object.entries(err.errors ?? {}).map(([path, e]) => ({
    field: path,
    message: e.message,
  }));
  const summary =
    errors.length === 1
      ? errors[0].message
      : '입력값이 올바르지 않습니다.';
  return {
    status: 400,
    body: {
      message: summary,
      code: 'VALIDATION_ERROR',
      errors,
    },
  };
}

function mapCastError(err) {
  return {
    status: 400,
    body: {
      message: `잘못된 ${labelOf(err.path)} 형식입니다.`,
      code: 'CAST_ERROR',
      field: err.path,
    },
  };
}

export function notFoundHandler(req, res, next) {
  res.status(404).json({
    message: `Not Found - ${req.originalUrl}`,
  });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  let status = err.status || err.statusCode || 500;
  let payload = { message: err.message || 'Internal Server Error' };

  if (err && err.code === 11000) {
    const mapped = mapDuplicateKeyError(err);
    status = mapped.status;
    payload = mapped.body;
  } else if (err && err.name === 'ValidationError') {
    const mapped = mapValidationError(err);
    status = mapped.status;
    payload = mapped.body;
  } else if (err && err.name === 'CastError') {
    const mapped = mapCastError(err);
    status = mapped.status;
    payload = mapped.body;
  }

  if (process.env.NODE_ENV !== 'production' && err && err.stack && status >= 500) {
    payload.stack = err.stack;
  }
  res.status(status).json(payload);
}
