import { FC, useEffect, useState } from "react";

import ModalBody from "@/components/ModalBody";
import styles from "./DoubleCheckConfirmModal.module.css";
import { MdDone } from "react-icons/md";
import { TiCancel } from "react-icons/ti";

interface IFCDoubleCheckConfirmModal {
  isModalOpen: boolean;
  onOpen?: () => void;
  onClose: () => void;
  onConfirm: () => Promise<boolean>;
}

const DoubleCheckConfirmModal: FC<IFCDoubleCheckConfirmModal> = ({
  isModalOpen,
  onClose,
  onConfirm
}) => {
  const [timer, setTimer] = useState(5)
  const [isFirstClick, setIsFirstClick] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  useEffect(() => {
    if (!isModalOpen) {
      setTimer(5)
    }
    if (isModalOpen && timer > 0) {
      setTimeout(() =>
        setTimer(timer - 1), 1000)
    }
  }, [isModalOpen, timer])

  const handleConfirm = async () => {
    setIsFirstClick(false)
    setIsLoading(true)
    document.body.style.overflow = ''
    await onConfirm().then((bool) => {
      setIsSuccess(bool)
      setIsLoading(false)
    })
  }

  return (
    <ModalBody
      isModalOpen={isModalOpen}
      onClose={onClose}
      modalClassname={styles.check_confirm_modal}
    >
      <div className={styles.check_confirm_modal__box}>
        {isFirstClick &&
          <>
            <div className={styles.check_confirm_modal__title}>
              Вы уверены?
            </div>
            <div className={styles.check_confirm_modal__buttons_wrapper}>
              <button
                className={`${styles.check_confirm_modal__button} ${styles.check_confirm_modal__button___delete}`}
                onClick={onClose}
              >
                Нет
              </button>
              <button
                disabled={timer > 0}
                className={`${styles.check_confirm_modal__button} ${styles.check_confirm_modal__button___add}`}
                onClick={handleConfirm}
              >
                {timer > 0 ? timer : "Да"}
              </button>
            </div>
          </>
        }
        {isLoading &&
          <div className={styles.check_confirm_modal__title}>
            Идёт загрузка...
          </div>
        }
        {
          !isFirstClick && !isLoading &&
          <>
            {isSuccess ?
              <div className={styles.check_confirm_modal__title}>
                Всё прошло успешно! <MdDone />
              </div>
              :
              <div className={styles.check_confirm_modal__title}>
                Что-то пошло не так... <TiCancel />
              </div>
            }
          </>
        }
      </div>
    </ModalBody>
  );
};

export default DoubleCheckConfirmModal;
