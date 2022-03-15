import WolfTable from './src';

WolfTable.create(
  '#table',
  () => 1200,
  () => 600,
  {
    scrollable: true,
    resizable: true,
    selectable: true,
  }
)
  .freeze('D5')
  .render();
