import ErrorComponent from "@/components/ErrorComponent";
import { FC } from "react";
import { useRouteError } from "react-router-dom";

interface IFCErrorPage {
  text?: string
}

const ErrorPage: FC<IFCErrorPage> = ({ text }) => {
  const error = useRouteError();

  return (
    <div>
      <ErrorComponent text={text + " " + error} />
    </div>
  );
};

export default ErrorPage;
