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
 * Formata uma data no padrão pt-BR
 */
export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  });
};

/**
 * Retorna o nome do mês atual e ano formatados
 */
export const getCurrentMonthYearDisplay = () => {
  const now = new Date();
  return now.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
};

/**
 * Retorna a data atual formatada como dia da semana, dia e mês
 */
export const getCurrentDateFormatted = () => {
  const now = new Date();
  return now.toLocaleDateString('pt-BR', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long' 
  });
}; 