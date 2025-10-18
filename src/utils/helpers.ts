// src/utils/helpers.ts (新規ファイル)
/**
 * 志望度に応じたバッジのCSSクラスを返す
 */
export const getDesireBadgeClass = (level: number): string => {
  if (level >= 4) return 'badge-high';
  if (level >= 3) return 'badge-medium';
  return 'badge-low';
};

/**
 * 汎用ソート関数
 */
export const sortItems = <T extends Record<string, any>>(
  items: T[],
  sortBy: string,
  sortOrder: 'asc' | 'desc',
  getValue: (item: T, sortBy: string) => number | string | Date
): T[] => {
  const sorted = [...items].sort((a, b) => {
    const aValue = getValue(a, sortBy);
    const bValue = getValue(b, sortBy);
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return aValue - bValue;
    }
    
    if (aValue instanceof Date && bValue instanceof Date) {
      return aValue.getTime() - bValue.getTime();
    }
    
    return String(aValue).localeCompare(String(bValue));
  });
  
  return sortOrder === 'asc' ? sorted : sorted.reverse();
};