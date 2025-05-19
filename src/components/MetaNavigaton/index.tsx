import styles from "./MetaNavigation.module.css";
import MetaNavigationItems from "./MetaNavigationItems";

const MetaNavigation = () => {
  return (
    <div className={styles.navigation__wrapper}>
      <picture>
        <source media="(max-width:1265px)" srcSet="img/keengram.svg" />
        <img
          className={styles.navigation__logo}
          src="img/logo.svg"
          alt="logo"
        />
      </picture>
      <div className={styles.navigation__top}>
        <MetaNavigationItems />
      </div>
    </div>
  );
};

export default MetaNavigation;
