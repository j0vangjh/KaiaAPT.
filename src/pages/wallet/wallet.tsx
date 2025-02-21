import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonAvatar,
  IonImg,
  IonButton,
  IonText,
  IonChip,
  useIonToast,
} from "@ionic/react";
import "./wallet.css";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { auth, firestore } from "../../firebaseConfig";

const Wallet: React.FC = () => {
  const [userPhotoURL, setUserPhotoURL] = useState<string | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [present, dismiss] = useIonToast();

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        const email = user.email;
        let photoURL = localStorage.getItem("userPhotoURL");

        if (email === "heyimsyed123@gmail.com") {
          photoURL = "syed profile.jpg"; // Path to your asset
        }

        setUserPhotoURL(photoURL);
      }
    };

    fetchUserData();
  }, []);

  const connectMetaMask = async () => {
    try {
      if (!window.ethereum) {
        alert("Please install MetaMask to connect your wallet.");
        return;
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const address = await signer.getAddress();

      const user = auth.currentUser;
      if (user) {
        await firestore.collection("users").doc(user.uid).set(
          {
            wallet: address,
            email: user.email,
          },
          { merge: true }
        );
        setWalletAddress(address);
        console.log("Wallet connected and saved to Firebase:", address);
        present({
          message: "✔️ Wallet connected successfully!",
          duration: 2000,
          position: "top",
          color: "success",
        });
      }
    } catch (error) {
      console.error("Error connecting MetaMask:", error);
      present({
        message: "⚠️ Error connecting MetaMask. Please try again.",
        duration: 2000,
        position: "top",
        color: "danger",
      });
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>My Wallet</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonAvatar slot="end" className="wallet-avatar">
              <IonImg
                alt="Avatar"
                src={
                  userPhotoURL ||
                  "https://ionicframework.com/docs/img/demos/avatar.svg"
                }
              />
            </IonAvatar>
            <IonTitle size="large">My Wallet</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonText className="wallet-text">
          <h5>
            If you don't have a wallet yet, you can select a provider and create
            one now
          </h5>
        </IonText>
        <div className="ion-padding">
          <IonButton
            fill="outline"
            expand="block"
            shape="round"
            onClick={connectMetaMask}
          >
            <IonImg
              src="Metamask.png"
              alt="MetaMask"
              className="wallet-image"
            />
            <span className="button-text">MetaMask</span>
            <div className="ion-text-end">
              <IonChip className="wallet-chip">Popular</IonChip>
            </div>
          </IonButton>

          <IonButton
            fill="outline"
            expand="block"
            className="wallet-button"
            shape="round"
          >
            <IonImg
              src="Coinbase.png"
              alt="Coinbase"
              className="wallet-image"
            />
            <span className="button-text">Coinbase Wallet</span>
          </IonButton>
          <IonButton
            fill="outline"
            expand="block"
            className="wallet-button"
            shape="round"
          >
            <IonImg
              src="WalletConnect.png"
              alt="WalletConnect"
              className="wallet-image"
            />
            <span className="button-text">WalletConnect</span>
          </IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Wallet;
