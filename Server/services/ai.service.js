
/**
 * Ajusta una regresión lineal simple (y = mx + c) y calcula la correlación de Pearson.
 * Extrapola para proyectar valores futuros.
 * 
 * @param {Array<{x: number, y: number, dateStr?: string}>} points - Historical data points.
 * @param {number} forecastCount - Number of future points to predict.
 * @returns {Object} Regression statistics and forecast.
 */
export const performLinearRegression = (points, forecastCount = 7) => {
  const n = points.length;
  if (n < 2) {
    return {
      slope: 0,
      intercept: 0,
      correlation: 0,
      trendType: "Datos insuficientes",
      forecast: []
    };
  }

  let sumX = 0, sumY = 0, sumXX = 0, sumYY = 0, sumXY = 0;
  for (const p of points) {
    sumX += p.x;
    sumY += p.y;
    sumXX += p.x * p.x;
    sumYY += p.y * p.y;
    sumXY += p.x * p.y;
  }

  const denominator = n * sumXX - sumX * sumX;
  const slope = denominator !== 0 ? (n * sumXY - sumX * sumY) / denominator : 0;
  const intercept = (sumY - slope * sumX) / n;

  // Calcula el coeficiente de correlación de Pearson (r)
  const corrNumerator = n * sumXY - sumX * sumY;
  const corrDenominator = Math.sqrt(
    (n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY)
  );
  const correlation = corrDenominator !== 0 ? corrNumerator / corrDenominator : 0;

  // Interpreta la tendencia
  let trendType;
  if (correlation > 0.6) trendType = "Tendencia alcista fuerte";
  else if (correlation > 0.2) trendType = "Tendencia alcista moderada";
  else if (correlation < -0.6) trendType = "Tendencia bajista fuerte";
  else if (correlation < -0.2) trendType = "Tendencia bajista moderada";
  else trendType = "Estable o volátil";

  // Pronostica valores futuros
  const forecast = [];
  const lastX = points[n - 1].x;
  const lastDate = points[n - 1].dateStr ? new Date(points[n - 1].dateStr) : new Date();

  for (let i = 1; i <= forecastCount; i++) {
    const futureX = lastX + i;
    const futureY = Math.max(0, slope * futureX + intercept); // Revenue cannot be negative

    // Calcula la fecha futura (texto)
    const futureDate = new Date(lastDate);
    futureDate.setDate(lastDate.getDate() + i);
    const dateStr = futureDate.toISOString().split("T")[0];

    forecast.push({
      x: futureX,
      y: parseFloat(futureY.toFixed(2)),
      dateStr
    });
  }

  return {
    slope: parseFloat(slope.toFixed(4)),
    intercept: parseFloat(intercept.toFixed(2)),
    correlation: parseFloat(correlation.toFixed(4)),
    trendType,
    forecast
  };
};

/**
 * Ejecuta K-Means sobre las variables RFM.
 * Escala las entradas, agrupa y devuelve los centroides a su escala original.
 * 
 * @param {Array<{id: string, features: number[]}>} data - Dataset where features = [recency, frequency, monetary].
 * @param {number} k - Number of clusters (default 3).
 * @param {number} maxIterations - Maximum clustering loops.
 * @returns {Object} Clusters, assignments, and summary.
 */
