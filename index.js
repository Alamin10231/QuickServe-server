const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const port = process.env.PORT || 5000;
require("dotenv").config();
const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://quickserve-f419b.web.app",
      "https://quickserve-f419b.firebaseapp.com",
    ],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
const verifytoken = (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    return res
      .status(401)
      .send({ message: "Unauthorized - No Token Provided" });
  }
  if (!process.env.ACCESS_TOKEN_SECRET) {
    console.error("JWT_SECRET is missing!");
    return res.status(500).json({ message: "Internal Server Error" });
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).send({ message: "Forbidden - Invalid Token" });
    }

    req.user = decoded; // Store decoded user info in `req.user`
    next(); // Proceed to the next middleware
  });
};

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.s3d9m.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const datacollection = client.db("QuiceServe").collection("serve");
    const bookingcollection = client.db("QuiceServe").collection("booking");
    const bookingscollection = client.db("QuiceServe").collection("bookings");

    // viewdetails
    app.get("/viewdetails/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await datacollection.findOne(query);
      res.send(result);
    });
    // Connect the client to the server	(optional starting in v4.7)
    app.get("/", async (req, res) => {
      //                   const query = req.body
      const result = await datacollection.find().toArray();
      res.send(result);
    });
    // add product
    app.get("/addservices/:id", verifytoken, async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await datacollection.findOne(query);
      res.send(result);
    });
    app.post("/addservices", async (req, res) => {
      const data = req.body;
      const result = await datacollection.insertOne(data);
      res.send(result);
    });
    //book now then redirect to the booking page and show data
    app.get("/booking/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await bookingcollection.findOne(query);
      res.send(result);
    });
    app.post("/booking", async (req, res) => {
      const data = req.body;
      const result = await bookingcollection.insertOne(data);
      res.send(result);
    });

    app.get("/bookings", async (req, res) => {
      const result = await bookingscollection.find().toArray();
      res.send(result);
    });
    app.post("/bookings", async (req, res) => {
      const data = req.body;
      const result = await bookingscollection.insertOne(data);
      res.send(result);
    });

    // delete item
    app.delete("/manage/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await datacollection.deleteOne(query);
      res.send(result);
    });
    // update
    // Add this route before other routes
    app.get("/services/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await datacollection.findOne(query);

        res.send(result);
      } catch (error) {
        res.status(500).send({ error: "Server error" });
      }
    });
    app.put("/services/:id", async (req, res) => {
      const { id } = req.params;

      const result = await datacollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: req.body }
      );

      res.send(result);
    });

    // jwt
    app.post("/jwt", async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "69d",
      });
      res
        .cookie("token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        })
        .send({ success: true });
    });
    // jwt delete cookie token

    app.post("/logout", async (req, res) => {
      res
        .cookie("token", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        })
        .send({ success: true });
    });

    // await client.connect();
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log(
    //   "Pinged your deployment. You successfully connected to MongoDB!"
    // );
  } finally {
    // Ensures that the client will close when you finish/error
    //     await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("this is Serversite ...");
});
app.listen(
  port,
  console.log(`The server site is Successfully  Running..${port} `)
);
