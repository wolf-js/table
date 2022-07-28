import { DataIndexCell, DataCell, TableData, FormulaFunc } from ".";

function updateMap(map: Map<Number, Number[]>, key: number, value: number) {
  if (!map.has(key)) {
    map.set(key, []);
  }
  map.get(key)?.push(value);
}

export default class Cells {
  _: DataIndexCell[] = [];
  _rows = new Map();
  _cols = new Map();

  constructor() {}

  load({ cells }: TableData) {
    if (cells) {
      const { _rows, _cols } = this
      this._ = cells;
      for (let i = 0; i < cells.length; i += 1) {
        const [r, c, cell] = cells[i];
        updateMap(_rows, r, i)
        updateMap(_cols, c, i)
      }
    }
  }

  cell (row: number, col: number, valueByFormula: FormulaFunc): DataCell {
    const indexCell = this.get(row, col);
    if (indexCell) {
      const [, , cell] = indexCell
      if (cell instanceof Object) {
        if (cell.formula) {
          cell.value = valueByFormula(cell.formula)
        }
      }
      return cell;
    }
    return null;
  }

  get(row: number, col: number): DataIndexCell | null {
    const { _rows } = this
    if (_rows.has(row)) {
      const colIndexes = _rows.get(row)
      for (let i of colIndexes) {
        if (i === col) {
          return this._[i];
        }
      }
    }
    return null;
  }

  set(row: number, col: number, cell: DataCell) {
    const old = this.get(row, col)
    if (old == null) {
      const index = this._.push([row, col, cell])
      updateMap(this._rows, row, index);
      updateMap(this._cols, col, index);
    } else {
      Object.assign(old, cell);
    }
  }
}