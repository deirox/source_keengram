import { useUserStore } from "@/shared/store/useUserStore";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

const FCAuthorPage = () => {
  const getUser = useUserStore((state) => state.getUser);
  const params = useParams();
  const navigate = useNavigate();
  useEffect(() => {
    if (!params.data) {
      navigate("/");
    } else {
      const split = params.data.split("=");
      let user;
      if (split[0] === "uid") {
        user = getUser({ by: "uid", data: split[1] });
      }
      if (split[0] === "nickname") {
        user = getUser({ by: "nickname", data: split[1] });
      }
      if (user) {
        navigate(`/${user.nickname}`, { replace: true });
      }
    }
  }, [params, params.uid, navigate, getUser]);
  return <>author page</>;
};

export default FCAuthorPage;
