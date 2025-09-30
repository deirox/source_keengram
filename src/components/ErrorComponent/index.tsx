import { InfinitySpin } from "react-loader-spinner";
import styles from "./ErrorComponent.module.css";
import { FC } from "react";

interface IFCErrorComponent {
  text?: string
}

const ErrorComponent: FC<IFCErrorComponent> = ({ text = 'Произошла ошибка!' }) => {
  return (
    <div className={styles.error__root}>
      {/*className={styles.error__icon}*/}
      <InfinitySpin color="#fff" />
      <p className={styles.error__text}>{text}</p>
    </div>
  );
};

export default ErrorComponent;
