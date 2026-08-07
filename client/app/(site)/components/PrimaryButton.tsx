interface PrimaryButtonProps {
  className?: string;
  text?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}

export default function PrimaryButton({
  className = "",
  text = "Button Text",
  onClick,
  disabled = false
}: PrimaryButtonProps) {
  return (
    <button
      className={`${className} group `}
      onClick={onClick}
      disabled={disabled}
    >
      <span className="font-poppins font-medium leading-[20px] text-nowrap whitespace-pre text-inherit group-hover:text-inherit">
        {text}
      </span>
    </button>
  );
}

