import React, { useEffect } from "react";
import "./splashScreen.css";
import { IonContent, IonImg, IonPage } from "@ionic/react";

const SplashScreen: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <IonPage>
      <IonContent fullscreen>
        <IonImg src="SplashPage.png" alt="splash" className="splash" />
      </IonContent>
    </IonPage>
  );
};

export default SplashScreen;
