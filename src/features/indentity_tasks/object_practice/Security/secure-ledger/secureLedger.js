export function createSecureTx(txData) {
  if (!txData || typeof txData !== "object") return null;

  return Object.create(null, {
    id: { value: txData.id, enumerable: true, writable: false },
    name: { value: txData.name, enumerable: true },
    amount: { value: txData.amount, enumerable: true },
    currency: { value: txData.currency, enumerable: true, writable: false },
    createdAt: { value: txData.createdAt, enumerable: true },
    updatedAt: { value: txData.updatedAt, enumerable: true }
  });
}

export function regTransaction(ledger, txData) {
  if (!ledger || typeof ledger !== "object") return null;

  if (Array.isArray(txData)) {
    const registered = [];
    for (const item of txData) {
      const tx = createSecureTx(item);
      if (tx && tx.id) {
        ledger[tx.id] = tx;
        registered.push(structuredClone(tx));
      }
    }
    return registered;
  }

  const tx = createSecureTx(txData);
  if (!tx || !tx.id) return null;

  ledger[tx.id] = tx;
  return structuredClone(tx);
};

export function calcVolumeCurrency(ledger, targetCurrency) {
  if (!ledger || typeof ledger !== "object" || typeof targetCurrency !== "string") {
    return 0;
  }

  let totalVolume = 0;
  const keys = Reflect.ownKeys(ledger);

  for (let i = 0; i < keys.length; i++) {
    const tx = ledger[keys[i]];
    if (tx && typeof tx === "object" && tx.currency === targetCurrency) {
      const amount = Number(tx.amount);
      if (Number.isFinite(amount)) {
        totalVolume += amount;
      }
    }
  }

  return totalVolume;
}