export function isPrismaKnownError(error: unknown): error is { code: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as any).code === 'string'
  );
}

export enum PRISMA_ERROR_CODE {
  UNIQUE_CONSTRAINT = 'P2002',
  RECORD_NOT_FOUND = 'P2025',
}
