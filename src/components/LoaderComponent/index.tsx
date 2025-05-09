import styles from "./LoaderComponent.module.css";

type TLoaderStyle = "mini" | "standart";

const LoaderComponent = ({
  text = "Идёт загрузка...",
  style = "standart",
}: {
  text?: string;
  style?: TLoaderStyle;
}) => {
  return (
    <>
      {style === "standart" && (
        <div className={styles.loader__root}>
          <img
            className={styles.loader__icon}
            src="/keengram/img/keengram.svg"
            alt="loader"
          />
          <p className={styles.loader__text}>{text}</p>
        </div>
      )}
      {style === "mini" && (
        <div>
          <img
            className={styles.loader__icon_mini}
            src="/keengram/img/keengram.svg"
            alt="loader"
          />
        </div>
      )}
    </>
  );
};

export default LoaderComponent;
