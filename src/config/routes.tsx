import React, { lazy, Suspense } from 'react';
import { createHashRouter, Navigate } from 'react-router-dom';
import { Spin } from 'antd';
import AppLayout from '../components/layout/AppLayout';

// Lazy-loaded pages
const DashboardPage = lazy(() => import('../pages/DashboardPage'));
const AlertPage = lazy(() => import('../pages/AlertPage'));
const WorkerPage = lazy(() => import('../pages/WorkerPage'));
const SettingsPage = lazy(() => import('../pages/SettingsPage'));

// Loading fallback
const PageLoading = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: 300 }}>
    <Spin size="large" tip="加载中..." />
  </div>
);

// Wrap lazy component with Suspense
const withSuspense = (Component: React.LazyExoticComponent<React.FC>) => (
  <Suspense fallback={<PageLoading />}>
    <Component />
  </Suspense>
);

export const router = createHashRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: withSuspense(DashboardPage),
      },
      {
        path: 'alerts',
        element: withSuspense(AlertPage),
      },
      {
        path: 'workers',
        element: withSuspense(WorkerPage),
      },
      {
        path: 'settings',
        element: withSuspense(SettingsPage),
      },
    ],
  },
]);

export default router;
