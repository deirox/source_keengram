import React, {
  BaseSyntheticEvent,
  FC,
  useEffect,
  useRef,
  useState,
} from "react";
import styles from "./AudioCard.module.css";
import { HiPlay, HiStop } from "react-icons/hi";
import { useAudioStore } from "../store";
import { IAudio } from "@/shared/types/api.types";

interface IFCAudioCard {
  audio: IAudio;
}

const AudioCard: FC<IFCAudioCard> = ({ audio }) => {
  const [volume, setVolume] = useState(0.5);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(500);
  const [sound, setSound] = useState<HTMLAudioElement | null>(null);
  const whatAudioPlaying = useAudioStore((state) => state.whatAudioPlaying);
  const [isAudioCardLoading, setIsAudioCardLoading] = useState(true);
  const tumblerRef = useRef<HTMLDivElement | null>(null);
  const audioCardInfoRef = useRef<HTMLDivElement | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [isMouseClicked, setIsMouseClicked] = useState(false);
  const [timerId, setTimerId] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setIsAudioCardLoading(false);
  }, []);

  useEffect(() => {
    if (sound) {
      if (whatAudioPlaying === audio.uid) {
        sound.play();
        setIsAudioPlaying(true);
      } else {
        sound.pause();
        setIsAudioPlaying(false);
      }
    }
  }, [whatAudioPlaying, audio, sound]);

  const maxDurationLineSize: number = audioCardInfoRef.current
    ?.clientWidth as number;

  const durationLineUnit: number = maxDurationLineSize / duration;
  const curDurationLineSize: number = currentTime * durationLineUnit;

  const maxVolumeLineSize: number = 48;

  const volumeLineUnit: number = maxVolumeLineSize / 100;
  const curVolumeLineSize: number = volume * 100 * volumeLineUnit;
  const minutes = Math.trunc(Math.floor(currentTime / 60));
  const seconds = Math.trunc(currentTime - Math.floor(currentTime / 60) * 60);

  const secondsFormated = seconds < 10 ? `0${seconds}` : seconds;

  useEffect(() => {
    if (sound) {
      setDuration(sound.duration);
    }

    // console.log(currentTime);
  }, [sound, currentTime]);

  useEffect(() => {
    if (sound) {
      sound.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    console.log("isAudioPlaying", isAudioPlaying);
  }, [isAudioPlaying]);

  const onAudioPlayButton = async () => {
    setIsAudioPlaying(true);
    useAudioStore.setState({ whatAudioPlaying: audio.uid });
    if (sound === null) {
      const newsound = new Audio(audio.url);
      setSound(newsound);
      setTimerId(
        setInterval(() => {
          setCurrentTime(newsound.currentTime);
        }, 100),
      );
    }
    if (sound !== null) {
      await sound.play();
      setTimerId(
        setInterval(() => {
          setCurrentTime(sound.currentTime);
        }, 100),
      );
    }
  };

  const onAudioPauseButton = async () => {
    setIsAudioPlaying(false);
    if (sound) {
      if (timerId !== null) {
        clearInterval(timerId);
      }
      sound.pause();
    }
  };

  return (
    <>
      {audio.error && <p>{audio.error}</p>}
      {isAudioCardLoading ? (
        "loader"
      ) : (
        <div className={styles.music_page__audio_card}>
          <div className={styles.music_page__audio_card__wrapper}>
            <div className={styles.music_page__audio_card__inner}>
              <div className={styles.music_page__audio_card__img}>
                <img src={audio.image.url} />
              </div>
              <div
                className={styles.music_page__audio_card__info}
                ref={audioCardInfoRef}
              >
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <div>
                    <p>{audio.artist}</p>
                    <p>{audio.title}</p>
                  </div>
                  <p>
                    {minutes}:{secondsFormated}
                  </p>
                </div>
                <div
                  className={styles.music_page__audio_card__info_duration_line}
                  onClick={(e) => {
                    if (audioCardInfoRef?.current) {
                      const current = audioCardInfoRef?.current;
                      const width = current?.clientWidth;
                      const targetBoundingLeft =
                        current?.getBoundingClientRect()?.left;
                      const curPos = e.pageX - targetBoundingLeft;
                      if (sound !== null && curPos < width) {
                        // console.log("width", width);

                        if (width !== 0 && duration !== 0) {
                          // console.log("duration", sound.duration);
                          // console.log("curPos", curPos);

                          sound.currentTime = (curPos / width) * duration;
                        }
                      }
                    }
                  }}
                  style={{
                    position: "relative",
                    width:
                      currentTime === 0 ? 0 + "px" : curDurationLineSize + "px",
                    height: ".25rem",
                    backgroundColor: "#F4F9FC",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      height: ".25rem",
                      width: "19.4rem",
                      backgroundColor: "rgba(98, 100, 97, .25)",
                    }}
                  />
                </div>
              </div>
            </div>
            <div
              style={{ margin: "0 auto" }}
              onMouseMove={(e: BaseSyntheticEvent) => {
                if (e.target.id === "thumbler") {
                  e.target.style.opacity = "1";
                }
              }}
              onMouseLeave={(e: BaseSyntheticEvent) => {
                if (e.target.id === "thumbler") {
                  e.target.style.opacity = "0";
                }
              }}
            >
              <div
                className={styles.music_page__audio_card__info_volume_line}
                style={{
                  position: "relative",
                  backgroundColor: "rgba(98, 100, 97, .25)",
                  width: ".25rem",
                  height: "50px",
                }}
                onPointerDown={(e) => {
                  setIsMouseClicked(true);
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-expect-error
                  const min = tumblerRef?.current?.offsetParent?.offsetTop;
                  const max = min + maxVolumeLineSize;
                  if (e.clientX > min || e.clientY < max) {
                    const v = (e.clientY - min) / volumeLineUnit / 100;
                    if (v > 1 || v < 0) return;
                    setVolume(1 - v);
                  }
                }}
                onPointerUp={() => setIsMouseClicked(false)}
                onPointerMove={(e: React.MouseEvent) => {
                  if (!isMouseClicked) return;
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-expect-error
                  const min = tumblerRef.current.offsetParent.offsetTop;
                  const max = min + maxVolumeLineSize;
                  if (e.clientY > min || e.clientY < max) {
                    const v = (e.clientY - min) / volumeLineUnit / 100;
                    if (v > 1 || v < 0) return;
                    setVolume(1 - v);
                  }
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    width: ".25rem",
                    height: curVolumeLineSize + "px",
                    backgroundColor: "#F4F9FC",
                  }}
                />
                <div
                  id="thumbler"
                  ref={tumblerRef}
                  style={{
                    opacity: 0,
                    position: "absolute",
                    bottom: curVolumeLineSize - 6 + "px",
                    left: "-4px",
                    height: "12px",
                    width: "12px",
                    borderRadius: "8px",
                    backgroundColor: "rgb(244, 249, 252)",
                    cursor: "pointer",
                  }}
                ></div>
              </div>
            </div>
            <div>
              {isAudioPlaying && currentTime > 0 ? (
                <HiStop
                  style={{ cursor: "pointer" }}
                  size={48}
                  onClick={() => {
                    onAudioPauseButton();
                  }}
                />
              ) : (
                <HiPlay
                  onClick={() => {
                    onAudioPlayButton();
                  }}
                  style={{ cursor: "pointer" }}
                  size={48}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
export default AudioCard;
