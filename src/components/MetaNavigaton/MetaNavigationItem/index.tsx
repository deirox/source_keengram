import { FC, ReactElement } from "react";
import cn from "classnames";
import styles from "./MetaNavigationItem.module.css";

interface IFCMetaNavigationItem {
  icon?: ReactElement;
  activeIcon?: ReactElement;
  itemKey: string | number;
  activeItemKey: boolean | number;
  itemProps?: {
    onClick: () => void;
  };
  btnProps: { children: string };
  imgProps?: { src: string; alt: string };
  badge?: number; // Количество непрочитанных сообщений
}

const MetaNavigationItem: FC<IFCMetaNavigationItem> = ({
  icon,
  activeIcon = icon,
  itemKey = false,
  activeItemKey,
  itemProps,
  btnProps,
  imgProps = { src: "", alt: "" },
  badge,
}) => {
  return (
    <div
      className={cn(
        styles.meta_navigation_item,
        imgProps?.src.length === 0 && itemKey === activeItemKey
          ? icon === activeIcon && styles.meta_navigation_item__icon___active
          : "",
      )}
      {...itemProps}
    >
      {imgProps?.src.length === 0 && (
        <div className={styles.meta_navigation_item__icon}>
          {itemKey === activeItemKey ? activeIcon : icon}
        </div>
      )}

      {imgProps?.src.length > 0 && (
        <div
          className={cn(
            styles.meta_navigation_item__icon,
            styles.meta_navigation_item__icon_img,
            itemKey === activeItemKey &&
              styles.meta_navigation_item__icon_img___active,
          )}
        >
          <img {...imgProps} />
        </div>
      )}
      
      {/* Бейдж для непрочитанных сообщений */}
      {badge && badge > 0 && (
        <div className={styles.meta_navigation_item__badge}>
          {badge > 99 ? '99+' : badge}
        </div>
      )}
      
      <button className={styles.meta_navigation_item__btn} {...btnProps} />
    </div>
  );
};

export default MetaNavigationItem;
