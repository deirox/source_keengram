import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "@/app";
import { createHashRouter, RouterProvider } from "react-router-dom";

import EditProfilePage from "@/pages/EditProfilePage";
import LoginPage from "@/pages/LoginPage";
import ProfilePage from "@/pages/ProfilePage";
import MusicPage from "@/pages/MusicPage";
// import ReelsPage from "./Pages/ReelsPage";
import SignUpPage from "@/pages/SignUpPage";
import MainPage from "@/pages/MainPage";
import ErrorPage from "@/pages/ErrorPage";

import dayjs from "dayjs";
dayjs.locale("ru");

const router = createHashRouter([
  {
    path: "",
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "",
        element: <MainPage />,
      },
      {
        path: ":userNickname",
        element: <ProfilePage />,
      },
      {
        path: "audios",
        element: <MusicPage />,
      },
      {
        path: "accounts",
        children: [
          {
            path: "login",
            element: <LoginPage />,
          },
          {
            path: "emailsignup",
            element: <SignUpPage />,
          },
          {
            path: "edit",
            element: <EditProfilePage />,
          },
        ],
      },
    ],
  },
  { path: "*", element: <ErrorPage /> },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
