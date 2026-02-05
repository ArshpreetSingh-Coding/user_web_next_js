"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import TimelineRow from "./TimelineRow";

interface AddStopButtonProps {
  onClick: () => void;
  mounted: boolean;
  className?: string
  variant?: "outline" | "filled";
}

const AddStopButton = memo(({ onClick, mounted, className, variant }: AddStopButtonProps) => (
  <TimelineRow
    icon={<Plus className={`w-3 h-3 sm:w-4 sm:h-4 text-primary ${variant == "outline" ? "text-black!" : ""}`} />}
    iconSize="small"
    showConnectorAbove={true}
    variant={variant}
    onIconClick={onClick}
  >
    <motion.button
      onClick={onClick}
      className="text-left text-xs lg:text-sm font-medium text-white hover:text-white/80 transition-colors flex items-center gap-2 h-9 lg:h-11 mt-5"
      whileHover={mounted ? { x: 4 } : undefined}
      transition={{ duration: 0.2 }}
      type="button"
    >
      <span className={`${variant == "outline" ? "text-black!" : ""}`}>Add Stop Over</span>
    </motion.button>
  </TimelineRow>
));

AddStopButton.displayName = "AddStopButton";

export default AddStopButton;
