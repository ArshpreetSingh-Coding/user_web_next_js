import React, { memo, type ReactNode } from "react";

// Update interface
interface TimelineRowProps {
  icon: ReactNode;
  iconSize?: "large" | "small";
  showConnectorAbove?: boolean;
  showConnectorBelow?: boolean;
  children: ReactNode;
  variant?: "outline" | "filled";
  onIconClick?: () => void;
}

const TimelineRow = memo(({
  icon,
  iconSize = "large",
  showConnectorAbove = false,
  showConnectorBelow = true,
  children,
  variant,
  onIconClick,
}: TimelineRowProps) => {
const items = React.Children.toArray(children);
  const label = items.length > 1 ? items[0] : null;
  const content = items.length > 1 ? items.slice(1) : items;


  return (
    <div className="grid grid-cols-[40px_1fr] gap-x-3 lg:grid-cols-[56px_1fr]">
    {/* ICON RAIL */}
      <div className="flex flex-col items-center mt-1 lg:mt-7">
      {showConnectorAbove ? (
        <div className="w-0.5 flex-1 bg-primary-foreground/30" />
      ) : (
        <div className="flex-1" />
      )}

      <div
        onClick={onIconClick}
        className={`
          ${iconSize === "large"
            ? "w-7 h-7 lg:w-10 lg:h-10"
            : "w-7 h-7 lg:w-8 lg:h-8"}
          rounded-full bg-white flex items-center justify-center z-10
          ${variant === "outline" ? "border border-border" : ""}
          ${onIconClick ? "cursor-pointer hover:scale-110 transition-transform" : ""}
        `}
      >
        {icon}
      </div>

      {showConnectorBelow ? (
        <div className="w-0.5 flex-1 bg-primary-foreground/30 " />
      ) : (
        <div className="flex-1" />
      )}
      </div>

      {/* CONTENT COLUMN */}
      <div className="flex flex-col">
      {/* Label (does NOT affect alignment) */}
      {label && (
        <div className="mb-1 text-sm font-medium text-white">
          {label} 
        </div>
      )}

      {/* Input aligned with icon */}
      <div className="flex items-center min-h-[40px] lg:min-h-[48px]">
        <div className="w-full">
          {content}
        </div>
      </div>
      </div>
      </div>
  );
});

TimelineRow.displayName = "TimelineRow";

export default TimelineRow;
