import {
  IonAlert,
  IonButton,
  IonContent,
  IonIcon,
  IonImg,
  IonInput,
  IonInputPasswordToggle,
  IonPage,
  IonText,
} from "@ionic/react";
import { useState } from "react";
import { auth } from "../../firebaseConfig";
import { useHistory } from "react-router-dom";
import firebase from "firebase/app";
import "firebase/auth";
import { lockClosed } from "ionicons/icons";
import "./changePassword.css";

const ChangePassword: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const history = useHistory();

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const user = auth.currentUser;
      if (user && user.email) {
        const credential = firebase.auth.EmailAuthProvider.credential(
          user.email,
          currentPassword
        );
        await user.reauthenticateWithCredential(credential);
        await user.updatePassword(newPassword);
        setShowAlert(true);
      }
    } catch (error) {
      console.error("Error changing password: ", error);
      if ((error as firebase.auth.AuthError).code === "auth/wrong-password") {
        setError("The current password is incorrect.");
      } else {
        setError("Failed to change password. Please try again.");
      }
    }
  };

  const handleAlertClose = () => {
    setShowAlert(false);
    history.push("/settings");
  };

  return (
    <IonPage>
      <IonContent fullscreen>
        <div className="lock-image">
          <IonImg src="Lock.png" alt="Lock" />
        </div>
        <div className="change-password-text">
          <IonText color="primary">
            <h1 className="change-password-header">Change Your Password</h1>
          </IonText>
          <IonText>
            <strong>The password must be different from before</strong>
          </IonText>
        </div>
        <div className="ion-padding change-password-form">
          <IonInput
            type="password"
            placeholder="Current Password"
            className="input-field"
            onIonInput={(e) =>
              setCurrentPassword(
                (e.target as unknown as HTMLInputElement).value
              )
            }
          >
            <IonInputPasswordToggle slot="end"></IonInputPasswordToggle>
            <IonIcon icon={lockClosed} slot="start"></IonIcon>
          </IonInput>
          <IonInput
            type="password"
            placeholder="New Password"
            className="input-field"
            onIonInput={(e) =>
              setNewPassword((e.target as unknown as HTMLInputElement).value)
            }
          >
            <IonInputPasswordToggle slot="end"></IonInputPasswordToggle>
            <IonIcon icon={lockClosed} slot="start"></IonIcon>
          </IonInput>
          <IonInput
            type="password"
            placeholder="Confirm New Password"
            className="input-field"
            onIonInput={(e) =>
              setConfirmPassword(
                (e.target as unknown as HTMLInputElement).value
              )
            }
          >
            <IonInputPasswordToggle slot="end"></IonInputPasswordToggle>
            <IonIcon icon={lockClosed} slot="start"></IonIcon>
          </IonInput>
          {error && <IonText color="danger">{error}</IonText>}
          <div className="ion-text-center">
            <IonButton
              className="change-password-button"
              onClick={handleChangePassword}
              shape="round"
              size="large"
            >
              Change Password
            </IonButton>
            <IonButton
              className="change-password-button"
              routerLink="/settings"
              routerDirection="back"
              shape="round"
              size="large"
              fill="outline"
              color="primary"
            >
              Cancel
            </IonButton>
          </div>
        </div>
        <IonAlert
          isOpen={showAlert}
          onDidDismiss={handleAlertClose}
          message="Your password has been changed successfully"
          buttons={[
            {
              text: "Back to Settings",
              handler: handleAlertClose,
            },
          ]}
        ></IonAlert>
      </IonContent>
    </IonPage>
  );
};

export default ChangePassword;
