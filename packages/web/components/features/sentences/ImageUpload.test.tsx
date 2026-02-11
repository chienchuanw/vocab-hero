import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@/tests/test-utils';
import { ImageUpload } from './ImageUpload';

// Mock URL.createObjectURL
const createObjectURLMock = vi.fn();
global.URL.createObjectURL = createObjectURLMock;

describe('ImageUpload', () => {
  const mockOnImagesSelected = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    createObjectURLMock.mockReturnValue('mock-url');
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('renders drop zone with upload instructions', () => {
    render(<ImageUpload onImagesSelected={mockOnImagesSelected} />);

    expect(screen.getByText('Upload Images')).toBeInTheDocument();
    expect(screen.getByText('Drag and drop images here, or click to select')).toBeInTheDocument();
    expect(screen.getByText(/Maximum 10 images/)).toBeInTheDocument();
  });

  it('accepts dropped image files', async () => {
    render(<ImageUpload onImagesSelected={mockOnImagesSelected} />);

    const file = new File(['dummy content'], 'test.png', { type: 'image/png' });
    const input = screen.getByTestId('image-upload-input');

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('test.png')).toBeInTheDocument();
    });
  });

  it('rejects non-image files with error message', async () => {
    render(<ImageUpload onImagesSelected={mockOnImagesSelected} />);

    const file = new File(['dummy content'], 'test.txt', { type: 'text/plain' });
    const input = screen.getByTestId('image-upload-input');

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('Only image files are accepted')).toBeInTheDocument();
    });
  });

  it('enforces max file count', async () => {
    render(<ImageUpload onImagesSelected={mockOnImagesSelected} maxFiles={2} />);

    const files = [
      new File(['1'], '1.png', { type: 'image/png' }),
      new File(['2'], '2.png', { type: 'image/png' }),
      new File(['3'], '3.png', { type: 'image/png' }),
    ];
    // Since we can't easily simulate multiple file selection on a single input in JSDOM without some tricks,
    // we'll just try to add them one by one or simulate the change event with multiple files.
    // The input.files property is read-only, but fireEvent.change handles it.

    const input = screen.getByTestId('image-upload-input');

    // Directly pass the files array
    fireEvent.change(input, { target: { files: files } });

    await waitFor(() => {
      expect(screen.getByText(/Maximum 2 files allowed/)).toBeInTheDocument();
    });
  });

  it('shows preview thumbnails after file selection', async () => {
    render(<ImageUpload onImagesSelected={mockOnImagesSelected} />);

    // Create a file with a specific size (e.g., 1024 bytes = 1 KB)
    const content = 'x'.repeat(1024);
    const file = new File([content], 'test.png', { type: 'image/png' });
    const input = screen.getByTestId('image-upload-input');

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      const preview = screen.getByTestId('image-preview');
      expect(preview).toBeInTheDocument();
      expect(preview).toHaveAttribute('src', 'mock-url');
      expect(screen.getByText('test.png')).toBeInTheDocument();
      // 1024 bytes = 1 KB
      expect(screen.getByText('1 KB')).toBeInTheDocument();
    });
  });

  it('removes individual file', async () => {
    render(<ImageUpload onImagesSelected={mockOnImagesSelected} />);

    const file = new File(['dummy content'], 'test.png', { type: 'image/png' });
    const input = screen.getByTestId('image-upload-input');

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('test.png')).toBeInTheDocument();
    });

    const removeButton = screen.getByTestId('image-remove');
    fireEvent.click(removeButton);

    await waitFor(() => {
      expect(screen.queryByText('test.png')).not.toBeInTheDocument();
    });
  });

  it('disables interactions when isProcessing is true', () => {
    render(<ImageUpload onImagesSelected={mockOnImagesSelected} isProcessing={true} />);

    const input = screen.getByTestId('image-upload-input');
    expect(input).toBeDisabled();
  });

  it('calls onImagesSelected when process button is clicked', async () => {
    render(<ImageUpload onImagesSelected={mockOnImagesSelected} />);

    const file = new File(['dummy content'], 'test.png', { type: 'image/png' });
    const input = screen.getByTestId('image-upload-input');

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('Process Images')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Process Images'));

    expect(mockOnImagesSelected).toHaveBeenCalledWith([file]);
  });
});
