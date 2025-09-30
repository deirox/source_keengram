
import { FC, lazy, Suspense, useState } from 'react'
import styles from './PostHeader.module.css'
import { IAuthorizedUser, initialIFirebaseCreatedAt, IPost } from '@/shared/types/api.types'
import FCAvatar from '@/shared/ui/Avatar'
import { Link } from 'react-router-dom'
import { usePostsStore } from '@/shared/store/usePostsStore'
import dayjs from 'dayjs'
const DoubleCheckConfirmModal = lazy(() => import("@/components/DoubleCheckConfirmModal"));



interface IFCPostHeader {
    post: IPost
    authorizedUserData: IAuthorizedUser | null
    onConfirm?: () => void
}

const FCPostHeader: FC<IFCPostHeader> = ({ post, authorizedUserData, onConfirm = () => { } }) => {
    const { author, created_at = initialIFirebaseCreatedAt } = post
    if (!authorizedUserData) return <></>
    const [isActions, setIsActions] = useState(false)
    const [isDeletePostModalOpen, setIsDeletePostModalOpen] = useState(false)

    const deletePost = usePostsStore(state => state.deletePost)

    const isMyPost = typeof author === 'string' ? author === authorizedUserData.uid : author.uid === authorizedUserData.uid


    if (typeof author === "string" || !author.avatar) {
        return <>User undefined</>
    }
    const [date] = useState(dayjs.unix(created_at.seconds))
    const [dateFromNow] = useState(date.fromNow())
    
    return <>
        <Suspense fallback={<></>}>
            <DoubleCheckConfirmModal isModalOpen={isDeletePostModalOpen} onClose={() => setIsDeletePostModalOpen(false)} onConfirm={() => { const response = deletePost({ post, user_uid: authorizedUserData.uid }); onConfirm(); return response }} />
        </Suspense>
        <div className={styles.post_card__header}>
            <div className={styles.post_card__info}>
                <FCAvatar author={author} />
                <div className={styles.post_card__author_bio}>
                    <div className={styles.post_card__author_bio__top}>
                        <Link
                            className={styles.post_card__author_nickname}
                            to={'/' + author.nickname}
                        >
                            {author.nickname}
                        </Link>
                        <span className="_ac6e _ac6g _ac6h">•</span>

                        <time
                            className={`_ac6g ${styles.post_card__created_date}`}
                            dateTime={date.toString()}
                            title={date.format("MMM D, YYYY")}
                        >
                            {dateFromNow}
                        </time>
                    </div>
                </div>
            </div>

            {isMyPost &&
                <div className={styles.post_card__actions}>
                    <button className={styles.post_card__action_button} style={isActions ? {
                        opacity: 1
                    } : {}} onClick={() => setIsActions(!isActions)}>⋮</button>
                    {isActions &&
                        <div className={styles.post_card__actions_list}>
                            {isMyPost &&
                                <div className={styles.post_card__action} style={{
                                    color: 'rgb(var(--ig-error-or-destructive))'
                                }} onClick={() => setIsDeletePostModalOpen(true)}>Удалить пост</div>
                            }
                        </div>
                    }
                </div>

            }
        </div>
    </>
}

export default FCPostHeader