import {
  IonButton,
  IonContent,
  IonInput,
  IonPage,
  IonText,
  IonAlert,
  IonImg,
} from "@ionic/react";
import { useState } from "react";
import { auth } from "../../firebaseConfig";
import { useHistory } from "react-router-dom";
import "./forgotPassword.css";

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const history = useHistory();
  const [isValid, setIsValid] = useState<boolean>();
  const [isTouched, setIsTouched] = useState(false);

  const validateEmail = (email: string) => {
    return email.match(
      /^(?=.{1,254}$)(?=.{1,64}@)[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
    );
  };

  const validate = (event: Event) => {
    const value = (event.target as HTMLInputElement).value;

    setIsValid(undefined);

    if (value === "") return;

    validateEmail(value) !== null ? setIsValid(true) : setIsValid(false);
  };

  const handleForgotPassword = async () => {
    try {
      await auth.sendPasswordResetEmail(email);
      setShowAlert(true);
    } catch (error) {
      console.error("Error sending password reset email: ", error);
    }
  };

  const handleAlertClose = () => {
    setShowAlert(false);
    history.push("/login");
  };

  return (
    <IonPage>
      <IonContent fullscreen>
        <div className="lock-image">
          <IonImg src="Lock.png" alt="Lock" />
        </div>
        <div className="reset-password ion-padding">
          <IonText color="primary">
            <h1 className="reset-password">Forgot Password?</h1>
          </IonText>
          <IonText>
            <strong>
              Enter your email account <br /> to reset your password
            </strong>
          </IonText>
        </div>
        <div className="ion-margin-start ion-margin-end forgot-password-form">
          <IonInput
            type="email"
            placeholder="Enter your email"
            className={`${isValid && "ion-valid"} ${
              isValid === false && "ion-invalid"
            } ${isTouched && "ion-touched"} input-field`}
            fill="solid"
            label="Email"
            labelPlacement="floating"
            helperText="Enter a valid email"
            errorText="Invalid email"
            onIonInput={(event) => {
              validate(event);
              setEmail((event.target as unknown as HTMLInputElement).value);
            }}
          />
          {error && <IonText color="danger">{error}</IonText>}
          <div className="ion-text-center">
            <IonButton
              className="reset-button"
              onClick={handleForgotPassword}
              shape="round"
              size="large"
            >
              Send Reset Link
            </IonButton>
            <IonButton
              className="reset-button"
              routerLink="/login"
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
          header={"Success"}
          message={"Password reset link has been sent to your email"}
          buttons={[
            {
              text: "Back to Login",
              handler: handleAlertClose,
            },
          ]}
        />
      </IonContent>
    </IonPage>
  );
};

export default ForgotPassword;
