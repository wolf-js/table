import WolfTable from './src';

WolfTable.create(
  '#table',
  () => 1200,
  () => 600,
  {
    scrollable: true,
    resizable: true,
    selectable: true,
    rows: 10000,
  }
)
  .freeze('D5')
  .render();
