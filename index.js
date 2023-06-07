const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

//  JWT Middleware Function:
const verifyJWT = (req, res, next) => {
   const authHeaders = req.headers.authorization;
   console.log(authHeaders.split(" "), authHeaders);
   if (!authHeaders) {
      console.log("UnAuthorized");
      return res.status(401).send({ message: "UnAuthorized User" });
   }

   const token = authHeaders.split(" ")[1];
   jwt.verify(token, process.env.Access_TOKEN, (error, decoded) => {
      if (error) {
         return res.status(403).send({ message: "Forbidden User" });
      }

      req.docoded = decoded;
      next();
   });
};
//  middlewares :
app.use(cors());
app.use(express.json());
const accessToken = process.env.Access_TOKEN;
// database setup is here :
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.4nkvsmn.mongodb.net/?retryWrites=true&w=majority`;

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
      const database = client.db("mostafizur_rahaman_portfolio");
      const userCollection = database.collection("users");
      const projectCollections = database.collection("projects");
      const experienceCollections = database.collection("experience");
      const skillCollections = database.collection("skills");
      const testimonialCollections = database.collection("testimonials");
      // JWT TOKEN && ACCESS  TOKEN :
      const verifyAdmin = async (req, res, next) => {
         const decodedEmail = req.docoded.email;
         const user = await userCollection.findOne({ email: decodedEmail });
         if (user?.role !== "admin") {
            return res.status(401).send({ message: "UnAuthorized User" });
         }
         console.log("admin role checking...");
         next();
      };

      app.get("/jwt", async (req, res) => {
         const email = req.query.email;
         const user = await userCollection.findOne({ email });
         if (user.email) {
            const playload = {
               email: user.email,
               name: `${user.firstName} ${user.lastName}`,
               date: user.time,
            };
            const token = jwt.sign(playload, accessToken, { expiresIn: "7d" });
            return res.status(200).send({ token });
         }
         return res.status(401).send({ message: "UnAuthorized user" });
      });

      // user post api:
      app.post("/users", async (req, res) => {
         const newUser = req.body;
         const email = newUser.email;
         const user = await userCollection.findOne({ email });
         if (user?.email) {
            return res.status(200).send({ alreadyHave: true });
         }
         const result = await userCollection.insertOne(newUser);
         res.status(200).send(result);
      });

      app.get("/users", verifyJWT, verifyAdmin, async (req, res) => {
         const query = {};
         const users = await userCollection.find(query).toArray();
         res.send(users);
      });

      app.get("/users/admin", verifyJWT, async (req, res) => {
         const email = req.query.email;
         const query = { email };

         const user = await userCollection.findOne(query);
         if (user?.role === "admin") {
            return res.status(200).send({ isAdmin: true });
         }
         return res.status(401).send({ isAdmin: false });
      });

      // projects apies :
      app.post("/projects", verifyJWT, verifyAdmin, async (req, res) => {
         const project = req.body;
         const result = await projectCollections.insertOne(project);
         console.log(project);
         console.log(result);
         res.status(200).send(result);
      });

      app.get("/projects", async (req, res) => {
         const query = {};
         const projects = await projectCollections.find(query).toArray();
         res.status(200).send(projects);
      });

      app.delete("/projects/:id", verifyJWT, verifyAdmin, async (req, res) => {
         const id = req.params.id;
         const query = { _id: new ObjectId(id) };
         const result = await projectCollections.deleteOne(query);
         res.send(result);
      });

      app.get('/projects/:id', async(req,res)=>{
         const id = req.params.id; 
         const query = {_id:new ObjectId(id)}; 
         const result = await projectCollections.findOne(query); 
         res.status(200).send(result); 
      })

      // experience apies :
      app.post("/experiences", verifyJWT, verifyAdmin, async (req, res) => {
         const experience = req.body;
         const result = await experienceCollections.insertOne(experience);
         res.status(200).send(result);
      });

      app.get("/experiences", async (req, res) => {
         const query = {};
         const experiences = await experienceCollections.find(query).toArray();
         res.status(200).send(experiences);
      });

      app.delete(
         "/experiences/:id",
         verifyJWT,
         verifyAdmin,
         async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await experienceCollections.deleteOne(query);
            console.log(result);
            res.status(200).send(result);
         }
      );

      // skills apies :
      app.post("/skills", verifyJWT, verifyAdmin, async (req, res) => {
         const skill = req.body;
         console.log(skill);
         const result = await skillCollections.insertOne(skill);
         res.status(200).send(result);
      });

      app.get("/skills", async (req, res) => {
         const query = {};
         const skills = await await skillCollections
            .find(query)
            .sort({ percentage: -1 })
            .toArray();
         res.status(200).send(skills);
      });

      app.delete("/skills/:id", async (req, res) => {
         const id = req.params.id;
         const query = { _id: new ObjectId(id) };
         const result = await skillCollections.deleteOne(query);
         res.status(200).send(result);
      });
      //  testimonials apies :
      app.post("/testimonials", verifyJWT, verifyAdmin, async (req, res) => {
         const testimonial = req.body;
         const result = await testimonialCollections.insertOne(testimonial);
         res.status(200).send(result);
      });
      app.delete(
         "/testimonials/:id",
         verifyJWT,
         verifyAdmin,
         async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await testimonialCollections.deleteOne(query);
            res.status(200).send(result);
         }
      );
      app.get("/testimonials", async (req, res) => {
         const query = {};
         const testimonials = await testimonialCollections
            .find(query)
            .toArray();
         res.status(200).send(testimonials);
      });
   } finally {
   }
}
run().catch(console.dir);

app.get("/", (req, res) => {
   res.send({ message: "server is running now" });
});

app.listen(port, () => {
   console.log(`Mostafizur Portfolio Server is running on : ${port}`);
});
