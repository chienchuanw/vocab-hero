import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@/tests/test-utils';
import { OcrPreview, OcrPreviewItem } from './OcrPreview';

describe('OcrPreview', () => {
  const mockItems: OcrPreviewItem[] = [
    {
      id: '1',
      japanese: 'こんにちは',
      english: 'Hello',
      imageUrl: '/test-image.jpg',
    },
    {
      id: '2',
      japanese: 'さようなら',
      english: 'Goodbye',
      isProcessing: false,
    },
  ];

  const mockOnSave = vi.fn();
  const mockOnDiscard = vi.fn();
  const mockOnSaveAll = vi.fn();

  it('renders preview items with japanese and english fields', () => {
    render(
      <OcrPreview
        items={mockItems}
        onSave={mockOnSave}
        onDiscard={mockOnDiscard}
        onSaveAll={mockOnSaveAll}
      />
    );

    expect(screen.getByDisplayValue('こんにちは')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Hello')).toBeInTheDocument();
    expect(screen.getByDisplayValue('さようなら')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Goodbye')).toBeInTheDocument();
  });

  it('fields are editable', () => {
    render(
      <OcrPreview
        items={mockItems}
        onSave={mockOnSave}
        onDiscard={mockOnDiscard}
        onSaveAll={mockOnSaveAll}
      />
    );

    const japaneseInput = screen.getAllByTestId('ocr-japanese-input')[0]!;
    fireEvent.change(japaneseInput, { target: { value: 'おはよう' } });
    expect(japaneseInput).toHaveValue('おはよう');

    const englishInput = screen.getAllByTestId('ocr-english-input')[0]!;
    fireEvent.change(englishInput, { target: { value: 'Good morning' } });
    expect(englishInput).toHaveValue('Good morning');
  });

  it('save button calls onSave with edited values', () => {
    render(
      <OcrPreview
        items={mockItems}
        onSave={mockOnSave}
        onDiscard={mockOnDiscard}
        onSaveAll={mockOnSaveAll}
      />
    );

    const japaneseInput = screen.getAllByTestId('ocr-japanese-input')[0]!;
    fireEvent.change(japaneseInput, { target: { value: 'おはよう' } });

    const saveButtons = screen.getAllByTestId('ocr-save-button');
    fireEvent.click(saveButtons[0]!);

    expect(mockOnSave).toHaveBeenCalledWith({
      japanese: 'おはよう',
      english: 'Hello',
      notes: '',
    });
  });

  it('discard button calls onDiscard with item id', () => {
    render(
      <OcrPreview
        items={mockItems}
        onSave={mockOnSave}
        onDiscard={mockOnDiscard}
        onSaveAll={mockOnSaveAll}
      />
    );

    const discardButtons = screen.getAllByTestId('ocr-discard-button');
    fireEvent.click(discardButtons[0]!);

    expect(mockOnDiscard).toHaveBeenCalledWith('1');
  });

  it('shows loading skeleton when isProcessing is true', () => {
    const processingItems = [
      {
        id: '3',
        japanese: '',
        english: '',
        isProcessing: true,
      },
    ];

    render(
      <OcrPreview
        items={processingItems}
        onSave={mockOnSave}
        onDiscard={mockOnDiscard}
        onSaveAll={mockOnSaveAll}
      />
    );

    expect(screen.getByTestId('ocr-processing-skeleton')).toBeInTheDocument();
    expect(screen.queryByTestId('ocr-save-button')).not.toBeInTheDocument();
  });

  it('save all button calls onSaveAll with all items', () => {
    render(
      <OcrPreview
        items={mockItems}
        onSave={mockOnSave}
        onDiscard={mockOnDiscard}
        onSaveAll={mockOnSaveAll}
      />
    );

    // Edit first item
    const japaneseInput = screen.getAllByTestId('ocr-japanese-input')[0]!;
    fireEvent.change(japaneseInput, { target: { value: 'Edited Japanese' } });

    const saveAllButton = screen.getByTestId('ocr-save-all-button');
    fireEvent.click(saveAllButton);

    expect(mockOnSaveAll).toHaveBeenCalledWith([
      {
        japanese: 'Edited Japanese',
        english: 'Hello',
        notes: '',
      },
      {
        japanese: 'さようなら',
        english: 'Goodbye',
        notes: '',
      },
    ]);
  });

  it('renders image thumbnail when imageUrl provided', () => {
    render(
      <OcrPreview
        items={mockItems}
        onSave={mockOnSave}
        onDiscard={mockOnDiscard}
        onSaveAll={mockOnSaveAll}
      />
    );

    const images = screen.getAllByRole('img');
    const src = images[0]!.getAttribute('src');
    expect(src).toContain('test-image.jpg');
  });
});
