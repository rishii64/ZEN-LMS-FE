import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { KpiCard, StatusBadge } from '../components/ui/Primitives.jsx';
import { DataTable } from '../components/ui/DataTable.jsx';
import { LoginPage } from '../pages/auth/AuthPages.jsx';

describe('Enterprise LMS UI Design System', () => {
  it('renders KPI card and status badge accurately', () => {
    render(
      <div>
        <KpiCard title="Active Learners" value={42} subtitle="12 departments" />
        <StatusBadge status="in_review" />
      </div>
    );
    expect(screen.getByText('Active Learners')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('in review')).toBeInTheDocument();
  });

  it('renders DataTable rows and pagination metadata', () => {
    render(
      <DataTable
        data={[{ id: '1', name: 'Security 101', status: 'published' }]}
        columns={[
          { key: 'name', label: 'Course' },
          { key: 'status', label: 'Status' }
        ]}
      />
    );
    expect(screen.getByText('Security 101')).toBeInTheDocument();
    expect(screen.getByText('1 records')).toBeInTheDocument();
  });

  it('renders LoginPage with email/phone input and demo autofill controls', () => {
    const qc = new QueryClient();
    render(
      <QueryClientProvider client={qc}>
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      </QueryClientProvider>
    );
    expect(screen.getByText('AstraLearn Enterprise LMS')).toBeInTheDocument();
    expect(screen.getByText('Super Admin')).toBeInTheDocument();

    const pwdInput = screen.getByPlaceholderText('Enter your password');
    expect(pwdInput).toHaveAttribute('type', 'password');

    const toggleBtn = screen.getByRole('button', { name: 'Show password' });
    fireEvent.click(toggleBtn);
    expect(pwdInput).toHaveAttribute('type', 'text');

    const hideBtn = screen.getByRole('button', { name: 'Hide password' });
    fireEvent.click(hideBtn);
    expect(pwdInput).toHaveAttribute('type', 'password');
  });
});
