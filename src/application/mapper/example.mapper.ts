import { ExampleData } from '@application/dtos/response/example.response';
import { Example } from '@infrastructure/prisma/generated/prisma/client';

export function ExampleMapper(row: Example): ExampleData {
  return {
    id: row.id,
    projectId: row.project_id,
    name: row.name,
    description: row.description ?? '',
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
