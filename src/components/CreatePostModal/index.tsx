import React, { useEffect, useState } from "react";
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
  initialIFirebaseCreatedAt,
  IPostComment,
  IMedia,
  IPost,
} from "@/shared/types/api.types";
import APIFirebase from "@/shared/api/Firebase/index";
import utils from "@/shared/utils";

const CreatePostModal = () => {
  const isCreatePostModalOpen = useModalStore(
    (state) => state.isCreatePostModalOpen,
  );
  const setIsCreatePostModalOpen = useModalStore(
    (state) => state.setIsCreatePostModalOpen,
  );
  const addPost = usePostsStore((state) => state.addPost);
  const authorizedUserData = useUserStore((state) => state.authorizedUserData);
  if (!authorizedUserData) return <>user is undefined</>
  // const uploadedImages = useFirebaseStore((state) => state.uploadedImages);
  const deleteImages = useFirebaseStore((state) => state.deleteImages);

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [images, setImages] = useState<ReactImageGalleryItem[]>([]);
  const [postDesc, setPostDesc] = useState("");
  const [media, setMedia] = useState<IMedia[]>([]);
  const [isCreatePostError, setIsCreatePostError] = useState(false);

  const stepArray = [
    { title: "Создание публикации", name: "addImages" },
    { title: "Создание публикации", name: "generatePost" },
    { title: "Публикация", name: "generatePost" },
    { title: "Вы поделились публикацией", name: "generatePost" },
  ];

  const inputOnChange = async (e: React.BaseSyntheticEvent) => {
    const files: File[] = Array.from(e.target.files);

    const media_response = await APIFirebase.add.Media(
      files.map((file) => {
        const name = utils.makeid(20) + "." + file.name.split(".")[1];
        return {
          path: "images/" + name,
          type: "image",
          file: file,
          file_name: name,
          file_type: file.type
        };
      }),
    );
    if (media_response.status !== 'success' || media_response.data === null) return
    setMedia(media_response.data);
    files.forEach(async (file) => {
      if (!file.type.match("image")) {
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target) {
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


  useEffect(() => {
    console.log('currentStepIndex===2', currentStepIndex)
    console.log('media.length === images.length', media.length === images.length)
    if (currentStepIndex === 2 && media.length === images.length) {
      const add = async () => {
        const comments: IPostComment[] =
          postDesc.length > 0
            ? ([
              {
                uid: "",
                post_uid: "",
                comment_id: 0,
                author: authorizedUserData.uid,
                text: postDesc,
                created_at: initialIFirebaseCreatedAt,
              },
            ])
            : [];
        const post: Omit<IPost, "uid"> = {
          post_weight: 0,
          media,
          likes: { data: [], length: 0 },
          created_at: { seconds: 0, nanoseconds: Date.now() },
          comments: { data: comments, length: comments.length },
          author: authorizedUserData.uid,
        };
        await addPost({ post: post, user: authorizedUserData }).then(newPost => {
          if (newPost.status == 'error') {
          }
        }).catch(() => {
          setIsCreatePostError(true)
        }).finally(() => {
          setCurrentStepIndex(3)
        })
      }
      add()
    }
  }, [currentStepIndex, media])

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
              onClick={() => setCurrentStepIndex(2)}
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
          authorizedUserData={authorizedUserData}
          postDesc={postDesc}
          setPostDesc={setPostDesc}
        />
        {stepArray[2] === stepArray[currentStepIndex] && (
          <div>
            <LoaderComponent text={media.length !== images.length ? "Идёт размещение изображений..." : "Идёт размещение поста..."} />
          </div>
        )}
        {stepArray[3] === stepArray[currentStepIndex] && (
          <div>
            <LoaderComponent text={`${isCreatePostError ? "Произошла ошибка при размещении поста" : "Публикация размещена"}`} />
          </div>
        )}
      </div>
    </ModalBody>
  );
};

export default CreatePostModal;
