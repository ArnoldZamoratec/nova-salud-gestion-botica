// Etiquetas en español para los valores internos que devuelve la API

export const ORDER_STATUS_LABELS = {
  pending: "Pendiente",
  shipped: "Enviado",
  delivered: "Entregado",
  canceled: "Cancelado",
};

export const ROLE_LABELS = {
  user: "Cliente",
  courier: "Repartidor",
  admin: "Administrador",
  super_admin: "Super administrador",
};

export const GENDER_LABELS = {
  male: "Masculino",
  female: "Femenino",
};

export const PAYMENT_METHOD_LABELS = {
  COD: "Contra entrega",
  card: "Tarjeta",
};

const plural = (n, uno, varios) => `${n} ${n === 1 ? uno : varios}`;

export const formatCajas = (n) => plural(n, "caja", "cajas");
export const formatBlisteres = (n) => plural(n, "blíster", "blísteres");
