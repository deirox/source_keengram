import axios from "axios";

const API_UPLOAD =
  "https://cloud-api.yandex.net:443/v1/disk/resources/upload?path=";

export const File = async (file_path: string) => {
  try {
    const response = await axios.get(`${API_UPLOAD}${file_path}`, {
      responseType: "blob",
      headers: {
        Authorization:
          `OAuth ` + import.meta.env.VITE_REACT_APP_YANDEXDISK_OAUTH_TOKEN,
        UserAgent:
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:138.0) Gecko/20100101 Firefox/138.0",
      },
    });
    console.warn("response", response);
    // const href = response.data.href;
    // const fileResponse = await axios
    //   .get(href, {
    //     headers: {
    //       Authorization:
    //         `OAuth ` + import.meta.env.VITE_REACT_APP_YANDEXDISK_OAUTH_TOKEN,
    //     },
    //   })
    //   .then((res) => console.warn("fileResponse", res));
    // console.log("fileResponse.data", fileResponse.data);

    const result = { file: response.data.href };
    return result;
  } catch (error) {
    console.error(error);
    return null;
  }
};
