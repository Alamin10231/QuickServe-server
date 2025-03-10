const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
const port = process.env.PORT || 5000;
require("dotenv").config();
const app = express();

app.use(cors());
app.use(express.json());

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
    app.get("/addservices/:id", async (req, res) => {
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
    // for pusches button press then go to table and show data
    // app.get("/bookings/:id", async (req, res) => {
    //   const id = req.params.id;
    //   const query = { _id: new ObjectId(id) };
    //   const result = await bookingscollection.findOne(query);
    //   res.send(result);
    // });
    app.get("/bookings", async (req, res) => {
      const result = await bookingscollection.find().toArray();
      res.send(result);
    });
    app.post("/bookings", async (req, res) => {
      const data = req.body;
      const result = await bookingscollection.insertOne(data);
      res.send(result);
    });
    //     app.post("/bookings", async (req, res) => {
    //   const data = req.body;
    //   console.log("Received Data:", data); // ✅ চেক করুন
    //   const result = await bookingscollection.insertOne(data);
    //   console.log("Inserted Result:", result); // ✅ MongoDB তে ইনসার্ট হয়েছে কিনা চেক করুন
    //   res.send(result);
    // });

    // delete item
    app.delete("/manage/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await datacollection.deleteOne(query);
      res.send(result);
    });

    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
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
