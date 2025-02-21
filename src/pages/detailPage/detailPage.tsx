import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  IonAlert,
  IonBackButton,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonInput,
  IonPage,
  IonSpinner,
  IonText,
} from "@ionic/react";
import { storage, auth, firestore } from "../../firebaseConfig";
import { ethers } from "ethers";
import RealEstateNFT from "../../contracts/RealEstateNFT.json";
import StableCoin from "../../contracts/CustomStableCoin.json";
import "./detailPage.css";
import firebase from "firebase";

interface FractionalOwnership {
  tokenId: string;
  owner: string;
  ownershipPercentage: number;
}

const DetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [nft, setNft] = useState<any>(null);
  const [ownershipPercentage, setOwnershipPercentage] = useState<number>(0);
  const [userOwnership, setUserOwnership] = useState<number>(0);
  const [totalOwnership, setTotalOwnership] = useState<number>(0);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<string>("");
  const [approving, setApproving] = useState<boolean>(false);

  const nftContractAddress = "0x03C1d4642ebd24624Db44c3e8f6ed0dAa88bDF29";
  const stableCoinAddress = "0xcE7AB8B5e1a88aAE11b534ba8b24754dA96b365D";

  const fetchUserOwnership = async (
    userId: string,
    nftId: string
  ): Promise<number> => {
    const doc = await firestore.collection("users").doc(userId).get();
    if (!doc.exists) return 0;

    const userNFTs = doc.data()?.nfts || [];
    const ownedNFT = userNFTs.find((nft: { id: string }) => nft.id === nftId);
    return ownedNFT ? Number(ownedNFT.ownershipPercentage) : 0;
  };

  const fetchBlockchainOwnership = async (
    contract: ethers.Contract,
    tokenId: string,
    userAddress: string
  ): Promise<{ userOwnership: number; totalOwnership: number }> => {
    try {
      const owners = await contract.getOwnershipDetails(tokenId);

      let userTotal = 0;
      let total = 0;

      for (const owner of owners) {
        if (owner.owner.toLowerCase() === userAddress.toLowerCase()) {
          userTotal += Number(owner.ownershipPercentage);
        }
        total += Number(owner.ownershipPercentage);
      }

      return {
        userOwnership: userTotal,
        totalOwnership: total,
      };
    } catch (error) {
      console.error("Error fetching blockchain ownership:", error);
      return {
        userOwnership: 0,
        totalOwnership: 0,
      };
    }
  };

  useEffect(() => {
    const fetchNFTDetails = async () => {
      setLoading(true);
      try {
        const storageRef = storage.ref("metadata");
        const files = await storageRef.listAll();

        for (let fileRef of files.items) {
          const url = await fileRef.getDownloadURL();
          const response = await fetch(url);
          const data = await response.json();

          if (data.id === id) {
            setNft(data);
            break;
          }
        }

        const user = auth.currentUser;
        if (user) {
          const doc = await firestore.collection("users").doc(user.uid).get();
          if (doc.exists) {
            const wallet = doc.data()?.wallet;
            setWalletAddress(wallet);

            if (wallet) {
              const provider = new ethers.providers.Web3Provider(
                window.ethereum
              );
              const signer = provider.getSigner();
              const contract = new ethers.Contract(
                nftContractAddress,
                RealEstateNFT.abi,
                signer
              );

              // Get blockchain ownership
              const {
                userOwnership: blockchainOwnership,
                totalOwnership: blockchainTotal,
              } = await fetchBlockchainOwnership(contract, id, wallet);

              // Get Firebase ownership
              const firebaseOwnership = await fetchUserOwnership(user.uid, id);

              // Calculate total user ownership
              const totalUserOwnership =
                blockchainOwnership + firebaseOwnership;

              console.log({
                blockchainOwnership,
                firebaseOwnership,
                totalUserOwnership,
                totalOwnership: blockchainTotal,
              });

              setUserOwnership(firebaseOwnership);
              setTotalOwnership(blockchainTotal);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching NFT details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNFTDetails();
  }, [id]);

  const updateTotalOwnershipForAllUsers = async (
    nftId: string,
    newTotalOwnership: number
  ) => {
    try {
      // Get all users who own this NFT
      const usersSnapshot = await firestore
        .collection("users")
        .where(`nfts`, "array-contains", { id: nftId })
        .get();

      // Batch write to update all users
      const batch = firestore.batch();

      usersSnapshot.docs.forEach((userDoc) => {
        const userData = userDoc.data();
        const userNFTs = userData.nfts || [];

        // Find and update the specific NFT
        const updatedNFTs = userNFTs.map((nft: any) => {
          if (nft.id === nftId) {
            return {
              ...nft,
              totalOwnership: newTotalOwnership,
            };
          }
          return nft;
        });

        // Update the user document
        batch.update(userDoc.ref, { nfts: updatedNFTs });
      });

      // Commit the batch
      await batch.commit();
    } catch (error) {
      console.error("Error updating total ownership for all users:", error);
      throw error;
    }
  };

  const handleBuy = async () => {
    if (!auth.currentUser) {
      setAlertMessage("Please login to buy NFTs.");
      setShowAlert(true);
      return;
    }

    if (!walletAddress) {
      setAlertMessage("Wallet address not found.");
      setShowAlert(true);
      return;
    }

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      // Get stablecoin contract
      const stableCoinContract = new ethers.Contract(
        stableCoinAddress,
        StableCoin.abi,
        signer
      );

      // Calculate price in wei
      const totalPrice = ethers.utils.parseUnits(
        ((nft.price * ownershipPercentage) / 100).toString(),
        18
      );

      // Check token balance
      const balance = await stableCoinContract.balanceOf(walletAddress);
      if (balance.lt(totalPrice)) {
        setAlertMessage(
          `Insufficient JT balance. You need ${ethers.utils.formatUnits(
            totalPrice,
            18
          )} JT`
        );
        setShowAlert(true);
        return;
      }

      // Check existing allowance
      const allowance = await stableCoinContract.allowance(
        walletAddress,
        nftContractAddress
      );

      if (allowance.lt(totalPrice)) {
        console.log("Approving JT transfer...");
        setApproving(true); // Set approving state to true

        try {
          const approvalTx = await stableCoinContract.approve(
            nftContractAddress,
            totalPrice
          );
          await approvalTx.wait(); // Wait for confirmation
          console.log("Approval successful");
        } catch (error) {
          console.error("Approval failed:", error);
          setAlertMessage(
            "Failed to approve token transfer. Please try again."
          );
          setShowAlert(true);
          setApproving(false); // Reset approving state
          return;
        } finally {
          setApproving(false); // Ensure approving state is reset
        }
      }

      // Get NFT contract
      const nftContract = new ethers.Contract(
        nftContractAddress,
        RealEstateNFT.abi,
        signer
      );

      // Refresh ownership data before proceeding
      const currentFirebaseOwnership = await fetchUserOwnership(
        auth.currentUser.uid,
        id
      );
      const {
        userOwnership: blockchainOwnership,
        totalOwnership: currentTotalOwnership,
      } = await fetchBlockchainOwnership(nftContract, id, walletAddress);

      const actualTotalOwnership = blockchainOwnership;

      // Validate ownership limits
      if (
        !ownershipPercentage ||
        ownershipPercentage <= 0 ||
        ownershipPercentage > 10
      ) {
        setAlertMessage("You can only buy between 1% and 10% ownership.");
        setShowAlert(true);
        return;
      }

      if (currentTotalOwnership + ownershipPercentage > 100) {
        setAlertMessage("This property is already fully owned.");
        setShowAlert(true);
        return;
      }

      if (actualTotalOwnership >= 10) {
        setAlertMessage("You already own the maximum 10% of this NFT.");
        setShowAlert(true);
        return;
      }

      if (actualTotalOwnership + ownershipPercentage > 10) {
        setAlertMessage("You cannot exceed 10% ownership.");
        setShowAlert(true);
        return;
      }

      setLoading(true); // Start loading state for buying process

      // Execute the buy transaction
      console.log("Buying fractional ownership...");
      const tx = await nftContract.buyFraction(
        id,
        ownershipPercentage,
        totalPrice,
        {
          gasLimit: 500000, // Add explicit gas limit
        }
      );

      console.log("Transaction sent:", tx.hash);
      await tx.wait(); // Wait for transaction confirmation
      console.log("Transaction confirmed");

      const newTotalOwnership = currentTotalOwnership + ownershipPercentage;

      // Update Firebase for all users first
      await updateTotalOwnershipForAllUsers(id, newTotalOwnership);

      // Update Firebase
      if (auth.currentUser) {
        const userRef = firestore.collection("users").doc(auth.currentUser.uid);
        const userDoc = await userRef.get();
        const existingNFTs = userDoc.data()?.nfts || [];

        const existingNFTIndex = existingNFTs.findIndex(
          (nft: { id: string }) => nft.id === id
        );

        if (existingNFTIndex >= 0) {
          existingNFTs[existingNFTIndex].ownershipPercentage +=
            ownershipPercentage;
          existingNFTs[existingNFTIndex].totalOwnership = newTotalOwnership;

          await userRef.update({ nfts: existingNFTs });
        } else {
          await userRef.update({
            nfts: firebase.firestore.FieldValue.arrayUnion({
              id: id,
              ownershipPercentage: ownershipPercentage,
              totalOwnership: newTotalOwnership,
            }),
          });
        }
      }

      setAlertMessage(
        `You successfully bought ${ownershipPercentage}% ownership!`
      );
      setShowAlert(true);
      setUserOwnership(actualTotalOwnership + ownershipPercentage);
      setTotalOwnership(newTotalOwnership);
    } catch (error) {
      console.error("Transaction failed:", error);

      // Handle specific error messages
      const errorMessage = (error as any).message;
      if (errorMessage.includes("insufficient funds")) {
        setAlertMessage("Insufficient funds to cover gas fees.");
      } else if ((error as any).message.includes("user rejected")) {
        setAlertMessage("Transaction was rejected.");
      } else {
        setAlertMessage(
          "Transaction failed. Please make sure you have enough JT tokens and try again."
        );
      }

      setShowAlert(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonButtons slot="start" className="back-button">
          <IonBackButton></IonBackButton>
        </IonButtons>
      </IonHeader>
      <IonContent>
        {loading ? (
          <IonSpinner className="spinner" color="primary" name="circular" />
        ) : nft ? (
          <IonCard>
            <img alt={nft.name} src={nft.image} />
            <IonCardHeader>
              <IonCardTitle>{nft.name}</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <p>{nft.description}</p>
              <p>
                <strong>Price:</strong> {nft.price} JT
              </p>
              <p>
                <strong>Location:</strong> {nft.location}
              </p>
              <p>
                <strong>Your Ownership:</strong> {userOwnership}%
              </p>
              <p>
                <strong>Total Ownership:</strong> {totalOwnership}%
              </p>
            </IonCardContent>
          </IonCard>
        ) : (
          <p>No NFT details found.</p>
        )}
        <div className="ion-text-center">
          <IonText color="primary">1 JT = USD$10,000</IonText>
          <br />
          <IonText color="primary">You can only own a maximum of 10%</IonText>
        </div>
        <div className="buy-section ion-text-center">
          <h3>Buy Fractional Ownership</h3>
          <div className="input-container">
            <IonInput
              type="number"
              onIonInput={(e) => {
                const value = Number(
                  (e.target as unknown as HTMLInputElement).value
                );
                setOwnershipPercentage(isNaN(value) ? 0 : value);
              }}
              placeholder="Enter percentage"
            />
            <span className="percentage-symbol">%</span>
          </div>
          <div>
            <IonButton
              onClick={handleBuy}
              disabled={
                loading ||
                approving ||
                totalOwnership >= 100 ||
                (userOwnership >= 10 && nft?.id === id) ||
                ownershipPercentage <= 0 ||
                ownershipPercentage > 10
              }
            >
              {approving
                ? "Approving..."
                : loading
                ? "Processing..."
                : totalOwnership >= 100
                ? "Fully Owned"
                : userOwnership >= 10
                ? "Max Ownership Reached"
                : "Buy"}
            </IonButton>
          </div>
        </div>
        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          header={"Alert"}
          message={alertMessage}
          buttons={["Ok"]}
        />
      </IonContent>
    </IonPage>
  );
};

export default DetailPage;
