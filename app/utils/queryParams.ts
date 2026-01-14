// app/utils/queryParams.ts


export const assessmentTypes = ['evaluation', 'survey', 'self_assessment'] as const;
export const assessmentStatuses = ['draft', 'published', 'archived', 'suspended'] as const;
export const assessmentSortOptions = ['created_at', 'updated_at', 'title'] as const;


export const getValidParam = <T extends readonly string[]>(
  value: string | null,
  allowed: T
): T[number] | undefined => {
  return value && allowed.includes(value as T[number])
    ? (value as T[number])
    : undefined;
};
