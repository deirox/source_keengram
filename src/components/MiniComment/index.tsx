import { Link } from "react-router-dom";
import styles from "./MiniComment.module.css";

const MiniComment = ({ classname = "", nickname = "", text = "" }) => {
  return (
    <div className={`${styles.mini_comment} ${classname}`}>
      <Link className={styles.mini_comment__link} to={nickname}>
        {nickname}
      </Link>
      : {text}
    </div>
  );
};

export default MiniComment;
