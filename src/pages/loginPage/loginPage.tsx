import {
  IonButton,
  IonContent,
  IonIcon,
  IonInput,
  IonInputPasswordToggle,
  IonPage,
  IonRouterLink,
  IonRow,
  IonText,
} from "@ionic/react";
import "./loginPage.css";
import { useState } from "react";
import firebase from "firebase/app";
import { lockClosed, logoFacebook } from "ionicons/icons";
import { FcGoogle } from "react-icons/fc";
import { auth, facebookProvider, googleProvider } from "../../firebaseConfig";
import { useHistory } from "react-router";

const LoginPage: React.FC = () => {
  const [isTouched, setIsTouched] = useState(false);
  const [isValid, setIsValid] = useState<boolean>();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
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

  const handleGoogleSignIn = async () => {
    try {
      const result = await auth.signInWithPopup(googleProvider);
      const user = result.user;
      if (user) {
        const displayName = user.displayName;
        const photoURL = user.photoURL;
        console.log(displayName, photoURL);
        // Store the user's name and photo URL in localStorage or state management
        localStorage.setItem("userName", displayName || "User");
        localStorage.setItem("userPhotoURL", photoURL || "");

        history.push("/home");
      }
    } catch (error) {
      console.error(error);
      // Handle login error here
    }
  };

  const handleFacebookSignIn = async () => {
    try {
      const result = await auth.signInWithPopup(facebookProvider);
      const user = result.user;
      if (user) {
        const displayName = user.displayName;
        let photoURL = user.photoURL;

        // If photoURL is not available, fetch it from the Facebook Graph API
        if (!photoURL) {
          const accessToken = result.credential
            ? (result.credential as firebase.auth.OAuthCredential).accessToken
            : null;
          const response = await fetch(
            `https://graph.facebook.com/[fb_user_id]/picture`
          );
          const data = await response.json();
          photoURL = data.picture.data.url;
        }

        console.log(displayName, photoURL);
        // Store the user's name and photo URL in localStorage or state management
        localStorage.setItem("userName", displayName || "User");
        localStorage.setItem("userPhotoURL", photoURL || "");

        history.push("/home");
      }
    } catch (error) {
      console.error(error);
      // Handle login error here
    }
  };

  const handleEmailSignIn = async () => {
    try {
      const result = await auth.signInWithEmailAndPassword(email, password);
      const user = result.user;
      if (user) {
        const displayName = user.email;
        console.log(displayName);
        // Store the user's name in localStorage or state management
        localStorage.setItem("userName", email || "User");

        history.push("/home");
      }
    } catch (error) {
      console.error(error);
      setError("Invalid email or password");
      // Handle login error here
    }
  };

  return (
    <IonPage>
      <IonContent fullscreen>
        <IonText color="primary" className="login">
          <strong>Hello,</strong>
        </IonText>
        <IonText color="text" className="login-text">
          <strong>Welcome Back</strong>
        </IonText>
        <div className="ion-margin">
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
            className="input"
            onIonInput={(event) =>
              setPassword((event.target as unknown as HTMLInputElement).value)
            }
          >
            <IonInputPasswordToggle slot="end"></IonInputPasswordToggle>
            <IonIcon icon={lockClosed} slot="start"></IonIcon>
          </IonInput>
          {error && <IonText color="danger">{error}</IonText>}{" "}
          {/* Display error message */}
          <IonRouterLink
            routerLink="/forgotpassword"
            className="forgot-password"
            color="text"
          >
            Forgot your password?
          </IonRouterLink>
        </div>
        <div className="ion-text-center">
          <IonButton
            shape="round"
            size="large"
            className="login-button"
            onClick={handleEmailSignIn}
          >
            Log In
          </IonButton>
        </div>
        <IonText color="text" className="login-alternative">
          <p>OR LOGIN WITH</p>
        </IonText>
        <IonRow className="icon-container">
          <FcGoogle className="icon" onClick={handleGoogleSignIn} />
          <IonIcon
            icon={logoFacebook}
            className="icon facebook-icon"
            onClick={handleFacebookSignIn}
          />
        </IonRow>
        <IonText color="text" className="signup">
          <p>
            New to KaiaAPT?{" "}
            <IonRouterLink color="primary" routerLink="/signup">
              <strong>Sign Up</strong>
            </IonRouterLink>
          </p>
        </IonText>
      </IonContent>
    </IonPage>
  );
};

export default LoginPage;
