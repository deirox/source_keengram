import React, { useRef, useState } from "react";
import { useUserStore } from "@/shared/store/useUserStore";
import { useMusicStore } from "@/shared/store/useMusicStore";
import styles from "./MusicPage.module.css";
import { HiUpload } from "react-icons/hi";
import AddAudioModal from "@/components/AddAudioModal";
import AudioCard from "./AudioCard";

const MusicPage = () => {
  const authorizedUserData = useUserStore((state) => state.authorizedUserData);
  const getAudios = useMusicStore((state) => state.getAudios);
  const allAudios = useMusicStore((state) => state.allAudios);
  const effectRun = useRef(false);

  const [isAudioModalOpen, setIsAudioModalOpen] = useState(false);

  React.useEffect(() => {
    if (authorizedUserData) {
      getAudios(authorizedUserData.uid);
    }

    if (!effectRun.current) {
      return () => {
        effectRun.current = true;
      };
    }
  }, []);

  return (
    <div className={styles.music_page__container}>
      <div className={styles.music_page__header}>
        <button>Главная</button>
        <HiUpload
          className={styles.music_page__updload_btn}
          onClick={() => setIsAudioModalOpen(true)}
          size="28"
        />
      </div>
      <div className={styles.music_page__audio_list}>
        {allAudios.length > 0 ? (
          allAudios.map((audio) => {
            return <AudioCard key={audio.uid} audio={audio} />;
          })
        ) : (
          <p>На данный момент треков нет</p>
        )}
      </div>
      <AddAudioModal
        isModalOpen={isAudioModalOpen}
        onClose={() => setIsAudioModalOpen(false)}
      />
    </div>
  );
};

export default MusicPage;
