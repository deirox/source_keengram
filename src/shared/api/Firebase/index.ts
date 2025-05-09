export * from "./add";
export * from "./get";
export * from "./update";
export * from "./remove";
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
