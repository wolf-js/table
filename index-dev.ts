import WolfTable from './src';

WolfTable.create(
  '#table',
  () => 1200,
  () => 600,
  {
    scrollable: true,
    resizable: true,
  }
).render();
