export interface Item {
  id: string;
  name: string;
  description?: string;
  itemCode: string;
  barcode?: string;
  costPrice: number;
  sellingPrice: number;
  utangMarkup: number | null;
  stock: number;
  lowStockThreshold: number;
  isLowStock: boolean;
  isActive: boolean;
  isComposite: boolean;
  tracksStock: boolean;
  categoryId: string;
  categoryName: string;
  createdAt: string;
}

export interface ItemComponent {
  componentItemId: string;
  componentItemName: string;
  quantity: number;
  componentCostPrice: number;
  lineCost: number;
}

export interface ItemComponents {
  parentItemId: string;
  parentItemName: string;
  isComposite: boolean;
  totalComponentCost: number;
  components: ItemComponent[];
}

export interface SearchItem {
  id: string;
  name: string;
  barcode?: string;
  itemCode: string;
  stock: number;
  costPrice: number;
  sellingPrice: number;
  isActive: boolean;
  isComposite: boolean;
  tracksStock: boolean;
  categoryName: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  itemCount: number;
}

export interface LoginResult {
  token: string | null;
  name: string | null;
  username: string | null;
  role: string | null;
  passwordSetupRequired: boolean;
}

export interface Cashier {
  id: string;
  name: string;
  username: string;
  email: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface CashierList {
  cashiers: Cashier[];
  activeCount: number;
}

export interface StoreSettings {
  storeName: string;
  address: string;
  receiptFooter: string;
  acceptUtang: boolean;
  defaultUtangMarkup: number;
  trackEWalletFloat: boolean;
  eWalletFeeItemId: string | null;
}

export interface DaySummary {
  id: string;
  number: number;
  isClosed: boolean;
  closedLate: boolean;
  openedAt: string;
  closedAt: string | null;
  netSales: number | null;
  countedCash: number | null;
  cashVariance: number | null;
  shiftCount: number;
}

export interface Paged<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface StockLevel {
  itemId: string;
  itemName: string;
  categoryName: string;
  stock: number;
  lowStockThreshold: number;
  isLowStock: boolean;
  costPrice: number;
  sellingPrice: number;
  stockValue: number;
}

export interface InventoryHistoryItem {
  id: string;
  itemId: string;
  itemName: string;
  categoryName: string;
  movementType: string;
  quantity: number;
  costPerUnit?: number;
  totalCost?: number;
  supplierName?: string;
  reason?: string;
  notes?: string;
  createdAt: string;
}

export interface InventoryValuationItem {
  itemId: string;
  itemName: string;
  categoryName: string;
  stock: number;
  costPrice: number;
  stockValue: number;
}

export interface InventoryValuation {
  items: InventoryValuationItem[];
  totalValue: number;
  totalItems: number;
  generatedAt: string;
}

export interface LowStockItem {
  itemId: string;
  itemName: string;
  categoryName: string;
  stock: number;
  lowStockThreshold: number;
  deficit: number;
}

export interface InventoryCountLine {
  itemId: string;
  itemName: string;
  categoryName: string;
  expectedQty: number;
  actualQty: number | null;
}

export interface InventoryCount {
  id: string;
  reference: string;
  notes?: string;
  status: 'Draft' | 'Completed';
  createdAt: string;
  completedAt?: string;
  lines: InventoryCountLine[];
}

export interface InventoryCountSummary {
  id: string;
  reference: string;
  status: 'Draft' | 'Completed';
  createdAt: string;
  completedAt?: string;
  lineCount: number;
}

export type AdjustmentReason =
  | 'Damage'
  | 'Loss'
  | 'Spoilage'
  | 'Correction'
  | 'Other';

export type StockMovementType =
  | 'AddStock'
  | 'Sale'
  | 'Adjustment'
  | 'InventoryCount'
  | 'Return';

export interface SalesReportDaily {
  date: string;
  grossSales: number;
  discounts: number;
  refunds: number;
  netSales: number;
  transactionCount: number;
}

export interface SalesReport {
  grossSales: number;
  totalDiscounts: number;
  totalRefunds: number;
  netSales: number;
  transactionCount: number;
  dailyBreakdown: SalesReportDaily[];
  from?: string | null;
  to?: string | null;
}

export interface ExpensePurchase {
  date: string;
  itemName: string;
  quantity: number;
  costPerUnit: number;
  totalCost: number;
  supplierName?: string;
}

export interface ExpenseReport {
  costOfPurchases: number;
  inventoryLoss: number;
  totalExpenses: number;
  breakdown: { category: string; amount: number }[];
  purchases: ExpensePurchase[];
  from?: string | null;
  to?: string | null;
}

export interface ProfitDetail {
  itemId: string;
  itemName: string;
  categoryName: string;
  quantitySold: number;
  revenue: number;
  cost: number;
  profit: number;
  marginPercent: number;
}

export interface ProfitReport {
  netSales: number;
  costOfGoodsSold: number;
  grossProfit: number;
  inventoryLoss: number;
  netProfit: number;
  grossMarginPercent: number;
  details: ProfitDetail[];
  from?: string | null;
  to?: string | null;
}

export interface BestSeller {
  itemId: string;
  itemName: string;
  quantitySold: number;
  revenue: number;
  profit: number;
  marginPercent: number;
}

export interface DashboardTodayKpi {
  paidSales: number;
  transactionCount: number;
  averageSale: number;
  yesterdayPaidSales: number;
  deltaPercent: number | null;
}

export interface StockHealth {
  totalItems: number;
  inStock: number;
  lowStock: number;
  outOfStock: number;
}

export interface TopUtangRow {
  sukiId: string;
  name: string;
  balance: number;
  chargeCount: number;
  oldestDays: number;
}

export interface UtangSnapshot {
  totalOutstanding: number;
  sukiCount: number;
  collectedThisWeek: number;
  top: TopUtangRow[];
}

export interface PaymentSplitRow {
  method: string;
  amount: number;
  transactionCount: number;
}

export interface RunningOutRow {
  itemId: string;
  name: string;
  stock: number;
  lowStockThreshold: number;
}

export interface DashboardSummary {
  today: DashboardTodayKpi;
  stockHealth: StockHealth;
  utang: UtangSnapshot;
  paymentsToday: PaymentSplitRow[];
  runningOut: RunningOutRow[];
}

export type TrendPeriod = 'day' | 'week' | 'month' | 'year';

export interface SalesTrendBucket {
  bucketStart: string;
  paidSales: number;
  utangCharged: number;
}

export interface SalesTrend {
  period: TrendPeriod;
  buckets: SalesTrendBucket[];
  totalPaidSales: number;
  totalUtangCharged: number;
}
export interface Suki {
  id: string;
  name: string;
  phone: string | null;
  balance: number;
}

export interface UtangLedgerEntry {
  id: string;
  type: 'Charge' | 'Payment';
  amount: number;
  markup: number;
  transactionId: string | null;
  receiptNumber: string | null;
  note: string | null;
  isVoided: boolean;
  editedFrom: number | null;
  createdAt: string;
}

export interface SukiLedger {
  id: string;
  name: string;
  phone: string | null;
  balance: number;
  markupEarned: number;
  entries: UtangLedgerEntry[];
}

export interface UtangSummary {
  totalCharged: number;
  totalPaid: number;
  topSukiName: string | null;
  topSukiCharged: number;
}
