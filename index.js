const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;
const app = express ();
require('dotenv').config();

app.use (cors())
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.bkf4wz6.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req, res, next) {
    const authTokenHeader = req.headers["authorization"];
    if (!authTokenHeader) {
      return res.status(401).send({
        success: false,
        error: "Unauthorized Access!",
      });
    }
    const token = authTokenHeader.split(" ")[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        res.json({ success: false, error: "You failed to authenticate!" });
      } else {
        req.decoded = decoded;
        next();
      }
    });
  }

async function run(){
        try{
            const serviceCollection = client.db('alexis').collection('services');
            const reviewCollection = client.db('alexis').collection('review');

            app.post("/jwt", (req, res) => {
                const user = req.body;
                const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
                  expiresIn: "1d",
                });
                res.send({ token });
              });

            app.get('/services', async(req,res)=>{
                const query ={};
                const cursor = serviceCollection.find(query);
                const services = await cursor.limit(3).toArray();
                res.send(services)
            });
    
            app.get('/allServices', async(req,res)=>{
                const query ={};
                const cursor = serviceCollection.find(query);
                const service = await cursor.toArray();
                res.send(service)
            });
    
            app.get('/services/:id',async(req,res)=>{
                const id = req.params.id;
                const query = {_id:new ObjectId(id)};
                const services = await serviceCollection.findOne(query);
                res.send(services);
    
            });

            app.post('/review', async(req,res)=>{
                try{
                    const review = req.body;
                    const result = await reviewCollection.insertOne(review);
        
                    if(result.acknowledged && result.insertedId){
                        res.send({
                            success:true,
                            message:"Successfully added your Review. Thanks For your Feedback !"
                        });
                    }
                    else{
                        res.send({
                            success:false,
                            error:"something went Wrong"
                        })
                    }
        
                  }
        
                  catch(error){
                    res.send({
                        success:false,
                        error:"error.message",
                    });
                  }
            })
        }
        finally{
            
        }
}
run().catch(console.dir);

app.get('/',async(req,res)=>{
    res.send ('Alexis Server is Running')
})

app.listen(port, ()=>console.log(`Alexis Server is Running on ${port}`))