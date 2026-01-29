export const STATUS = {
    active: 'active',
    inactive: 'inactive',
    suspended: 'suspended',
} as const;

export type STATUS = typeof STATUS[keyof typeof STATUS];