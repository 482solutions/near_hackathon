import App from "../App";
import ComingSoon from "../pages/coming-soon/ComingSoon";
import Dashboard from "../pages/dashboard/Dashboard";
import EnergyMarket from "../pages/energy-market/EnergyMarket";
import MyEacs from "../pages/my-eacs/MyEacs";

export const routes = [
  {
    path: "/",
    exact: true,
    component: Dashboard,
    fallback: null,
    private: true,
  },
  {
    path: "/my-eacs",
    exact: true,
    component: MyEacs,
    fallback: null,
    private: true,
  },
  {
    path: "/energy-market",
    exact: true,
    component: EnergyMarket,
    fallback: null,
    private: true,
  },
  {
    path: "/coming-soon",
    exact: true,
    component: ComingSoon,
    fallback: null,
    private: true,
  },
];
