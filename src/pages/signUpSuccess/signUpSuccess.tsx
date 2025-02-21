import { IonButton, IonContent, IonImg, IonPage, IonText } from "@ionic/react";
import "./signUpSuccess.css";

const SignUpSuccess: React.FC = () => {
  return (
    <IonPage>
      <IonContent fullscreen>
        <IonImg src="Tick.png" alt="Success" className="success-image" />
        <div className="success-text">
          <IonText className="success-text" color="primary">
            <h1>Congratulations,</h1>
          </IonText>
          <IonText>
            <h2>your account has been created successfully</h2>
          </IonText>
          <p>Explore your first asset now!</p>
        </div>
        <div className="ion-text-center">
          <IonButton
            shape="round"
            size="large"
            className="success-button"
            routerLink="/login"
          >
            Continue
          </IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default SignUpSuccess;
