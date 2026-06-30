import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Dashboard } from '@/pages/Dashboard';
import { RunHistory } from '@/pages/RunHistory';
import { ReportViewer } from '@/pages/ReportViewer';

function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-dark-50">Settings</h1>
        <p className="text-sm text-dark-400 mt-1">Configure pipeline settings</p>
      </div>
      <div className="card p-8 text-center text-dark-500">
        <p className="text-sm">Settings page — coming soon</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/runs" element={<RunHistory />} />
          <Route path="/report" element={<ReportViewer />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
