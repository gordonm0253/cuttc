export function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  const status = err.status || 400;
  res.status(status).json({ error: err.message || 'Unexpected error' });
}
