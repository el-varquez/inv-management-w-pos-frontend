import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { LoginScreen } from './features/auth/screens/LoginScreen';
import { DashboardScreen } from './features/dashboard/screens/DashboardScreen';
import { ItemsScreen } from './features/items/screens/ItemsScreen';
import { CategoriesScreen } from './features/items/screens/CategoriesScreen';
import { StockLevelsScreen } from './features/inventory/screens/StockLevelsScreen';
import { ReceiveStockScreen } from './features/inventory/screens/ReceiveStockScreen';
import { LowStockScreen } from './features/inventory/screens/LowStockScreen';
import { InventoryCountScreen } from './features/inventory/screens/InventoryCountScreen';
import { InventoryHistoryScreen } from './features/inventory/screens/InventoryHistoryScreen';
import { InventoryValuationScreen } from './features/inventory/screens/InventoryValuationScreen';
import { CashiersScreen } from './features/cashiers/screens/CashiersScreen';
import { SalesReportScreen } from './features/reports/screens/SalesReportScreen';
import { ExpenseReportScreen } from './features/reports/screens/ExpenseReportScreen';
import { ProfitReportScreen } from './features/reports/screens/ProfitReportScreen';
import { BestSellersScreen } from './features/reports/screens/BestSellersScreen';
import { SettingsScreen } from './features/settings/screens/SettingsScreen';
import { UtangScreen } from './features/utang/screens/UtangScreen';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginScreen />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<DashboardScreen />} />
            <Route path="/items" element={<ItemsScreen />} />
            <Route path="/items/categories" element={<CategoriesScreen />} />
            <Route
              path="/inventory"
              element={<Navigate to="/inventory/stock-levels" replace />}
            />
            <Route
              path="/inventory/stock-levels"
              element={<StockLevelsScreen />}
            />
            <Route path="/inventory/receive" element={<ReceiveStockScreen />} />
            <Route path="/inventory/low-stock" element={<LowStockScreen />} />
            <Route path="/inventory/count" element={<InventoryCountScreen />} />
            <Route
              path="/inventory/history"
              element={<InventoryHistoryScreen />}
            />
            <Route
              path="/inventory/valuation"
              element={<InventoryValuationScreen />}
            />
            <Route
              path="/reports"
              element={<Navigate to="/reports/sales" replace />}
            />
            <Route path="/reports/sales" element={<SalesReportScreen />} />
            <Route path="/reports/expenses" element={<ExpenseReportScreen />} />
            <Route path="/reports/profit" element={<ProfitReportScreen />} />
            <Route
              path="/reports/best-sellers"
              element={<BestSellersScreen />}
            />
            <Route path="/utang" element={<UtangScreen />} />
            <Route path="/cashiers" element={<CashiersScreen />} />
            <Route path="/settings" element={<SettingsScreen />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
