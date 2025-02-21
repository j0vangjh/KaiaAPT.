import {
  IonButton,
  IonContent,
  IonIcon,
  IonInput,
  IonInputPasswordToggle,
  IonPage,
  IonRouterLink,
  IonText,
} from "@ionic/react";
import "./signUpPage.css";
import { useState } from "react";
import { lockClosed } from "ionicons/icons";
import { auth } from "../../firebaseConfig";
import { useHistory } from "react-router-dom";

const SignUpPage: React.FC = () => {
  const [isTouched, setIsTouched] = useState(false);
  const [isValid, setIsValid] = useState<boolean>();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const history = useHistory();

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

  const markTouched = () => {
    setIsTouched(true);
  };

  const handleSignUp = async () => {
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const userCredential = await auth.createUserWithEmailAndPassword(
        email,
        password
      );
      const user = userCredential.user;
      if (user) {
        // Store the user's name and photo URL in localStorage or state management
        localStorage.setItem("userName", user.email || "User");

        history.push("/signupsuccess");
      }
    } catch (error) {
      console.error("Error signing up: ", error);
    }
  };

  return (
    <IonPage>
      <IonContent fullscreen>
        <IonText color="primary" className="signUp">
          <strong>Sign Up</strong>
        </IonText>
        <IonText color="text" className="signup-text">
          <strong>Sign up and explore the marketplace</strong>
        </IonText>
        <div className="ion-margin signup-form">
          <IonInput
            className={`${isValid && "ion-valid"} ${
              isValid === false && "ion-invalid"
            } ${isTouched && "ion-touched"}`}
            type="email"
            fill="solid"
            label="Email"
            labelPlacement="floating"
            helperText="Enter a valid email"
            errorText="Invalid email"
            onIonInput={(event) => {
              validate(event);
              setEmail((event.target as unknown as HTMLInputElement).value);
            }}
            onIonBlur={() => markTouched()}
          ></IonInput>
          <IonInput
            type="password"
            label=""
            placeholder="Enter your password"
            className="input-field"
            onIonInput={(event) =>
              setPassword((event.target as unknown as HTMLInputElement).value)
            }
          >
            <IonInputPasswordToggle slot="end"></IonInputPasswordToggle>
            <IonIcon icon={lockClosed} slot="start"></IonIcon>
          </IonInput>
          <IonInput
            type="password"
            label=""
            placeholder="Confirm your password"
            className="input-field"
            onIonInput={(event) =>
              setConfirmPassword(
                (event.target as unknown as HTMLInputElement).value
              )
            }
          >
            <IonInputPasswordToggle slot="end"></IonInputPasswordToggle>
            <IonIcon icon={lockClosed} slot="start"></IonIcon>
          </IonInput>
          {error && <IonText color="danger">{error}</IonText>}{" "}
          {/* Display error message */}
        </div>
        <div className="ion-text-center">
          <IonButton
            shape="round"
            size="large"
            className="signup-button"
            onClick={handleSignUp}
          >
            Sign Up
          </IonButton>
        </div>
        <IonText color="text" className="logIn">
          <p>
            Already a member?{" "}
            <IonRouterLink
              color="primary"
              routerLink="/login"
              routerDirection="back"
            >
              <strong>Log In</strong>
            </IonRouterLink>
          </p>
        </IonText>
      </IonContent>
    </IonPage>
  );
};

export default SignUpPage;
