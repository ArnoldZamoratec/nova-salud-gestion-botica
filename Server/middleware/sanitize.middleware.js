// Protección contra inyección NoSQL: elimina claves que empiezan con "$" o contienen "."
// (p. ej. { "email": { "$gt": "" } }). Reemplaza a express-mongo-sanitize, que no es
// compatible con Express 5 porque req.query es de solo lectura.
const limpiar = (valor) => {
  if (Array.isArray(valor)) return valor.map(limpiar);
  if (valor && typeof valor === "object" && !(valor instanceof Date)) {
    const limpio = {};
    for (const [clave, v] of Object.entries(valor)) {
      if (clave.startsWith("$") || clave.includes(".")) continue;
      limpio[clave] = limpiar(v);
    }
    return limpio;
  }
  return valor;
};

export const sanitizeMiddleware = (req, res, next) => {
  if (req.body) req.body = limpiar(req.body);
  if (req.params) req.params = limpiar(req.params);
  Object.defineProperty(req, "query", {
    value: limpiar(req.query),
    writable: true,
    configurable: true,
    enumerable: true,
  });
  next();
};
