import React from 'react';

export interface DropdownProps {
  open: boolean;
  setOpen?: (open: boolean) => void;
  options: {
    key: React.Key;
    label: React.ReactNode;
    selected?: boolean;
    onClick: () => void;
  }[];
  position: 'bottom-left' | 'bottom-right' | 'top-right';
  className?: string;
}

const POSITION: Record<DropdownProps['position'], string> = {
  'bottom-left': 'right-0 top-full',
  'bottom-right': 'left-0 top-full',
  'top-right': 'left-0 bottom-full',
};

const Dropdown: React.FC<React.PropsWithChildren<DropdownProps>> = ({
  children,
  open,
  setOpen,
  options,
  position,
  className,
}) => (
  <div className={className ?? 'relative size-fit'}>
    {children}
    {open && (
      <>
        <div className="fixed inset-0 z-10" onClick={() => setOpen?.(false)} />
        <div
          className={`flex flex-col absolute ${POSITION[position]} z-20 mt-1 size-fit rounded-lg border border-accent-b-2 bg-white shadow-lg`}
        >
          {options.map(option => (
            <button
              key={option.key}
              onMouseDown={e => {
                e.preventDefault();
              }}
              onClick={() => {
                option.onClick();
                setOpen?.(false);
              }}
              className={`min-w-32 w-full size-fit px-3 py-2 text-left text-sm-chat whitespace-nowrap first:rounded-t-lg last:rounded-b-lg hover:bg-accent-b ${
                option.selected
                  ? 'bg-primary-light-3 text-primary'
                  : 'text-accent-b-0'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </>
    )}
  </div>
);

export default Dropdown;
