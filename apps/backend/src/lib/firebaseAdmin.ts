import admin from "firebase-admin";
import path from "path";

import "dotenv/config";

// Load the JSON
const serviceAccount = require(path.resolve(
  __dirname,
  "../../service-account.json"
));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export { admin };
