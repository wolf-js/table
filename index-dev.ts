import WolfTable from './src';

WolfTable.create(
  '#table',
  () => 1200,
  () => 600,
  {
    scrollable: true,
    resizable: true,
    selectable: true,
    rows: 1000,
  }
)
  .freeze('D5')
  .render();
