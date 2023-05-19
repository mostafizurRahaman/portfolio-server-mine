const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

//  JWT Middleware Function:

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
      const experienceCollections = database.collection('experience'); 
      const skillCollections = database.collection('skills'); 

      // JWT TOKEN && ACCESS  TOKEN :
      app.get("/jwt", async (req, res) => {
         const email = req.query.email;
         console.log(email);
         const user = await userCollection.findOne({ email });
         if (user.email) {
            const playload = {
               email: user.email,
               name: `${user.firstName} ${user.lastName}`,
               date: user.time,
            };
            const token = jwt.sign(playload, accessToken, { expiresIn: "7d" });
            res.status(200).send({ token });
         }
      });

      // user post api:
      app.post("/user", async (req, res) => {
         const newUser = req.body;
         const email = newUser.email;
         const user = await userCollection.findOne({ email });
         if (user?.email) {
            return res.status(200).send({ alreadyHave: true });
         }
         const result = await userCollection.insertOne(newUser);
         res.status(200).send(result);
      });

      app.get("/users", async (req, res) => {
         const query = {};
         const users = await userCollection.find(query).toArray();
         res.send(users);
      });

      // projects apies :
      app.post("/projects", async (req, res) => {
         const project = req.body;
         const result = await projectCollections.insertOne(project);
         console.log(project)
         console.log(result); 
         res.status(200).send(result);
      });

      app.get('/projects', async(req,res )=>{
         const query ={}; 
         const projects = await projectCollections.find(query).toArray(); 
         res.status(200).send(projects); 
      })


      // experience apies : 
      app.post('/experiences', async(req,res)=>{
         const experience = req.body ; 
         const result = await experienceCollections.insertOne(experience); 
         res.status(200).send(result); 
      })
      

      app.get('/experiences', async(req,res)=>{
         const query = {}; 
         const experiences = await experienceCollections.find(query).toArray(); 
         res.status(200).send(experiences); 
      })


      // skills apies : 
      app.post('/skills', async(req,res)=>{
         const skill = req.body; 
         console.log(skill); 
         const result = await skillCollections.insertOne(skill); 
         res.status(200).send(result); 
      })

      app.get('/skills', async(req,res)=>{
         const query = {}; 
         const skills = await skillCollections.find(query).toArray(); 
         res.status(200).send(skills)
      })
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
