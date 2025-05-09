import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { HiHome, HiOutlineHome } from "react-icons/hi";
import {
  MdAddBox,
  MdOutlineAddBox,
  MdMusicNote,
  MdOutlineMusicNote,
} from "react-icons/md";

import MetaNavigationItem from "../MetaNavigationItem";
import styles from "./MetaNavigationItems.module.css";
import { useUserStore } from "@/shared/store/useUserStore";
import { useModalStore } from "@/shared/store/useModalStore";
import CreatePostModal from "../../CreatePostModal";

const MetaNavigationItems = () => {
  const user = useUserStore((state) => state.authorizedUserData);
  const navigate = useNavigate();
  const [itemActive, setItemActive] = useState(1);
  const imgProps = user
    ? { src: user.avatar.url, alt: `${user.nickname} avatar` }
    : { src: "", alt: "" };

  const isCreatePostModalOpen = useModalStore(
    (state) => state.isCreatePostModalOpen,
  );

  const setIsCreatePostModalOpen = useModalStore(
    (state) => state.setIsCreatePostModalOpen,
  );

  const location = useLocation();
  const params = useParams();
  // console.log("location: ", location);
  // console.log("params: ", params);

  useEffect(() => {
    switch (location.pathname) {
      case `/${params.userNickname}`:
        setItemActive(8);
        break;
      default:
        setItemActive(1);
    }
  }, []);

  const metaNavItems = [
    {
      itemId: 1,
      icon: <HiOutlineHome />,
      activeIcon: <HiHome />,
      btnProps: {
        children: "Гланая",
      },
      itemProps: {
        onClick: () => {
          navigate("/");
          setItemActive(1);
        },
      },
    },
    {
      itemId: 2,
      icon: <MdOutlineMusicNote />,
      activeIcon: <MdMusicNote />,
      btnProps: {
        children: "Музыка",
      },
      itemProps: {
        onClick: () => {
          navigate("/audios");
        },
      },
    },
    {
      itemId: 7,
      icon: <MdOutlineAddBox />,
      activeIcon: <MdAddBox />,
      btnProps: {
        children: "Создать",
      },
      itemProps: {
        onClick: () => {
          setIsCreatePostModalOpen(true);
        },
      },
    },
    {
      itemId: 8,
      imgProps: imgProps,
      btnProps: {
        children: "Профиль",
      },
      itemProps: {
        onClick: () => {
          if (user) {
            navigate(user.nickname);
            setItemActive(8);
          }
        },
      },
    },
  ];
  return (
    <nav className={styles.navigation__items}>
      {metaNavItems.map((metaNavItem, index) => {
        return (
          <MetaNavigationItem
            {...metaNavItem}
            key={index}
            itemKey={metaNavItem.itemId}
            activeItemKey={itemActive}
          />
        );
      })}
      {isCreatePostModalOpen && <CreatePostModal />}
    </nav>
  );
};

export default MetaNavigationItems;
