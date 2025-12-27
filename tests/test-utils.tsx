import { render, RenderOptions } from '@testing-library/react';
import { ReactElement, ReactNode } from 'react';

/**
 * 自訂 render 函式，包裝所有必要的 Provider
 *
 * @param ui - 要渲染的 React 元件
 * @param options - 渲染選項
 * @returns 渲染結果
 */
function customRender(ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>): ReturnType<typeof render> {
  // 未來可以在這裡加入 Provider，例如 TanStack Query Provider
  const AllTheProviders = ({ children }: { children: ReactNode }): ReactElement => {
    return <>{children}</>;
  };

  return render(ui, { wrapper: AllTheProviders, ...options });
}

export * from '@testing-library/react';
export { customRender as render };