export const performKMeans = (data, k = 3, maxIterations = 100) => {
  if (!data || data.length === 0) {
    return { clusters: [], assignments: [] };
  }

  const numFeatures = data[0].features.length;

  // Normalización Min-Max
  const minVal = new Array(numFeatures).fill(Infinity);
  const maxVal = new Array(numFeatures).fill(-Infinity);

  for (const item of data) {
    for (let f = 0; f < numFeatures; f++) {
      if (item.features[f] < minVal[f]) minVal[f] = item.features[f];
      if (item.features[f] > maxVal[f]) maxVal[f] = item.features[f];
    }
  }

  const ranges = maxVal.map((max, idx) => {
    const min = minVal[idx];
    return max === min ? 1 : max - min; // Prevent division by zero
  });

  const normalizedData = data.map((item) => ({
    id: item.id,
    originalFeatures: [...item.features],
    features: item.features.map((val, idx) => (val - minVal[idx]) / ranges[idx])
  }));

  // Inicialización de centroides
  let centroids = [];
  const selectedIndices = new Set();
  while (centroids.length < Math.min(k, normalizedData.length)) {
    const idx = Math.floor(Math.random() * normalizedData.length);
    if (!selectedIndices.has(idx)) {
      selectedIndices.add(idx);
      centroids.push([...normalizedData[idx].features]);
    }
  }

  // Función auxiliar de distancia
  const euclideanDistance = (a, b) => {
    let sum = 0;
    for (let i = 0; i < a.length; i++) {
      sum += Math.pow(a[i] - b[i], 2);
    }
    return Math.sqrt(sum);
  };

  let assignments = new Array(normalizedData.length).fill(-1);
  let changed = true;
  let iteration = 0;

  while (changed && iteration < maxIterations) {
    changed = false;
    iteration++;

    // Paso de asignación
    for (let i = 0; i < normalizedData.length; i++) {
      const point = normalizedData[i].features;
      let minDistance = Infinity;
      let closestCluster = -1;

      for (let j = 0; j < centroids.length; j++) {
        const d = euclideanDistance(point, centroids[j]);
        if (d < minDistance) {
          minDistance = d;
          closestCluster = j;
        }
      }

      if (assignments[i] !== closestCluster) {
        assignments[i] = closestCluster;
        changed = true;
      }
    }

    // Paso de actualización
    const newCentroids = Array.from({ length: centroids.length }, () => new Array(numFeatures).fill(0));
    const counts = new Array(centroids.length).fill(0);

    for (let i = 0; i < normalizedData.length; i++) {
      const clusterIdx = assignments[i];
      if (clusterIdx === -1) continue;
      counts[clusterIdx]++;
      for (let f = 0; f < numFeatures; f++) {
        newCentroids[clusterIdx][f] += normalizedData[i].features[f];
      }
    }

    for (let j = 0; j < centroids.length; j++) {
      if (counts[j] > 0) {
        for (let f = 0; f < numFeatures; f++) {
          centroids[j][f] = newCentroids[j][f] / counts[j];
        }
      }
    }
  }

  // Desnormaliza los centroides para expresarlos en valores reales del negocio
  const actualCentroids = centroids.map((c) => {
    return c.map((val, idx) => parseFloat((val * ranges[idx] + minVal[idx]).toFixed(2)));
  });

  // Resume los grupos y asigna etiquetas de negocio dinámicamente
  const clusterSummaries = actualCentroids.map((centroid, index) => {
    const memberCount = assignments.filter((a) => a === index).length;
    return {
      index,
      centroid: {
        recency: centroid[0],
        frequency: centroid[1],
        monetary: centroid[2]
      },
      count: memberCount,
      percentage: data.length > 0 ? parseFloat(((memberCount / data.length) * 100).toFixed(2)) : 0
    };
  });

  // Asigna etiquetas según el gasto (Monto)
  const sortedBySpend = [...clusterSummaries].sort((a, b) => b.centroid.monetary - a.centroid.monetary);
  const vipIndex = sortedBySpend[0]?.index;

  let atRiskIndex = -1;
  let activeOccasionalIndex = -1;

  if (sortedBySpend.length > 1) {
    const remaining = sortedBySpend.slice(1);
    if (remaining.length === 1) {
      activeOccasionalIndex = remaining[0].index;
    } else {
      if (remaining[0].centroid.recency > remaining[1].centroid.recency) {
        atRiskIndex = remaining[0].index;
        activeOccasionalIndex = remaining[1].index;
      } else {
        atRiskIndex = remaining[1].index;
        activeOccasionalIndex = remaining[0].index;
      }
    }
  }

  const finalClusters = clusterSummaries.map((summary) => {
    let label = "Ocasionales / Nuevos";
    let description = "Clientes con gasto y frecuencia moderados, activos recientemente.";
    if (summary.index === vipIndex) {
      label = "Clientes VIP";
      description = "Clientes de alto valor, alta frecuencia y muy leales.";
    } else if (summary.index === atRiskIndex) {
      label = "En riesgo / Abandono";
      description = "Clientes con compras previas que no compran hace mucho tiempo.";
    } else if (summary.index === activeOccasionalIndex) {
      label = "Compradores activos / nuevos";
      description = "Clientes activos recientemente con pocas compras y menor gasto.";
    }

    return {
      ...summary,
      label,
      description
    };
  });

  // Relaciona a cada usuario con su segmento
  const userAssignments = data.map((item, idx) => {
    const clusterIdx = assignments[idx];
    const cluster = finalClusters.find((c) => c.index === clusterIdx);
    return {
      userId: item.id,
      recency: item.features[0],
      frequency: item.features[1],
      monetary: item.features[2],
      clusterIndex: clusterIdx,
      label: cluster ? cluster.label : "Sin clasificar"
    };
  });

  return {
    clusters: finalClusters,
    userAssignments
  };
};

