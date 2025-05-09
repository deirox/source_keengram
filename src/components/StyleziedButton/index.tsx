import cn from "classnames";

import styles from "./StyleziedButton.module.css";
import { ButtonHTMLAttributes, FC } from "react";

// type TTypesStyleziedButton = "button" | "submit" | "reset";
//
//

interface IFCStyleziedButton extends ButtonHTMLAttributes<HTMLButtonElement> {
  classname?: string;
  primary?: boolean;
}

const StyleziedButton: FC<IFCStyleziedButton> = ({
  classname = "",
  primary = false,
  onClick = () => {},
  children = "",
  disabled = false,
  type = "button",
}) => {
  return (
    <button
      className={cn(
        styles.styleziedButton,
        primary && styles.styleziedButton___primary,
        classname,
      )}
      onClick={onClick}
      disabled={disabled}
      type={type}
    >
      {children}
    </button>
  );
};

export default StyleziedButton;
