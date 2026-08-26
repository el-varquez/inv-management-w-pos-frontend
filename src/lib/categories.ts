import type { Category } from '../types';

export const INVENTORY_ITEM_CATEGORY = 'Inventory Item';
export const SERVICE_CATEGORY = 'Service';

export const isInventoryItemCategory = (c: Category) =>
  c.isSystem && c.name === INVENTORY_ITEM_CATEGORY;

export const isServiceCategory = (c: Category) =>
  c.isSystem && c.name === SERVICE_CATEGORY;
