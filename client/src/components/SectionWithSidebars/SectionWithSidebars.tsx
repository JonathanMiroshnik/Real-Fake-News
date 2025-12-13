import { ReactNode } from 'react';

interface SectionWithSidebarsProps {
  /** Main content to be constrained to a percentage width */
  children: ReactNode;
  /** Left sidebar content */
  left?: ReactNode;
  /** Right sidebar content */
  right?: ReactNode;
  /** Width percentage for the main content (0-100), default 100 */
  mainWidthPercent?: number;
  /** Gap between sections in pixels, default 16 */
  gap?: number;
}

/**
 * Flexible layout wrapper that allows constraining main content to a percentage width
 * and placing content on the left and right sides.
 * 
 * The main content (children) will be constrained to the specified percentage,
 * and left/right content will fill the remaining space equally.
 * 
 * Example:
 * <SectionWithSidebars mainWidthPercent={70} left={<Ad />} right={<Ad />}>
 *   <SectionHeader ... />
 *   <ArticleList ... />
 * </SectionWithSidebars>
 */
function SectionWithSidebars({
  children,
  left,
  right,
  mainWidthPercent = 100,
  gap = 16,
}: SectionWithSidebarsProps) {
  // If no sidebars, just return children in a container
  if (!left && !right) {
    return (
      <div className="w-full" style={{ maxWidth: `${mainWidthPercent}%` }}>
        {children}
      </div>
    );
  }

  // Calculate remaining space for sidebars
  const remainingPercent = 100 - mainWidthPercent;
  const sidebarWidthPercent = remainingPercent / (left && right ? 2 : 1);

  return (
    <div className="w-full flex" style={{ gap: `${gap}px` }}>
      {/* Left sidebar */}
      {left && (
        <div
          className="shrink-0"
          style={{ width: `${sidebarWidthPercent}%`, minWidth: 0 }}
        >
          {left}
        </div>
      )}

      {/* Main content - constrained to percentage width */}
      <div
        className="shrink-0"
        style={{
          width: `${mainWidthPercent}%`,
          minWidth: 0,
          overflow: 'hidden', // Prevent children from overflowing
        }}
      >
        {children}
      </div>

      {/* Right sidebar */}
      {right && (
        <div
          className="shrink-0"
          style={{ width: `${sidebarWidthPercent}%`, minWidth: 0 }}
        >
          {right}
        </div>
      )}
    </div>
  );
}

export default SectionWithSidebars;

