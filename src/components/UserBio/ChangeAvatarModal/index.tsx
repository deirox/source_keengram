import { BaseSyntheticEvent, FC, useEffect, useRef } from "react";
import { useFirebaseStore } from "@/shared/store/useFirebaseStore";
import { useUserStore } from "@/shared/store/useUserStore";
import ModalBody from "@/components/ModalBody";
import styles from "./ChangeAvatarModal.module.css";

interface IFCChangeAvatarModal {
  isModalOpen: boolean;
  onOpen?: () => void;
  onClose: () => void;
}

const ChangeAvatarModal: FC<IFCChangeAvatarModal> = ({
  isModalOpen,
  onClose,
}) => {
  const uploadImages = useFirebaseStore((state) => state.uploadImages);
  const uploadedImages = useFirebaseStore((state) => state.uploadedImages);
  const authorizedUserData = useUserStore((state) => state.authorizedUserData);
  const setAvatar = useUserStore((state) => state.setAvatar);

  const filePicker = useRef<null | HTMLInputElement>(null);
  const handleClick = () => {
    if (filePicker.current !== null) {
      filePicker.current.click();
    }
  };

  useEffect(() => {
    if (uploadedImages.length > 0) {
      if (authorizedUserData) {
        setAvatar(authorizedUserData.uid, uploadedImages[0].url);
      }
    }
  }, [uploadedImages, authorizedUserData, setAvatar]);

  const inputOnChange = async (e: BaseSyntheticEvent) => {
    const files = Array.from(e.target.files);
    await uploadImages(files, files.length);
  };
  const onDeleteAvatar = () => {
    if (authorizedUserData) {
      setAvatar(authorizedUserData.uid, "img/EmptyAvatar.jpg");
      onClose();
    }
  };
  return (
    <ModalBody
      isModalOpen={isModalOpen}
      onClose={onClose}
      modalClassname={styles.change_avatar_modal}
    >
      <div className={styles.change_avatar_modal__box}>
        <div className={styles.change_avatar_modal__title}>
          Изменить фото профиля
        </div>
        <input
          className={styles.change_avatar_modal__input}
          type="file"
          accept=".png, .jpg, .jpeg, .gif"
          ref={filePicker}
          onChange={inputOnChange}
        />
        <button
          className={`${styles.change_avatar_modal__button} ${styles.change_avatar_modal__button___add}`}
          onClick={handleClick}
        >
          Загрузить фото
        </button>
        <button
          className={`${styles.change_avatar_modal__button} ${styles.change_avatar_modal__button___delete}`}
          onClick={onDeleteAvatar}
        >
          Удалить текущее фото
        </button>
        <button
          className={styles.change_avatar_modal__button}
          onClick={onClose}
        >
          Отмена
        </button>
      </div>
    </ModalBody>
  );
};

export default ChangeAvatarModal;
