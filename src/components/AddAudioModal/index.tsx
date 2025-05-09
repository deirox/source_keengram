import { useFirebaseStore } from "@/shared/store/useFirebaseStore";
import { useUserStore } from "@/shared/store/useUserStore";
import React, { FC, useEffect, useRef, useState } from "react";
import ModalBody from "../ModalBody";
import styles from "./AddAudioModal.module.css";
import LoaderComponent from "../LoaderComponent";
import { useMusicStore } from "@/shared/store/useMusicStore";

// @ts-ignore
const jsmediatags = window.jsmediatags;

interface IFCAddAudioModal {
  isModalOpen: boolean;
  onOpen?: () => void;
  onClose: () => void;
}

const AddAudioModal: FC<IFCAddAudioModal> = ({
  isModalOpen = false,
  onClose = () => {},
}) => {
  // const uploadImages = useFirebaseStore((state) => state.uploadImages);
  const uploadedImages = useFirebaseStore((state) => state.uploadedImages);
  const authorizedUserData = useUserStore((state) => state.authorizedUserData);
  const setAvatar = useUserStore((state) => state.setAvatar);
  const [addAudioStepArrayIndex, setAddAudioStepArrayIndex] = useState(0);
  const [audioData, setAudioData] = useState({
    artist: "",
    title: "",
    img_url: "/keengram/img/NoMusicImg.png",
  });
  const [audioByteArray, setAudioByteArray] = useState(null);
  const uploadAudio = useMusicStore((state) => state.uploadAudio);
  const isAudioUploading = useMusicStore((state) => state.isAudioUploading);
  const isAudioUploadingError = useMusicStore(
    (state) => state.isAudioUploadingError,
  );

  type TAddAudioStepArray =
    | "LOAD_AUDIO_PAGE"
    | "EDIT_INFO_PAGE"
    | "UPLOADING_PAGE"
    | "SUCCESS_PAGE"
    | "ERROR_PAGE";
  const addAudioStepArray: TAddAudioStepArray[] = [
    "LOAD_AUDIO_PAGE",
    "EDIT_INFO_PAGE",
    "UPLOADING_PAGE",
    "SUCCESS_PAGE",
    "ERROR_PAGE",
  ];

  const filePicker: React.RefObject<HTMLInputElement | null> = useRef(null);

  useEffect(() => {
    setAddAudioStepArrayIndex(0);
  }, [isModalOpen]);

  useEffect(() => {
    if (uploadedImages.length > 0 && authorizedUserData) {
      setAvatar(authorizedUserData.uid, uploadedImages[0].url);
    }
  }, [uploadedImages]);

  const onUploadButton = () => {
    if (filePicker.current) {
      filePicker.current.click();
    }
    // setAddAudioStepArrayIndex(addAudioStepArrayIndex => addAudioStepArrayIndex + 1)
  };
  const inputOnChange = async (e: React.BaseSyntheticEvent) => {
    // const files = Array.from(e.target.files);
    // await uploadImages(files, files.length);
    const reader = new FileReader();
    const file = e.target.files[0];
    reader.onloadend = function (e: ProgressEvent<FileReader>) {
      // console.log(e.target?.result);
      // @ts-ignore
      setAudioByteArray(e.target?.result);
    };
    reader.onerror = function (e: ProgressEvent<FileReader>) {
      console.error(e.target?.error);
    };
    reader.readAsArrayBuffer(file);

    jsmediatags.read(file, {
      onSuccess: function (tag: any) {
        let fileTags = tag.tags;
        setAudioData({
          artist: fileTags.artist,
          title: fileTags.title,
          img_url: "/keengram/img/NoMusicImg.png",
        });
        setAddAudioStepArrayIndex(
          (addAudioStepArrayIndex) => addAudioStepArrayIndex + 1,
        );
        // tag.tags.artist
        // tag.tags.title
      },
      onError: function (error: any) {
        console.error(error);
      },
    });
  };

  const onNextButton = async () => {
    if (audioByteArray !== null) {
      setAddAudioStepArrayIndex(
        (addAudioStepArrayIndex) => addAudioStepArrayIndex + 1,
      );
      await uploadAudio(audioByteArray, audioData);
    }
  };
  if (addAudioStepArray[addAudioStepArrayIndex] === "UPLOADING_PAGE") {
    if (!isAudioUploading) {
      setAddAudioStepArrayIndex(
        (addAudioStepArrayIndex) => addAudioStepArrayIndex + 1,
      );
    }
  }
  return (
    <ModalBody
      isModalOpen={isModalOpen}
      onClose={onClose}
      modalClassname={styles.change_avatar_modal}
    >
      {addAudioStepArray[addAudioStepArrayIndex] === "LOAD_AUDIO_PAGE" && (
        <div className={styles.change_avatar_modal__box}>
          <div className={styles.change_avatar_modal__title}>
            Выберите аудиозапись на вашем компьютере
          </div>
          <input
            className={styles.change_avatar_modal__input}
            type="file"
            accept="audio/mpeg"
            ref={filePicker}
            onChange={inputOnChange}
          />
          <button
            className={`${styles.change_avatar_modal__button} ${styles.change_avatar_modal__button___add}`}
            onClick={onUploadButton}
          >
            Загрузить aудиозапись
          </button>
          <button
            className={styles.change_avatar_modal__button}
            onClick={onClose}
          >
            Отмена
          </button>
        </div>
      )}
      {addAudioStepArray[addAudioStepArrayIndex] === "EDIT_INFO_PAGE" && (
        <div className={styles.change_avatar_modal__box}>
          <div className={styles.change_avatar_modal__title}>
            Здесь вы можете изменить информацию о добавленной аудиозаписи
          </div>
          <div className="standart-gray-separator" />
          <div className={styles.AddAudioModal__EDIT_INFO_PAGE__inner}>
            <div>
              <p className={styles.AddAudioModal__title}>Никнейм артиста</p>
              <input
                className={styles.AddAudioModal__input}
                value={audioData.artist}
                onChange={(e) =>
                  setAudioData({ ...audioData, artist: e.target.value })
                }
              />
            </div>
            <div className="standart-gray-separator" />
            <div>
              <p className={styles.AddAudioModal__title}>Название трека</p>
              <input
                className={styles.AddAudioModal__input}
                value={audioData.title}
                onChange={(e) =>
                  setAudioData({ ...audioData, title: e.target.value })
                }
              />
            </div>
          </div>
          <button
            disabled={audioByteArray == null}
            className={`${styles.change_avatar_modal__button} ${styles.change_avatar_modal__button___add}`}
            onClick={onNextButton}
          >
            Далее
          </button>
        </div>
      )}

      {addAudioStepArray[addAudioStepArrayIndex] === "UPLOADING_PAGE" && (
        <div className={styles.change_avatar_modal__box}>
          <div className={styles.change_avatar_modal__title}>
            Идёт загрузка...
          </div>
          <button
            className={`${styles.change_avatar_modal__button} ${styles.change_avatar_modal__button___add}`}
          >
            <LoaderComponent style="mini" />
          </button>
        </div>
      )}
      {addAudioStepArray[addAudioStepArrayIndex] === "SUCCESS_PAGE" && (
        <div className={styles.change_avatar_modal__box}>
          <div className={styles.change_avatar_modal__title}>
            {isAudioUploadingError
              ? "Аудиозапись не была добавлена по техническим причинам :("
              : "Аудиозапись успешно добавлена!"}
          </div>
          <button
            className={styles.change_avatar_modal__button}
            onClick={onClose}
          >
            Отмена
          </button>
        </div>
      )}
    </ModalBody>
  );
};

export default AddAudioModal;
