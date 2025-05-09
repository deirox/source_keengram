import React, { useRef } from "react";
import { BiImageAdd } from "react-icons/bi";
import StyleziedButton from "../../StyleziedButton";
import styles from "./AddImages.module.css";

interface IAddImages {
  currentStep?: { title: string; name: string };
  thisStep?: { title: string; name: string };
  active: boolean;
  inputOnChange: (e: React.BaseSyntheticEvent) => void;
}

const AddImages = ({
  currentStep = { title: "", name: "" },
  thisStep = { title: "", name: "" },
  active = false,
  inputOnChange = () => {},
}: IAddImages) => {
  console.log(currentStep, thisStep);
  const filePicker = useRef<HTMLInputElement>(null);
  // console.log(thisStep.name === currentStep.name);
  const handleClick = () => {
    if (filePicker.current) {
      filePicker.current.click();
      // addPost();
    }
  };
  return (
    <>
      {active && (
        <div className={styles.add_images__inner}>
          <BiImageAdd className={styles.add_images__icon} fontSize="6rem" />
          <p className={styles.add_images__text}>
            Нажмите на кнопку и добавьте любимое фото!
          </p>
          <input
            className={styles.add_images__input}
            type="file"
            ref={filePicker}
            onChange={inputOnChange}
            accept=".png,.jpg,.jpeg,.gif"
            multiple
          />
          <StyleziedButton
            classname={styles.add_images__btn}
            primary
            type="submit"
            children="Выбрать фото"
            onClick={handleClick}
          />
        </div>
      )}
    </>
  );
};

export default AddImages;
