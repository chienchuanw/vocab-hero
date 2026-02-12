/**
 * @vitest-environment happy-dom
 */

import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/tests/test-utils';
import userEvent from '@testing-library/user-event';
import { VocabularyFilterBar } from './VocabularyFilterBar';
import type { VocabularyQueryParams } from '@/hooks/useVocabulary';

describe('VocabularyFilterBar', () => {
  const defaultFilters: VocabularyQueryParams = {};
  const mockOnFiltersChange = vi.fn();
  const mockGroups = [
    { id: 'g1', name: 'JLPT N5' },
    { id: 'g2', name: 'JLPT N4' },
  ];

  it('should render search input', () => {
    render(
      <VocabularyFilterBar filters={defaultFilters} onFiltersChange={mockOnFiltersChange} />
    );
    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
  });

  it('should render sort select', () => {
    render(
      <VocabularyFilterBar filters={defaultFilters} onFiltersChange={mockOnFiltersChange} />
    );
    // Sort by trigger should be visible
    expect(screen.getByTestId('sort-select')).toBeInTheDocument();
  });

  it('should render filter button with popover trigger', () => {
    render(
      <VocabularyFilterBar filters={defaultFilters} onFiltersChange={mockOnFiltersChange} groups={mockGroups} />
    );
    expect(screen.getByTestId('filter-popover-trigger')).toBeInTheDocument();
  });

  it('should show active filter count badge when filters are active', () => {
    const activeFilters: VocabularyQueryParams = {
      masteryLevel: 'NEW' as VocabularyQueryParams['masteryLevel'],
      groupId: 'g1',
    };
    render(
      <VocabularyFilterBar filters={activeFilters} onFiltersChange={mockOnFiltersChange} groups={mockGroups} />
    );
    expect(screen.getByTestId('filter-count-badge')).toBeInTheDocument();
    expect(screen.getByTestId('filter-count-badge')).toHaveTextContent('2');
  });

  it('should not show badge when no advanced filters active', () => {
    render(
      <VocabularyFilterBar filters={{ search: 'test' }} onFiltersChange={mockOnFiltersChange} groups={mockGroups} />
    );
    expect(screen.queryByTestId('filter-count-badge')).not.toBeInTheDocument();
  });

  it('should call onFiltersChange when search input changes', async () => {
    const user = userEvent.setup();
    render(
      <VocabularyFilterBar filters={defaultFilters} onFiltersChange={mockOnFiltersChange} />
    );
    const searchInput = screen.getByPlaceholderText(/search/i);
    await user.type(searchInput, 'hello');
    expect(mockOnFiltersChange).toHaveBeenCalled();
  });
});
