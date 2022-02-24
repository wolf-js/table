import { createTable } from './src';

createTable(
  '#table',
  () => 1200,
  () => 600,
  { scrollable: true }
).render();
