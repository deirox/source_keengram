import ReactModal from "react-modal";
import styles from "./ModalBody.module.css";
import { ReactNode } from "react";

interface IModalBody {
  classname?: string | undefined;
  isModalOpen?: boolean;
  children: ReactNode;
  modalClassname?: string;
  overlayClassName?: string | undefined;
  onClose?: () => void;
}

const ModalBody = ({
  classname = "",
  isModalOpen = false,
  children,
  modalClassname = "",
  overlayClassName = "",
  onClose = () => { },
}: IModalBody) => {
  ReactModal.setAppElement("#root");
  return (
    <ReactModal
      isOpen={isModalOpen}
      onAfterOpen={() => {
        document.body.style.overflow = "hidden";
      }}
      overlayClassName={`${styles.modal_body__overlay} ${overlayClassName && overlayClassName
        }`}
      className={`${classname} ${styles.modal_body__content} ${modalClassname && modalClassname
        }`}
      onRequestClose={() => {
        document.body.classList.remove("ReactModal__Body--open");
        document.body.style.overflow = "";
        onClose();
      }}
    >
      <div
        className={styles.modal_body__close_btn}
        onClick={() => {
          document.body.style.overflow = "";
          onClose();
        }}
      >
        <svg
          aria-label="Закрыть"
          color="rgb(255, 255, 255)"
          fill="rgb(255, 255, 255)"
          height="18"
          role="img"
          viewBox="0 0 24 24"
          width="18"
        >
          <title>Закрыть</title>
          <polyline
            fill="none"
            points="20.643 3.357 12 12 3.353 20.647"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="3"
          ></polyline>
          <line
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="3"
            x1="20.649"
            x2="3.354"
            y1="20.649"
            y2="3.354"
          ></line>
        </svg>
      </div>
      {children}
    </ReactModal>
  )

};

export default ModalBody;
