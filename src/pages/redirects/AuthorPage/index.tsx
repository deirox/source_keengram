import { useUserStore } from "@/shared/store/useUserStore";
import { IAuthor } from "@/shared/types/api.types";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

const FCAuthorPage = () => {
  const getUser = useUserStore((state) => state.getUser);
  const params = useParams();
  const navigate = useNavigate();
  useEffect(() => {
    const get = async () => {
      if (params.data) {
        const split = params.data.split("=");
        let user: IAuthor | null = null;
        if (split[0] === "uid") {
          user = await getUser({ by: "uid", data: split[1] });
        }
        if (split[0] === "nickname") {
          user = await getUser({ by: "nickname", data: split[1] });
        }
        if (user) {
          useUserStore.setState({ userData: user })
          navigate(`/${user.nickname}`, { replace: true });
        }
      }
    }
    if (!params.data) {
      navigate("/");
    } else {
      get()
    }
  }, [params, params.uid, navigate, getUser]);
  return <></>;
};

export default FCAuthorPage;
