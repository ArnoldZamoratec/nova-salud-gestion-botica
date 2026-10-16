# Panel de administración y motor de analítica (IA sin LLM)

Este documento explica la arquitectura, las fórmulas matemáticas y los endpoints del motor de analítica predictiva del panel de administración de **Nova Salud**.

El motor usa aprendizaje automático clásico, modelos estadísticos y algoritmos de minería de datos escritos en JavaScript puro (sin dependencias externas) para obtener información directamente de la base de datos transaccional.

---

## Contenido
1. [Algoritmos de IA / estadística](#1-algoritmos-de-ia--estadística)
   - [Regresión lineal y pronóstico de ingresos](#regresión-lineal-y-pronóstico-de-ingresos)
   - [K-Means y segmentación de clientes](#k-means-y-segmentación-de-clientes)
   - [Algoritmo Apriori y combos de productos](#algoritmo-apriori-y-combos-de-productos)
   - [Rotación de inventario y días de cobertura](#rotación-de-inventario-y-días-de-cobertura)
2. [Endpoints REST](#2-endpoints-rest)
3. [Guía de integración con el frontend](#3-guía-de-integración-con-el-frontend)

---

## 1. Algoritmos de IA / estadística

### Regresión lineal y pronóstico de ingresos

#### Descripción
El modelo analiza el historial de ingresos diarios de los últimos 30 días y proyecta la tendencia de los próximos 7 días.

#### Fórmula
Se modela el ingreso diario como una función lineal del tiempo:
\[y = mx + c\]
Donde:
- \(x\): desplazamiento en días (de \(0\) a \(N-1\)).
- \(y\): ingreso del día \(x\).
- \(m\): pendiente de la tendencia.
- \(c\): intercepto (ingreso base).

Con el **método de mínimos cuadrados** se calcula:
\[m = \frac{N \sum(xy) - \sum x \sum y}{N \sum(x^2) - (\sum x)^2}\]
\[c = \frac{\sum y - m \sum x}{N}\]

#### Correlación de la tendencia
Para medir qué tan fuerte y estable es la dirección de los ingresos se calcula el **coeficiente de correlación de Pearson (\(r\))**:
\[r = \frac{N \sum(xy) - \sum x \sum y}{\sqrt{[N \sum(x^2) - (\sum x)^2][N \sum(y^2) - (\sum y)^2]}}\]

- \(r > 0.6\): Tendencia alcista fuerte (ingresos crecen de forma sostenida).
- \(0.2 < r \le 0.6\): Tendencia alcista moderada.
- \(-0.2 \le r \le 0.2\): Estable o volátil.
- \(-0.6 \le r < -0.2\): Tendencia bajista moderada.
- \(r < -0.6\): Tendencia bajista fuerte.

#### Pronóstico
Para los próximos 7 días (desplazamientos \(x = N\) a \(x = N+6\)):
\[y_{pronóstico}(x) = \max(0, m \cdot x + c)\]
*(El ingreso no puede ser menor que 0).*

---

### K-Means y segmentación de clientes

#### Descripción
La segmentación divide a los clientes en grupos usando **análisis RFM** (Recencia, Frecuencia, Monto).

#### Variables
Para cada cliente activo se obtiene:
1. **Recencia (R):** días desde su último pedido.
2. **Frecuencia (F):** número total de pedidos completados.
3. **Monto (M):** importe total gastado (S/).

#### Normalización Min-Max
Como los montos (p. ej. S/ 1000) son mucho mayores que la frecuencia (p. ej. 5 pedidos), se escalan las variables al rango \([0, 1]\):
\[x' = \frac{x - x_{min}}{x_{max} - x_{min}}\]

#### Algoritmo K-Means
1. **Inicializar centroides:** se eligen \(K = 3\) puntos al azar del conjunto normalizado.
2. **Asignación:** cada cliente se asigna al centroide más cercano por **distancia euclidiana**:
   \[d(p, q) = \sqrt{\sum_{i=1}^3 (p_i - q_i)^2}\]
3. **Actualización:** los nuevos centroides son el promedio de los puntos de cada grupo.
4. **Iteración:** se repiten los pasos 2 y 3 hasta que los centroides no cambien (máximo 100 iteraciones).
5. **Desnormalización:** los centroides vuelven a sus unidades originales para mostrarlos en el panel.

#### Etiquetado dinámico
Los 3 grupos se ordenan por gasto promedio:
- **Clientes VIP:** el grupo con mayor gasto promedio.
- **En riesgo / Abandono:** de los otros dos, el de mayor recencia (más días inactivo).
- **Compradores activos / nuevos:** el grupo restante (compras recientes, gasto moderado o bajo).

---

### Algoritmo Apriori y combos de productos

#### Descripción
Analiza las ventas para encontrar pares de productos que se compran juntos con frecuencia. Ayuda al administrador a armar combos y ventas cruzadas (p. ej. antigripal + vitamina C).

#### Reglas y métricas
Para un par de productos \(\{A, B\}\):

1. **Soporte:** frecuencia con la que el par aparece en todas las compras:
   \[\text{Soporte}(A \rightarrow B) = \frac{\text{Pedidos con } A \text{ y } B}{\text{Total de pedidos}}\]

2. **Confianza:** probabilidad de que quien compra \(A\) también compre \(B\):
   \[\text{Confianza}(A \rightarrow B) = \frac{\text{Pedidos con } A \text{ y } B}{\text{Pedidos con } A}\]

3. **Lift:** cuánto más probable es comprar \(B\) cuando se compra \(A\), frente a comprar \(B\) de forma independiente:
   \[\text{Lift}(A \rightarrow B) = \frac{\text{Confianza}(A \rightarrow B)}{\text{Soporte}(B)}\]

Se conservan las reglas con \(\text{Soporte} \ge 0.01\), \(\text{Confianza} \ge 0.1\) y \(\text{Lift} > 1.0\) (relación positiva), ordenadas por **lift** descendente.

---

### Rotación de inventario y días de cobertura

#### Descripción
Predice en cuántos días se agotará cada producto según su stock actual y su velocidad de venta. Es la base de las **alertas de reposición**.

#### Cálculos
Para cada producto activo:
1. **Velocidad de venta (diaria):**
   \[\text{Velocidad} = \frac{\text{Unidades vendidas en los últimos 30 días}}{30}\]
2. **Días restantes:**
   \[\text{Días restantes} = \frac{\text{Stock actual}}{\text{Velocidad}}\]

#### Clasificación de alertas
- **Agotado:** el stock actual es 0.
- **Reponer de inmediato:** \(\text{Días restantes} \le 7\).
- **Advertencia:** \(7 < \text{Días restantes} \le 15\).
- **Saludable:** \(\text{Días restantes} > 15\) (o velocidad 0 con stock positivo).

---

## 2. Endpoints REST

Todos los endpoints requieren JWT válido y rol `admin` o `super_admin`:
`Authorization: Bearer <token>`

### 1. Estadísticas generales
- **URL:** `/api/dashboard/stats`
- **Método:** `GET`
- **Respuesta:**
```json
{
  "status": "success",
  "stats": {
    "totalRevenue": 15430.50,
    "totalOrders": 125,
    "totalProducts": 420,
    "totalUsers": 98,
    "lowStockCount": 14,
    "pendingOrdersCount": 8
  }
}
```

### 2. Pronóstico de ingresos y ventas
- **URL:** `/api/dashboard/revenue-forecast`
- **Método:** `GET`
- **Respuesta:**
```json
{
  "message": "Pronóstico de ingresos generado correctamente",
  "historical": [
    { "date": "2026-07-28", "revenue": 450.00, "ordersCount": 3 },
    { "date": "2026-07-29", "revenue": 520.00, "ordersCount": 4 }
  ],
  "forecast": [
    { "x": 30, "y": 535.50, "dateStr": "2026-07-30" },
    { "x": 31, "y": 551.20, "dateStr": "2026-07-31" }
  ],
  "trend": {
    "slope": 15.70,
    "intercept": 80.20,
    "correlation": 0.89,
    "trendType": "Tendencia alcista fuerte"
  }
}
```

### 3. Segmentos de clientes
- **URL:** `/api/dashboard/customer-segments`
- **Método:** `GET`
- **Respuesta:**
```json
{
  "message": "Segmentación de clientes completada correctamente",
  "clusters": [
    {
      "index": 0,
      "centroid": { "recency": 2.5, "frequency": 14.8, "monetary": 2340.50 },
      "count": 12,
      "percentage": 15.38,
      "label": "Clientes VIP",
      "description": "Clientes de alto valor, alta frecuencia y muy leales."
    }
  ],
  "userAssignments": [
    {
      "userId": "603f9f4a56b8a211bc9170e1",
      "recency": 2,
      "frequency": 15,
      "monetary": 2400.00,
      "clusterIndex": 0,
      "label": "Clientes VIP",
      "user": {
        "name": "Rosa Huamán",
        "email": "rosa@ejemplo.com"
      }
    }
  ]
}
```

### 4. Combos de productos (reglas Apriori)
- **URL:** `/api/dashboard/product-bundles`
- **Método:** `GET`
- **Respuesta:**
```json
{
  "message": "Combos / reglas de asociación de productos obtenidos correctamente",
  "rules": [
    {
      "antecedent": "603f9f4a56b8a211bc9170e5",
      "consequent": "603f9f4a56b8a211bc9170e6",
      "support": 0.08,
      "confidence": 0.65,
      "lift": 3.25,
      "antecedentProduct": { "name": "Panadol Antigripal", "price": 15.00 },
      "consequentProduct": { "name": "Vitamina C 1000 mg", "price": 25.00 }
    }
  ]
}
```

### 5. Análisis de inventario
- **URL:** `/api/dashboard/inventory-analysis`
- **Método:** `GET`
- **Respuesta:**
```json
{
  "message": "Análisis de rotación de inventario completado correctamente",
  "products": [
    {
      "productId": "603f9f4a56b8a211bc9170e5",
      "name": "Panadol Antigripal",
      "stock": 2,
      "price": 15.00,
      "unitsSoldLast30Days": 90,
      "dailyVelocity": 3.0,
      "daysRemaining": 0.7,
      "status": "Reponer de inmediato"
    }
  ]
}
```

---

## 3. Guía de integración con el frontend

### Gráfico de líneas (ventas históricas + pronóstico)
- Unir los arreglos `historical` y `forecast`.
- Usar **Recharts** (`<LineChart>`) o **Chart.js**.
- Mostrar `historical` con línea continua y `forecast` con línea punteada (ventas previstas).

### Gráfico circular (segmentación de clientes)
- Mostrar el arreglo `clusters` en un gráfico circular.
- Colores sugeridos:
  - **Clientes VIP:** verde esmeralda / morado.
  - **Compradores activos / nuevos:** azul suave.
  - **En riesgo / Abandono:** rojo / ámbar.

### Tabla (combos de productos)
- Mostrar antecedente y consecuente juntos como "Se compran juntos frecuentemente".
- Mostrar el multiplicador `lift` para explicar la relación (p. ej. "Los clientes tienen 3.25 veces más probabilidad de comprar vitamina C cuando compran Panadol Antigripal").

### Alertas de estado (rotación de inventario)
- Mostrar una insignia de alerta junto a los productos con estado "Reponer de inmediato" o "Advertencia".
- Mostrar `daysRemaining` como barra de progreso (cuenta regresiva).
