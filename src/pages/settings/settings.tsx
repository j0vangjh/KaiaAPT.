import {
  IonButton,
  IonContent,
  IonHeader,
  IonIcon,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import "./settings.css";
import {
  chevronForward,
  home,
  language,
  lockClosed,
  logOut,
  notifications,
  person,
} from "ionicons/icons";
import { useHistory } from "react-router";
import { auth } from "../../firebaseConfig";

const Settings: React.FC = () => {
  const history = useHistory();

  const handleLogout = async () => {
    try {
      await auth.signOut();
      // Clear user data from localStorage
      localStorage.removeItem("userName");
      localStorage.removeItem("userPhotoURL");

      history.push("/login");
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Settings</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonIcon
              slot="end"
              icon={language}
              size="large"
              className="language"
            ></IonIcon>
            <IonTitle size="large">Settings</IonTitle>
          </IonToolbar>
        </IonHeader>
        <div className="ion-padding">
          <IonButton expand="block" className="settings-button" color="dark">
            <IonIcon slot="start" icon={person}></IonIcon>
            <span className="button-text">Privacy Settings</span>
            <IonIcon slot="end" icon={chevronForward}></IonIcon>
          </IonButton>
          <IonButton
            expand="block"
            className="settings-button"
            color="dark"
            routerLink="/changepassword"
          >
            <IonIcon slot="start" icon={lockClosed}></IonIcon>
            <span className="button-text">Change Password</span>
            <IonIcon slot="end" icon={chevronForward}></IonIcon>
          </IonButton>
          <IonButton expand="block" className="settings-button" color="dark">
            <IonIcon slot="start" icon={home}></IonIcon>
            <span className="button-text">My Properties and Bookings</span>
            <IonIcon slot="end" icon={chevronForward}></IonIcon>
          </IonButton>
          <IonButton expand="block" className="settings-button" color="dark">
            <IonIcon slot="start" icon={notifications}></IonIcon>
            <span className="button-text">Notifications</span>
            <IonIcon slot="end" icon={chevronForward}></IonIcon>
          </IonButton>
        </div>
        <div className="ion-padding">
          <IonButton expand="block" color="dark" onClick={handleLogout}>
            <IonIcon slot="start" icon={logOut}></IonIcon>
            Log Out
          </IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Settings;
