import React from "react";
import { Tooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";

interface TooltipWrapperProps {
  text: string;
  place?: "top" | "bottom" | "left" | "right";
  children: React.ReactNode;
}

const TooltipWrapper: React.FC<TooltipWrapperProps> = ({
  text,
  place = "top",
  children,
}) => {
  const id = React.useId(); // unique ID per instance

  return (
    <>
      <span
        data-tooltip-id={id}
        data-tooltip-content={text}
        className="inline-block"
      >
        {children}
      </span>

      <Tooltip
        id={id}
        place={place}
        className="bg-gray-800! text-white! text-xs! px-2! py-1!"
      />
    </>
  );
};

export default TooltipWrapper;
