import dayjs from "dayjs";
// let isYesterday = require("dayjs/plugin/isYesterday");

interface IUtils {
  isMatch: (initialValue: string, enteredValue: string) => boolean;
  declOfNum: (n: number, text_forms: string[]) => string;

  skloneniye: (number: number, txt: string[]) => string;
  calculatePostWeight: (post: any) => number;
  makeid: (length: number) => string;
}

export const calculatePostWeight = (post: any) => {
  const dateNow = dayjs(dayjs().format());
  const dateDiff = dateNow.diff(post.created_date, "day");
  let dateRate;
  switch (dateDiff) {
    case 0:
    case 1:
      dateRate = 2;
      break;
    case 2:
      dateRate = 1;
      break;
    default:
      dateRate = 0;
  }
  const postWeight = Number(
    post.likes?.length + post.comments?.length + dateRate,
  );
  return postWeight;
};

export const utils: IUtils = {
  isMatch: (initialValue, enteredValue) => {
    return !!initialValue.toLowerCase().includes(enteredValue.toLowerCase());
  },
  declOfNum(n, text_forms) {
    n = Math.abs(n) % 100;
    const n1 = n % 10;
    if (n > 10 && n < 20) {
      return text_forms[2];
    }
    if (n1 > 1 && n1 < 5) {
      return text_forms[1];
    }
    if (n1 == 1) {
      return text_forms[0];
    }
    return text_forms[2];
  },
  skloneniye(number, txt) {
    const cases = [2, 0, 1, 1, 1, 2];
    return txt[
      number % 100 > 4 && number % 100 < 20
        ? 2
        : cases[number % 10 < 5 ? number % 10 : 5]
    ];
  },
  calculatePostWeight: (post: any) => {
    const dateNow = dayjs(dayjs().format());
    const dateDiff = dateNow.diff(post.created_date, "day");
    let dateRate;
    switch (dateDiff) {
      case 0:
        dateRate = 3;
        break;
      case 1:
        dateRate = 2;
        break;
      case 2:
        dateRate = 1;
        break;
      default:
        dateRate = 0;
    }
    const postWeight = Number(
      post.likes?.length + post.comments?.length + dateRate,
    );
    return postWeight;
  },
  makeid: (length: number) => {
    let result = "";
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
  },
};

export default utils;
