import { Redirect, Route } from "react-router-dom";
import {
  IonApp,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  setupIonicReact,
} from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { barChart, home, addCircle, wallet, settings } from "ionicons/icons";

/* Core CSS required for Ionic components to work properly */
import "@ionic/react/css/core.css";

/* Basic CSS for apps built with Ionic */
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";

/* Optional CSS utils that can be commented out */
import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */
import "@ionic/react/css/palettes/dark.system.css";

/* Theme variables */
import "./theme/variables.css";
import Home from "./pages/home/home";
import Dashboard from "./pages/dashboard/dashboard";
import AddListing from "./pages/addListing/addListing";
import Wallet from "./pages/wallet/wallet";
import Onboarding from "./pages/onboarding/onboarding";
import SplashScreen from "./components/splashScreen/splashScreen";
import LoginPage from "./pages/loginPage/loginPage";
import SignUpPage from "./pages/signUpPage/signUpPage";
import Settings from "./pages/settings/settings";
import SignUpSuccess from "./pages/signUpSuccess/signUpSuccess";
import ChangePassword from "./pages/changePassword/changePassword";
import ForgotPassword from "./pages/forgotPassword/forgotPassword";
import DetailPage from "./pages/detailPage/detailPage";
import { ThirdwebProvider } from "@thirdweb-dev/react";

setupIonicReact({ mode: "ios" });

const App: React.FC = () => {
  return (
    <ThirdwebProvider activeChain="ethereum">
      <IonApp>
        <IonReactRouter>
          <IonRouterOutlet>
            <Route exact path="/splash">
              <SplashScreen
                onComplete={() => {
                  window.location.replace("/onboarding");
                }}
              />
            </Route>
            <Route exact path="/onboarding">
              <Onboarding />
            </Route>
            <Route exact path="/login">
              <LoginPage />
            </Route>
            <Route exact path="/signup">
              <SignUpPage />
            </Route>
            <Route exact path="/signupsuccess">
              <SignUpSuccess />
            </Route>
            <Route exact path="/changepassword">
              <ChangePassword />
            </Route>
            <Route exact path="/forgotpassword">
              <ForgotPassword />
            </Route>
            <Route exact path="/">
              <Redirect to="/splash" />
            </Route>

            <IonTabs>
              <IonRouterOutlet>
                <Route exact path="/home">
                  <Home />
                </Route>
                <Route exact path="/dashboard">
                  <Dashboard />
                </Route>
                <Route path="/addListing">
                  <AddListing />
                </Route>
                <Route path="/wallet">
                  <Wallet />
                </Route>
                <Route path="/settings">
                  <Settings />
                </Route>
                <Route path="/detail-page/:id">
                  <DetailPage />
                </Route>
              </IonRouterOutlet>
              <IonTabBar slot="bottom">
                <IonTabButton tab="home" href="/home">
                  <IonIcon aria-hidden="true" icon={home} />
                  <IonLabel>Home</IonLabel>
                </IonTabButton>
                <IonTabButton tab="dashboard" href="/dashboard">
                  <IonIcon aria-hidden="true" icon={barChart} />
                  <IonLabel>Dashboard</IonLabel>
                </IonTabButton>
                <IonTabButton tab="addListing" href="/addListing">
                  <IonIcon aria-hidden="true" icon={addCircle} />
                  <IonLabel>Add</IonLabel>
                </IonTabButton>
                <IonTabButton tab="wallet" href="/wallet">
                  <IonIcon aria-hidden="true" icon={wallet} />
                  <IonLabel>Wallet</IonLabel>
                </IonTabButton>
                <IonTabButton tab="settings" href="/settings">
                  <IonIcon aria-hidden="true" icon={settings} />
                  <IonLabel>Settings</IonLabel>
                </IonTabButton>
              </IonTabBar>
            </IonTabs>
          </IonRouterOutlet>
        </IonReactRouter>
      </IonApp>
    </ThirdwebProvider>
  );
};

export default App;
