import { InfinitySpin } from "react-loader-spinner";
import styles from "./ErrorComponent.module.css";

const ErrorComponent = () => {
  return (
    <div className={styles.error__root}>
      {/*className={styles.error__icon}*/}
      <InfinitySpin color="#fff" />
      <p className={styles.error__text}>Произошла ошибка!</p>
    </div>
  );
};

export default ErrorComponent;
