import React, { useState } from "react";
import { useFirebaseStore } from "@/shared/store/useFirebaseStore";
import { useModalStore } from "@/shared/store/useModalStore";
import { usePostsStore } from "@/shared/store/usePostsStore";
import { useUserStore } from "@/shared/store/useUserStore";
import LoaderComponent from "@/components/LoaderComponent";
import ModalBody from "@/components/ModalBody";
import AddImages from "./AddImages";
import styles from "./CreatePostModal.module.css";
import GeneratePost from "./GeneratePost";
import { ReactImageGalleryItem } from "react-image-gallery";
import {
  IAuthor,
  initialIAuthorizedUser,
  IPost,
  IPostComment,
  IPostMedia,
} from "@/shared/types/api.types";

const CreatePostModal = () => {
  const isCreatePostModalOpen = useModalStore(
    (state) => state.isCreatePostModalOpen,
  );
  const setIsCreatePostModalOpen = useModalStore(
    (state) => state.setIsCreatePostModalOpen,
  );
  const addPost = usePostsStore((state) => state.addPost);
  const authorizedUserData = useUserStore((state) => state.authorizedUserData);

  const uploadImages = useFirebaseStore((state) => state.uploadImages);
  const uploadedImages = useFirebaseStore((state) => state.uploadedImages);
  const deleteImages = useFirebaseStore((state) => state.deleteImages);

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [images, setImages] = useState<ReactImageGalleryItem[]>([]);
  const [postDesc, setPostDesc] = useState("");

  const stepArray = [
    { title: "Создание публикации", name: "addImages" },
    { title: "Создание публикации", name: "generatePost" },
    { title: "Публикация", name: "generatePost" },
    { title: "Вы поделились публикацией", name: "generatePost" },
  ];

  const inputOnChange = async (e: React.BaseSyntheticEvent) => {
    const files: File[] = Array.from(e.target.files);
    const readerArray = [];
    await uploadImages(files, files.length);
    files.forEach(async (file) => {
      if (!file.type.match("image")) {
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target) {
          readerArray.push({
            original: ev.target.result,
            thumbnail: ev.target.result,
            event: ev,
          });
          setImages((images) => {
            if (ev.target) {
              return [
                ...images,
                {
                  original: ev.target.result as string,
                  thumbnail: ev.target.result as string,
                },
              ];
            }
            return [];
          });
        }
      };
      reader.readAsDataURL(file);
    });
    setCurrentStepIndex(currentStepIndex + 1);
  };
  // console.log("uploadedImages: ", uploadedImages);

  // console.log("images: ", images);
  const onClose = () => {
    setIsCreatePostModalOpen(false);
    setImages([]);
    setCurrentStepIndex(0);
  };
  return (
    <ModalBody
      isModalOpen={isCreatePostModalOpen}
      onClose={onClose}
      modalClassname={
        currentStepIndex > 0 && currentStepIndex < 2
          ? styles.create_post_modal___big
          : styles.create_post_modal
      }
      overlayClassName={styles.create_post_modal__overlay}
    >
      <div className={styles.create_post_modal__wrapper}>
        <div className={styles.create_post_modal__top}>
          {currentStepIndex > 0 && currentStepIndex < 2 && (
            <button
              className={styles.create_post_modal__back}
              onClick={() => {
                switch (currentStepIndex) {
                  case 1:
                    deleteImages();
                    setImages([]);
                    setCurrentStepIndex(currentStepIndex - 1);
                    break;
                  case 0:
                    return;
                  default:
                    setCurrentStepIndex(currentStepIndex - 1);
                }
              }}
            >
              <svg
                aria-label="Назад"
                // className="_ab6-"
                color="rgb(245, 245, 245)"
                fill="rgb(245, 245, 245)"
                height="24"
                role="img"
                viewBox="0 0 24 24"
                width="24"
              >
                <line
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  x1="2.909"
                  x2="22.001"
                  y1="12.004"
                  y2="12.004"
                ></line>
                <polyline
                  fill="none"
                  points="9.276 4.726 2.001 12.004 9.276 19.274"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                ></polyline>
              </svg>
            </button>
          )}
          <p className={styles.create_post_modal__title}>
            {stepArray[currentStepIndex].title}
          </p>
          {currentStepIndex > 0 && currentStepIndex < 2 && (
            <button
              className={styles.create_post_modal__forward}
              onClick={async () => {
                if (authorizedUserData) {
                  const comments =
                    postDesc.length > 0
                      ? ([
                          {
                            post_uid: "",
                            comment_id: 0,
                            author: authorizedUserData,
                            text: postDesc,
                            timestamp: 0,
                            uid: "",
                          },
                        ] as IPostComment[])
                      : [];
                  const post: IPost = {
                    post_weight: 0,
                    media: [uploadedImages] as unknown as IPostMedia[],
                    likes: { data: [], length: 0 },
                    created_at: { seconds: 0, nanoseconds: Date.now() },
                    comments: { data: comments, length: comments.length },
                    author: {
                      uid: authorizedUserData.uid,
                      nickname: authorizedUserData.nickname,
                      avatar: { url: authorizedUserData.avatar.url },
                    } as IAuthor,
                  };
                  setCurrentStepIndex(2);
                  await addPost(post);
                  setCurrentStepIndex(3);
                }
              }}
            >
              Поделиться
            </button>
          )}
        </div>
        <AddImages
          active={stepArray[0] === stepArray[currentStepIndex]}
          inputOnChange={inputOnChange}
        />
        <GeneratePost
          active={stepArray[1] === stepArray[currentStepIndex]}
          images={images}
          authorizedUserData={{
            ...initialIAuthorizedUser,
            ...authorizedUserData,
          }}
          postDesc={postDesc}
          setPostDesc={setPostDesc}
        />
        {stepArray[2] === stepArray[currentStepIndex] && (
          <div>
            <LoaderComponent text="" />
          </div>
        )}
        {stepArray[3] === stepArray[currentStepIndex] && (
          <div>
            <LoaderComponent text="Публикация размещена" />
          </div>
        )}
      </div>
    </ModalBody>
  );
};

export default CreatePostModal;
