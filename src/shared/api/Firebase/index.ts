// Добавляем default экспорт для обратной совместимости
import * as add from "./add";
import * as get from "./get";
import * as update from "./update";
import * as remove from "./remove";

const APIFirebase = {
  add,
  get,
  update,
  remove,
};

export default APIFirebase;

// Экспортируем отдельные функции
export { Comment, Like, Media, Post } from "./add";
export { User, Users, Comment as GetComment, Like as GetLike } from "./get";
export { Like as RemoveLike } from "./remove";
