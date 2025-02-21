import firebaseAdmin from 'firebase-admin';
import { v4 as uuidv4 } from 'uuid';
import serviceAccount from './serviceAccount.json' assert { type: 'json' };
import fs from 'fs';
import path from 'path';

const admin = firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(serviceAccount),
  storageBucket: 'gs://kaiaapt.firebasestorage.app',
});

const storageRef = admin.storage().bucket();

async function uploadFile(filePath, fileName) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  const storage = await storageRef.upload(filePath, {
    public: true,
    destination: `metadata/${fileName}`,
    metadata: {
      metadata: {
        firebaseStorageDownloadTokens: uuidv4(),
      },
    },
  });
  return storage;
}

(async () => {
  try {
    const metadataDir = './metadata';
    const files = fs.readdirSync(metadataDir);

    for (const fileName of files) {
      const filePath = path.resolve(metadataDir, fileName);
      await uploadFile(filePath, fileName);
      console.log(`Uploaded file: ${fileName}`);
    }
  } catch (error) {
    console.error('Error uploading file:', error);
  }
})();