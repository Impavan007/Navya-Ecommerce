interface PrimaryButtonLightProps {
  className?: string;
  textClassName?: string;
  text?: string;
  onClick?: () => void;
  disabled?: boolean;
}

export default function PrimaryButtonLight({
  className = "",
  textClassName = "font-poppins font-medium leading-[20px] text-nowrap whitespace-pre text-[#ffffff]",
  text = "Button Text",
  onClick,
  disabled = false
}: PrimaryButtonLightProps) {
  return (
    <button
      className={`${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      <span className={textClassName}>
        {text}
      </span>
    </button>
  );
}

