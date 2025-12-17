import React, { useEffect, useRef } from "react";

const MenuPopup: React.FC<{ children: React.ReactNode; onClose: () => void,className:string }> = ({
  children,
  onClose,
  className ="absolute right-16 mt-2 w-36 bg-white border border-secondary rounded-md shadow-lg z-20"
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  return (
    <div
      ref={ref}
      className={className}
    >
      {children}
    </div>
  );
};

export default MenuPopup;
