/**
 * Utilitários para formatação de valores monetários e datas
 */

/**
 * Formata um valor para moeda
 * @param value Valor a ser formatado
 * @param currency Código da moeda (padrão: BRL)
 * @returns Valor formatado como moeda
 */
export const formatCurrency = (value: number, currency = 'BRL'): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

/**
 * Formata uma data para exibição
 * @param date Data a ser formatada (string ISO ou objeto Date)
 * @param format Formato desejado ('short', 'long', 'relative')
 * @returns Data formatada como string
 */
export const formatDate = (
  date: string | Date,
  format: 'short' | 'long' | 'relative' = 'short'
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Verifica se a data é válida
  if (isNaN(dateObj.getTime())) {
    return 'Data inválida';
  }
  
  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  // Formato relativo (ex: "há 5 minutos")
  if (format === 'relative') {
    if (diffSecs < 60) {
      return 'agora mesmo';
    } else if (diffMins < 60) {
      return `há ${diffMins} ${diffMins === 1 ? 'minuto' : 'minutos'}`;
    } else if (diffHours < 24) {
      return `há ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`;
    } else if (diffDays < 30) {
      return `há ${diffDays} ${diffDays === 1 ? 'dia' : 'dias'}`;
    }
  }
  
  // Opções para formatação
  const options: Intl.DateTimeFormatOptions = 
    format === 'short' 
      ? { day: '2-digit', month: '2-digit', year: 'numeric' }
      : { 
          day: '2-digit', 
          month: 'long', 
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        };
  
  return new Intl.DateTimeFormat('pt-BR', options).format(dateObj);
};

/**
 * Formata uma data para exibir mês e ano
 * @param date Data a ser formatada
 * @returns String no formato "Mês/Ano"
 */
export const formatMonthYear = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('pt-BR', { 
    month: 'long', 
    year: 'numeric' 
  }).format(dateObj);
};

/**
 * Formata número com separadores de milhares
 * @param value Número a ser formatado
 * @returns Número formatado com separadores
 */
export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('pt-BR').format(value);
};

/**
 * Formata um percentual
 * @param value Valor (0-100)
 * @param decimals Casas decimais
 * @returns Percentual formatado
 */
export const formatPercent = (value: number, decimals = 1): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value / 100);
}; 