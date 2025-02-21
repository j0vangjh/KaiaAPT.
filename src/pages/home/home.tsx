import {
  IonAvatar,
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonChip,
  IonContent,
  IonHeader,
  IonIcon,
  IonImg,
  IonLabel,
  IonPage,
  IonRefresher,
  IonRefresherContent,
  IonSearchbar,
  IonText,
  IonTitle,
  IonToolbar,
  IonSkeletonText,
  RefresherEventDetail,
} from "@ionic/react";
import "./home.css";
import { filterOutline } from "ionicons/icons";
import { useEffect, useState } from "react";
import { auth, storage } from "../../firebaseConfig";
import { Link } from "react-router-dom";

const Home: React.FC = () => {
  const [userName, setUserName] = useState<string | null>(null);
  const [userPhotoURL, setUserPhotoURL] = useState<string | null>(null);
  const [nfts, setNfts] = useState<any[]>([]);
  const [searchText, setSearchText] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true); // 🔹 Add loading state

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        const name = user.displayName;
        const email = user.email;
        let photoURL = localStorage.getItem("userPhotoURL");

        if (email === "heyimsyed123@gmail.com") {
          photoURL = "syed profile.jpg"; // Path to your asset
        }

        setUserName(name);
        setUserPhotoURL(photoURL);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    const fetchNFTMetadata = async () => {
      try {
        setLoading(true); // 🔹 Start loading

        // Reference to the metadata folder in Firebase Storage
        const storageRef = storage.ref("metadata");

        // List all files in the metadata folder
        const files = await storageRef.listAll();

        // Fetch each file and parse its content
        const nftData = await Promise.all(
          files.items.map(async (file) => {
            const url = await file.getDownloadURL();
            const response = await fetch(url);
            const data = await response.json();
            return data;
          })
        );

        setNfts(nftData); // Store the metadata in state
      } catch (error) {
        console.error("Error fetching NFT metadata:", error);
      } finally {
        setLoading(false); // 🔹 Stop loading
      }
    };

    fetchNFTMetadata();
  }, []);

  const filteredNfts = nfts.filter(
    (nft) =>
      nft.name.toLowerCase().includes(searchText.toLowerCase()) ||
      nft.location.toLowerCase().includes(searchText.toLowerCase())
  );

  const trendingProperties = filteredNfts.filter(
    (nft) => nft.id >= 1 && nft.id <= 8
  );
  const luxuryAssets = filteredNfts.filter(
    (nft) => nft.id >= 9 && nft.id <= 11
  );

  const handleRefresh = (event: CustomEvent<RefresherEventDetail>): void => {
    setTimeout(() => {
      const name = localStorage.getItem("userName");
      const photoURL = localStorage.getItem("userPhotoURL");

      setUserName(name);
      setUserPhotoURL(photoURL);
      event.detail.complete();
    }, 2000);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Hello!</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonAvatar slot="end" className="home-avatar">
              <IonImg
                alt="Avatar"
                src={
                  userPhotoURL ||
                  "https://ionicframework.com/docs/img/demos/avatar.svg"
                }
              />
            </IonAvatar>
            <div className="title">
              <IonTitle size="large" color="primary">
                Hello!
              </IonTitle>
              <h3 className="name">{userName}</h3>
            </div>
          </IonToolbar>
        </IonHeader>
        <div className="searchbar-filter ion-padding">
          <IonSearchbar
            color="dark"
            className="searchbar"
            value={searchText}
            onIonInput={(e) => setSearchText(e.detail.value!)}
          ></IonSearchbar>
          <IonButton color="tertiary">
            <IonIcon slot="start" icon={filterOutline}></IonIcon>
            Filter
          </IonButton>
        </div>

        {/* Trending Properties Section */}
        <div className="trending-properties">
          <IonText>
            <h1 className="trending">Trending Properties</h1>
          </IonText>
          <IonLabel color="tertiary" className="view">
            View all ˃
          </IonLabel>
        </div>

        <div className="card-container">
          {loading
            ? Array.from({ length: 4 }).map(
                (
                  _,
                  index // 🔹 Show 4 skeletons
                ) => (
                  <IonCard className="small-card" key={index}>
                    <IonSkeletonText animated={true} className="nft-image" />
                    <IonCardHeader>
                      <IonCardTitle>
                        <IonSkeletonText
                          animated={true}
                          style={{ width: "60%" }}
                        />
                      </IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent>
                      <IonSkeletonText
                        animated={true}
                        style={{ width: "40%" }}
                      />
                    </IonCardContent>
                  </IonCard>
                )
              )
            : trendingProperties.map((nft) => (
                <Link to={`/detail-page/${nft.id}`} key={nft.id}>
                  <IonCard className="small-card">
                    <img alt={nft.name} src={nft.image} className="nft-image" />
                    <IonCardHeader>
                      <IonCardTitle className="nft-name">
                        {nft.name}
                      </IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent>
                      <p>{nft.location}</p>
                    </IonCardContent>
                  </IonCard>
                </Link>
              ))}
        </div>

        {/* Luxury Assets Section */}
        <div className="trending-properties">
          <IonText>
            <h1 className="trending">Luxury Assets</h1>
          </IonText>
          <IonLabel color="tertiary" className="view-all">
            View all ˃
          </IonLabel>
        </div>

        <div className="card-container">
          {loading
            ? Array.from({ length: 3 }).map(
                (
                  _,
                  index // 🔹 Show 3 skeletons
                ) => (
                  <IonCard className="small-card" key={index}>
                    <IonSkeletonText animated={true} className="nft-image" />
                    <IonCardHeader>
                      <IonCardTitle>
                        <IonSkeletonText
                          animated={true}
                          style={{ width: "60%" }}
                        />
                      </IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent>
                      <IonSkeletonText
                        animated={true}
                        style={{ width: "40%" }}
                      />
                    </IonCardContent>
                  </IonCard>
                )
              )
            : luxuryAssets.map((nft) => (
                <Link to={`/detail-page/${nft.id}`} key={nft.id}>
                  <IonCard className="small-card">
                    <img alt={nft.name} src={nft.image} className="nft-image" />
                    <IonCardHeader>
                      <IonCardTitle className="nft-name">
                        {nft.name}
                      </IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent>
                      <p className="nft-location">{nft.location}</p>
                    </IonCardContent>
                  </IonCard>
                </Link>
              ))}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Home;
