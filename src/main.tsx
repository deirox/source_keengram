import { lazy, StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { createHashRouter, RouterProvider } from "react-router-dom";

import dayjs from "dayjs";
import relativeTime from 'dayjs/plugin/relativeTime' // ES 2015

import FCAuthorRedirectPage from "./pages/redirects/redirect";
import LoaderComponent from "./components/LoaderComponent";
import 'dayjs/locale/ru'
dayjs.locale("ru");
dayjs.extend(relativeTime);

const App = lazy(() => import("@/app"));
const EditProfilePage = lazy(() => import("@/pages/EditProfilePage"));
const MusicPage = lazy(() => import("@/pages/MusicPage"));
const FCAuthorPage = lazy(() => import("@/pages/redirects/AuthorPage"));
const ProfilePage = lazy(() => import("@/pages/ProfilePage"));
const LoginPage = lazy(() => import("@/pages/LoginPage"));
const SignUpPage = lazy(() => import("@/pages/SignUpPage"));
const MainPage = lazy(() => import("@/pages/MainPage"));
const ErrorPage = lazy(() => import("@/pages/ErrorPage"));
// const MessengerPage = lazy(() => import("@/pages/MessengerPage/MessengerPage"));


const router = createHashRouter([
  {
    path: "",
    element: <Suspense fallback={<LoaderComponent />}>
      <App />
    </Suspense>,
    errorElement: <ErrorPage text="Что-то пошло не так!" />,
    children: [
      {
        path: "/",
        element: <Suspense fallback={<LoaderComponent />}>
          <MainPage />
        </Suspense>,
      },
      {
        path: ":userNickname",
        element: <Suspense fallback={<LoaderComponent />}>
          <ProfilePage />
        </Suspense>,
      },
      {
        path: "audios",
        element: <Suspense fallback={<LoaderComponent />}>
          <MusicPage />
        </Suspense>,
      },
      // {
      //   path: "messenger",
      //   element: <Suspense fallback={<LoaderComponent />}>
      //     <MessengerPage />
      //   </Suspense>,
      // },
      {
        path: "author",
        element: <Suspense fallback={<LoaderComponent />}>
          <FCAuthorPage />
        </Suspense>,
        children: [
          {
            path: ":data",
            element: <FCAuthorRedirectPage />,
          },
        ],
      },
      {
        path: "accounts",
        children: [
          {
            path: "login",
            element: <Suspense fallback={<LoaderComponent />}>
              <LoginPage />
            </Suspense>,
          },
          {
            path: "emailsignup",
            element: <Suspense fallback={<LoaderComponent />}>
              <SignUpPage />
            </Suspense>,
          },
          {
            path: "edit",
            element: <Suspense fallback={<LoaderComponent />}>
              <EditProfilePage />
            </Suspense>,
          },
        ],
      },
    ],
  },
  {
    path: "*", element: <Suspense fallback={<LoaderComponent />}>
      <ErrorPage text="Такой страницы не найдено!" />
    </Suspense>
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