/**
 * Implementación simple de Apriori para generar reglas de asociación entre pares de productos.
 * 
 * @param {Array<Array<string>>} baskets - Array of arrays, where each sub-array is a list of product IDs.
 * @param {number} minSupport - Minimum support threshold (default 1%).
 * @param {number} minConfidence - Minimum confidence threshold (default 10%).
 * @returns {Array<Object>} List of association rules sorted by Lift descending.
 */
export const performApriori = (baskets, minSupport = 0.01, minConfidence = 0.1) => {
  const totalBaskets = baskets.length;
  if (totalBaskets === 0) return [];

  const itemCounts = {};
  for (const basket of baskets) {
    const uniqueItems = new Set(basket);
    for (const item of uniqueItems) {
      itemCounts[item] = (itemCounts[item] || 0) + 1;
    }
  }

  const minSupportCount = Math.max(1, minSupport * totalBaskets);
  const frequentItems = Object.keys(itemCounts).filter(
    (item) => itemCounts[item] >= minSupportCount
  );

  const pairCounts = {};
  for (const basket of baskets) {
    const uniqueItems = Array.from(new Set(basket)).filter((item) =>
      frequentItems.includes(item)
    );

    for (let i = 0; i < uniqueItems.length; i++) {
      for (let j = i + 1; j < uniqueItems.length; j++) {
        const pair = uniqueItems[i] < uniqueItems[j]
          ? `${uniqueItems[i]},${uniqueItems[j]}`
          : `${uniqueItems[j]},${uniqueItems[i]}`;
        pairCounts[pair] = (pairCounts[pair] || 0) + 1;
      }
    }
  }

  const rules = [];
  for (const [pairStr, count] of Object.entries(pairCounts)) {
    if (count < minSupportCount) continue;

    const [itemA, itemB] = pairStr.split(",");
    const supportAB = count / totalBaskets;

    const supportA = itemCounts[itemA] / totalBaskets;
    const supportB = itemCounts[itemB] / totalBaskets;

    const confidenceAB = count / itemCounts[itemA];
    const liftAB = confidenceAB / supportB;

    if (confidenceAB >= minConfidence && liftAB > 1) {
      rules.push({
        antecedent: itemA,
        consequent: itemB,
        support: parseFloat(supportAB.toFixed(4)),
        confidence: parseFloat(confidenceAB.toFixed(4)),
        lift: parseFloat(liftAB.toFixed(4))
      });
    }

    const confidenceBA = count / itemCounts[itemB];
    const liftBA = confidenceBA / supportA;

    if (confidenceBA >= minConfidence && liftBA > 1) {
      rules.push({
        antecedent: itemB,
        consequent: itemA,
        support: parseFloat(supportAB.toFixed(4)),
        confidence: parseFloat(confidenceBA.toFixed(4)),
        lift: parseFloat(liftBA.toFixed(4))
      });
    }
  }

  return rules.sort((a, b) => b.lift - a.lift);
};
