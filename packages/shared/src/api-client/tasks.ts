import type { BaseClient } from './types'
import type { UpdateTaskInput } from '../schemas/task'

export function tasksApi(client: BaseClient) {
  return {
    update: (id: string, data: UpdateTaskInput) =>
      client.patch<{ task: any }>(`/api/tasks/${id}`, data),
  }
}
