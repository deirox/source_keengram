import * as add from "./add";
import * as get from "./get";
import * as update from "./update";
import * as remove from "./remove";

export async function API(requests:any, init:any) {
  const response = await fetch(requests, init);
  const json = await response.json();
  return json;
} 



const APIYandexDisk = {
  add,
  get,
  update,
  remove,
};

export default APIYandexDisk;
