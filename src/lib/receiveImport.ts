import type { Item } from '../types';

export interface ImportedRow {
  rowNo: number;
  barcode: string;
  name: string;
  qty: string;
  cost: string;
  price: string;
}

export interface MatchedImportLine {
  item: Item;
  qty: number;
  cost: string;
  price: string;
}

export interface NewImportLine {
  name: string;
  barcode?: string;
  qty: number;
  cost: string;
  price: string;
}

export interface SkippedRow {
  rowNo: number;
  label: string;
  reason: string;
}

export interface ImportResult {
  matched: MatchedImportLine[];
  newItems: NewImportLine[];
  skipped: SkippedRow[];
}

type ImportField = 'barcode' | 'name' | 'qty' | 'cost' | 'price';

const HEADER_ALIASES: Record<string, ImportField> = {
  barcode: 'barcode',
  code: 'barcode',
  name: 'name',
  item: 'name',
  'item name': 'name',
  description: 'name',
  qty: 'qty',
  quantity: 'qty',
  cost: 'cost',
  'unit cost': 'cost',
  'cost price': 'cost',
  price: 'price',
  'selling price': 'price',
  srp: 'price',
};

export const RECEIVE_TEMPLATE_CSV =
  'item code,name,barcode,description,qty,cost,price,utang markup,category,threshold,status\r\n';

export const parseReceiveFile = async (file: File): Promise<ImportedRow[]> => {
  const XLSX = await import('xlsx');
  const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  if (!sheet) throw new Error('That file has no sheets.');
  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    raw: false,
    blankrows: false,
  });
  if (rows.length < 2) throw new Error('That file has no data rows.');

  const header = rows[0].map((h) => String(h ?? '').trim().toLowerCase());
  const cols = new Map<ImportField, number>();
  header.forEach((h, i) => {
    const field = HEADER_ALIASES[h];
    if (field && !cols.has(field)) cols.set(field, i);
  });
  if (!cols.has('qty') || (!cols.has('name') && !cols.has('barcode'))) {
    throw new Error(
      'Header row not recognized — the template needs at least a name or barcode column plus qty.'
    );
  }

  const cell = (row: unknown[], field: ImportField) => {
    const i = cols.get(field);
    return i === undefined ? '' : String(row[i] ?? '').trim();
  };

  return rows.slice(1).map((row, idx) => ({
    rowNo: idx + 2,
    barcode: cell(row, 'barcode'),
    name: cell(row, 'name'),
    qty: cell(row, 'qty'),
    cost: cell(row, 'cost'),
    price: cell(row, 'price'),
  }));
};

export const matchImportRows = (
  rows: ImportedRow[],
  catalog: Item[]
): ImportResult => {
  const byBarcode = new Map<string, Item>();
  const byItemCode = new Map<string, Item>();
  const byName = new Map<string, Item>();
  for (const item of catalog) {
    if (item.barcode && !byBarcode.has(item.barcode)) byBarcode.set(item.barcode, item);
    byItemCode.set(item.itemCode.toLowerCase(), item);
    byName.set(item.name.toLowerCase(), item);
  }

  const matched = new Map<string, MatchedImportLine>();
  const newItems = new Map<string, NewImportLine>();
  const skipped: SkippedRow[] = [];

  for (const row of rows) {
    const label = row.name || row.barcode || `row ${row.rowNo}`;
    const qty = Number(row.qty);
    if (!Number.isInteger(qty) || qty < 1) {
      skipped.push({
        rowNo: row.rowNo,
        label,
        reason: `quantity “${row.qty || '—'}” is not a whole number`,
      });
      continue;
    }

    let item: Item | undefined;
    if (row.barcode) {
      item = byBarcode.get(row.barcode) ?? byItemCode.get(row.barcode.toLowerCase());
    }
    if (!item && row.name) {
      item = byName.get(row.name.toLowerCase());
    }

    if (item) {
      if (item.isComposite) {
        skipped.push({
          rowNo: row.rowNo,
          label: item.name,
          reason: 'composite item — its stock is built from components',
        });
        continue;
      }
      if (!item.tracksStock) {
        skipped.push({
          rowNo: row.rowNo,
          label: item.name,
          reason: 'not a physical item — it has no stock to receive',
        });
        continue;
      }
      const entry = matched.get(item.id) ?? { item, qty: 0, cost: '', price: '' };
      entry.qty += qty;
      if (row.cost !== '') entry.cost = row.cost;
      if (row.price !== '') entry.price = row.price;
      matched.set(item.id, entry);
    } else {
      if (!row.name) {
        skipped.push({
          rowNo: row.rowNo,
          label,
          reason: 'unknown barcode with no name — nothing to create',
        });
        continue;
      }
      const key = row.name.toLowerCase();
      const entry =
        newItems.get(key) ??
        { name: row.name, barcode: row.barcode || undefined, qty: 0, cost: '', price: '' };
      entry.qty += qty;
      if (row.cost !== '') entry.cost = row.cost;
      if (row.price !== '') entry.price = row.price;
      if (row.barcode) entry.barcode = row.barcode;
      newItems.set(key, entry);
    }
  }

  for (const entry of matched.values()) {
    if (entry.cost === '') entry.cost = String(entry.item.costPrice);
    if (entry.price === '') entry.price = String(entry.item.sellingPrice);
  }

  return {
    matched: [...matched.values()],
    newItems: [...newItems.values()],
    skipped,
  };
};
