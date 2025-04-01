/**
 * Formata um valor numérico como moeda brasileira (BRL)
 */
export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

/**
 * Formata uma porcentagem com duas casas decimais
 */
export const formatPercentage = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value / 100);
};

/**
 * Formata um valor monetário para entrada (sem o símbolo da moeda)
 */
export const formatCurrencyInput = (value: string): string => {
  // Remove qualquer caractere que não seja número ou vírgula
  const cleanedText = value.replace(/[^\d,]/g, '');
  
  // Garante que só haja uma vírgula
  const parts = cleanedText.split(',');
  if (parts.length > 2) {
    return parts[0] + ',' + parts.slice(1).join('');
  }
  
  // Limita as casas decimais a 2
  if (parts[1] && parts[1].length > 2) {
    return parts[0] + ',' + parts[1].substring(0, 2);
  }
  
  return cleanedText;
};

/**
 * Converte um texto formatado como moeda para número
 */
export const currencyToNumber = (value: string): number => {
  // Remove qualquer caractere que não seja número ou vírgula
  const cleanedText = value.replace(/[^\d,]/g, '');
  
  // Converte para o formato numérico (usando ponto como separador decimal)
  return parseFloat(cleanedText.replace(',', '.'));
}; 