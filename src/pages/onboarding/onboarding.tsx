import {
  IonButton,
  IonContent,
  IonImg,
  IonPage,
  IonRouterLink,
  IonText,
} from "@ionic/react";
import "./onboarding.css";

const Onboarding: React.FC = () => {
  return (
    <IonPage>
      <IonContent fullscreen>
        <IonImg
          src="OnboardingPage.png"
          alt="onboarding"
          className="onboarding"
        />
        <IonText color="text" className="onboarding-text">
          <strong>Discover The Largest NFT Assets Marketplace</strong>
        </IonText>
        <IonText color="text" className="onboarding-text">
          <p>
            You can find your dream home or sell your property with
            non-exchangable tokens
          </p>
        </IonText>
        <IonRouterLink routerLink="/login">
          <IonButton shape="round" size="large" className="onboarding-button">
            Get Started
          </IonButton>
        </IonRouterLink>
      </IonContent>
    </IonPage>
  );
};

export default Onboarding;
