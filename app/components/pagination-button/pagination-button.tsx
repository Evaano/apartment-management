import { Button } from "@mantine/core";

interface PaginationButtonProps {
  label: React.ReactNode;
  onClick: () => void;
  disabled: boolean;
  active?: boolean;
}

export const PaginationButton = ({
  label,
  onClick,
  disabled,
}: PaginationButtonProps) => (
  <Button
    onClick={onClick}
    disabled={disabled}
    variant="light"
    className="mx-1 px-3 py-1 text-black"
  >
    {label}
  </Button>
);
