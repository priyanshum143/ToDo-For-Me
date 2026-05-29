/** Built-in list for Today / Tomorrow / All tasks on the home screen */
export const DEFAULT_LIST_ID = 'default';

export interface TaskList {
  id: string;
  name: string;
  createdAt: string;
}
