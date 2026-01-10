import { render, RenderOptions } from '@testing-library/react';
import { ReactElement, ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

/**
 * 自訂 render 函式，包裝所有必要的 Provider
 *
 * @param ui - 要渲染的 React 元件
 * @param options - 渲染選項
 * @returns 渲染結果
 */
function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
): ReturnType<typeof render> {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const AllTheProviders = ({ children }: { children: ReactNode }): ReactElement => {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };

  return render(ui, { wrapper: AllTheProviders, ...options });
}

export * from '@testing-library/react';
export { customRender as render };
