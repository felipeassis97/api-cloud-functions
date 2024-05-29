import * as admin from "firebase-admin";
import { onRequest } from "firebase-functions/v2/https";
import * as cors from "cors";
import * as express from "express";
import * as serviceAccount from "../serviceAccountKey.json";
import { Product } from "./product";
const app = express();
app.use(cors({ origin: true }));

// Setup Firebase
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    databaseURL: "https://poc-firestore-functions-default-rtdb.firebaseio.com",
});
const db = admin.firestore();

// Routes
app.get("/hello-world", (_, res) => {
    return res.status(200).send("Hello world!");
});

// Create
app.post("/api/create", (req, res) => {
    (async () => {
        try {
            await db.collection("products").doc("/" + req.body.id + "/").create({
                name: req.body.name,
                description: req.body.description,
                price: req.body.price,
            });
            return res.status(201).send();
        } catch (error) {
            console.log(error);
            return res.status(500).send(error);
        }
    })();
});

// Read
app.get("/api/read/:id", (req, res) => {
    (async () => {
        try {
            const document = db.collection("products").doc(req.params.id);
            const product = await document.get();
            const response = product.data();
            return res.status(200).send(response);
        } catch (error) {
            console.log(error);
            return res.status(500).send(error);
        }
    })();
});

app.get("/api/read", (_, res) => {
    (async () => {
        try {
            const query = db.collection("products");
            const response: Product[] = [];

            await query.get().then((querySnapshot) => {
                const docs = querySnapshot.docs;

                for (const doc of docs) {
                    const selectedItem: Product =
                    {
                        id: parseInt(doc.id),
                        name: doc.data().name,
                        description: doc.data().description,
                        price: doc.data().price,
                    };

                    response.push(selectedItem);
                }
                return response;
            });
            return res.status(200).send(response);
        } catch (error) {
            console.log(error);
            return res.status(500).send(error);
        }
    })();
});

// Update
app.put("/api/update/:id", (req, res) => {
    (async () => {
        try {
            const document = db.collection("products").doc(req.params.id);

            await document.update({
                name: req.body.name,
                description: req.body.description,
                price: req.body.price,

            });

            return res.status(201).send();
        } catch (error) {
            console.log(error);
            return res.status(500).send(error);
        }
    })();
});

// Delete
app.delete("/api/delete/:id", (req, res) => {
    (async () => {
        try {
            const document = db.collection("products").doc(req.params.id);
            await document.delete();
            return res.status(204).send();
        } catch (error) {
            console.log(error);
            return res.status(500).send(error);
        }
    })();
});


// Export the api to Firebase Cloud functions
exports.app = onRequest(app);
