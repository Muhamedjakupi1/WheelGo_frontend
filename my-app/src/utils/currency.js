const FALLBACK_CURRENCY = {
  currency: "EUR",
  currencySymbol: "EUR",
  currencyName: "Euro",
};

export function resolveCurrencySettings(settings) {
  return {
    currency: settings?.currency || FALLBACK_CURRENCY.currency,
    currencySymbol:
      settings?.currencySymbol || settings?.currency || FALLBACK_CURRENCY.currencySymbol,
    currencyName: settings?.currencyName || FALLBACK_CURRENCY.currencyName,
  };
}

export function formatCurrencyAmount(value, settings, options = {}) {
  const amount = Number(value || 0).toFixed(2);
  const currency = resolveCurrencySettings(settings);
  const joiner = options.tight ? "" : " ";
  return `${currency.currencySymbol}${joiner}${amount}`;
}

export function formatCurrencyPerDay(value, settings) {
  return `${formatCurrencyAmount(value, settings, { tight: true })}/day`;
}

export function formatCurrencyPerUnit(value, settings, unitLabel) {
  return `${formatCurrencyAmount(value, settings)} ${unitLabel}`;
}
