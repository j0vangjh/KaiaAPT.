import {
  IonAvatar,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonImg,
  IonLabel,
  IonPage,
  IonTitle,
  IonToolbar,
  IonSpinner,
  IonSegment,
  IonSegmentButton,
  IonRefresher,
  IonRefresherContent,
  RefresherEventDetail,
} from "@ionic/react";
import "./dashboard.css";
import { useEffect, useState } from "react";
import { auth, firestore, storage } from "../../firebaseConfig";

const Dashboard: React.FC = () => {
  const [userPhotoURL, setUserPhotoURL] = useState<string | null>(null);
  const [ownedAssets, setOwnedAssets] = useState<any[]>([]);
  const [soldAssets, setSoldAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [segment, setSegment] = useState<string>("owned");

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

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (user) {
        const doc = await firestore.collection("users").doc(user.uid).get();
        if (doc.exists) {
          const userData = doc.data();
          const walletAddress = userData?.wallet;
          const nfts = userData?.nfts || [];
          const soldNfts = userData?.soldNfts || [];

          const ownedAssets = [];
          const soldAssets = [];

          for (const nft of nfts) {
            const storageRef = storage.ref("metadata");
            const files = await storageRef.listAll();

            for (let fileRef of files.items) {
              const url = await fileRef.getDownloadURL();
              const response = await fetch(url);
              const metadata = await response.json();

              if (metadata.id === nft.id) {
                ownedAssets.push({
                  ...metadata,
                  ownershipPercentage: nft.ownershipPercentage,
                });
                break;
              }
            }
          }

          for (const nft of soldNfts) {
            const storageRef = storage.ref("metadata");
            const files = await storageRef.listAll();

            for (let fileRef of files.items) {
              const url = await fileRef.getDownloadURL();
              const response = await fetch(url);
              const metadata = await response.json();

              if (metadata.id === nft.id) {
                soldAssets.push({
                  ...metadata,
                  ownershipPercentage: nft.ownershipPercentage,
                });
                break;
              }
            }
          }

          setOwnedAssets(ownedAssets);
          setSoldAssets(soldAssets);
        }
      }
    } catch (error) {
      console.error("Error fetching assets:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const handleRefresh = (event: CustomEvent<RefresherEventDetail>): void => {
    fetchAssets().then(() => {
      event.detail.complete();
    });
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Dashboard</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonAvatar slot="end" className="dashboard-avatar">
              <IonImg
                alt="Avatar"
                src={
                  userPhotoURL ||
                  "https://ionicframework.com/docs/img/demos/avatar.svg"
                }
              />
            </IonAvatar>
            <IonTitle size="large">Dashboard</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonCard color="dark">
          <IonCardContent>
            Welcome to your dynamic dashboard where you can have a comprehensive
            overview of your current owned and sold assets!
            <p className="view-more">View more properties ˃</p>
          </IonCardContent>
        </IonCard>
        <div className="ion-padding">
          <IonSegment
            value={segment}
            onIonChange={(e) => setSegment(e.detail.value! as string)}
          >
            <IonSegmentButton value="owned">
              <IonLabel>Owned</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="sold">
              <IonLabel>Sold</IonLabel>
            </IonSegmentButton>
          </IonSegment>
        </div>
        {loading ? (
          <IonSpinner className="spinner" color="primary" name="circular" />
        ) : segment === "owned" ? (
          ownedAssets.length > 0 ? (
            <div className="card-container">
              {ownedAssets.map((asset, index) => (
                <IonCard className="small-card" key={index}>
                  <img alt={asset.name} src={asset.image} />
                  <IonCardHeader>
                    <IonCardTitle>{asset.name}</IonCardTitle>
                    <IonLabel>
                      <strong>Ownership:</strong> {asset.ownershipPercentage}%
                    </IonLabel>
                  </IonCardHeader>
                  <IonCardContent>
                    <p>{asset.location}</p>
                  </IonCardContent>
                </IonCard>
              ))}
            </div>
          ) : (
            <p className="noAssets">No owned assets found.</p>
          )
        ) : soldAssets.length > 0 ? (
          <div className="card-container">
            {soldAssets.map((asset, index) => (
              <IonCard className="small-card" key={index}>
                <img alt={asset.name} src={asset.image} />
                <IonCardHeader>
                  <IonCardTitle>{asset.name}</IonCardTitle>
                  <IonLabel>
                    <strong>Ownership:</strong> {asset.ownershipPercentage}%
                  </IonLabel>
                </IonCardHeader>
                <IonCardContent>
                  <p>{asset.location}</p>
                </IonCardContent>
              </IonCard>
            ))}
          </div>
        ) : (
          <p className="noAssets">No sold assets found.</p>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Dashboard;
