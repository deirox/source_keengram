import axios from "axios";

const API_FILES = "https://cloud-api.yandex.net/v1/disk/resources?path=";
// const API_DOWNLOAD =
//   "https://cloud-api.yandex.net/v1/disk/resources/download?path=";
const OAUTH_TOKEN = import.meta.env.VITE_REACT_APP_YANDEXDISK_OAUTH_TOKEN;

export const File = async (filePath: string) => {
  try {
    const url = `${API_FILES}${filePath}`;
    const downloadUrlResponse = await axios.get(url, {
      headers: {
        Authorization: `OAuth ${OAUTH_TOKEN}`,
      },
    });
    return {
      url: downloadUrlResponse.data.file,
      public_url: downloadUrlResponse.data.public_url
        ? downloadUrlResponse.data.public_url
        : "",
      mime_type: downloadUrlResponse.data.mime_type,
    };
  } catch (e) {
    console.error(e);
    // alert(
    //   `Error fetching file data ${JSON.stringify(error.stack)} ${typeof error}`,
    // );
    return {
      url: null,
      public_url: null,
      error: "",
      mime_type: "",
    };
  }
};
