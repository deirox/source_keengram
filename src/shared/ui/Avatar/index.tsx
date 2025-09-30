import styles from './Avatar.module.css'
import { IAuthor } from "@/shared/types/api.types";
import { FC } from "react";


interface IFCAvatar {
    classnames?: {
        avatar_classname?: string,
        img_classname?: string
    }
    author: string | IAuthor;
    size?: "s" | "m" | 'l' | 'xl'
    onclick?: undefined | (() => void)
}

const FCAvatar: FC<IFCAvatar> = ({ classnames = {
    avatar_classname: '', img_classname: ''
}, author, size = 'm', onclick }) => {
    const avatarUrl = typeof author !== "string" ? author.avatar.url : ""
    return <div className={`${styles.size} ${styles[size]} ${classnames.avatar_classname ? classnames.avatar_classname : ""}`} onClick={onclick !== undefined ? () => onclick() : undefined}>
        <img
            className={classnames.avatar_classname ? classnames.avatar_classname : ""}
            src={avatarUrl}
            onError={({ currentTarget }) => {
                currentTarget.onerror = null; // prevents looping
                currentTarget.src = "img/EmptyAvatar.jpg";
            }}
            alt={avatarUrl}
        />
    </div>
}

export default FCAvatar