import App from "../App";
import ComingSoon from "../pages/coming-soon/ComingSoon";
import Dashboard from "../pages/dashboard/Dashboard";
import SignIn from "../pages/sign-in/SingIn";

export const routes = [
  {
    path: "/",
    exact: true,
    component: Dashboard,
    fallback: null,
    private: true,
  },
  {
    path: "/sign-in",
    exact: true,
    component: SignIn,
    fallback: null,
    private: false,
  },
  {
    path: "/coming-soon",
    exact: true,
    component: ComingSoon,
    fallback: null,
    private: true,
  },
];
