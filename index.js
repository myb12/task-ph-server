const express = require('express');
const app = express();
require('dotenv').config();
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const cors = require('cors');
const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());

//======Database configuration======//
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ig1ef.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });



/* //======Custom function for getting all item from Database======//
const getAllItem = async (req, res, collection) => {
    const cursor = await collection.find({});
    const items = await cursor.toArray();
    res.send(items);
}

//======Custom function for deleting an item from Database======//
const deleteItem = async (req, res, collection) => {
    const id = req.params.id;
    const query = { _id: ObjectId(id) };
    const result = await collection.deleteOne(query);
    res.json(result);
} */



const run = async () => {
    try {
        await client.connect();
        const database = client.db("riderDb");
        console.log('DB is connected');
        const usersCollection = database.collection("users")

        //======POST API for adding user======// 
        app.post('/users', async (req, res) => {
            const user = req.body;
            console.log(user);
            const result = await usersCollection.insertOne(user);
            res.json(result)
        })

        //======GET API for users======// 
        app.get('/users', async (req, res) => {
            const cursor = await usersCollection.find({});
            const items = await cursor.toArray();
            res.send(items);
        })

        //======GET API for paginated users======// 
        app.get('/paginatedUsers', async (req, res) => {
            const cursor = usersCollection.find({});
            const count = await cursor.count();

            const page = req.query.page;
            const size = +req.query.size;
            let users;

            if (page) {
                users = await cursor.skip(page * size).limit(size).toArray();

            } else {
                users = await cursor.toArray();
            }

            res.send({
                count,
                users
            });
        })

        //======GET API for admin ======// 
        app.get('/users/:email', async (req, res) => {
            const { email } = req.params;
            const query = { email: email }
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') isAdmin = true;

            res.json({ admin: isAdmin })
        })

        //======DELETE API for product======// 
        /*  app.delete('/products/:id', async (req, res) => {
             deleteItem(req, res, productCollection);
         })
         */


        //======PUT API to to block user======//
        app.put('/users/:id', async (req, res) => {
            const id = req.params.id;

            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };

            const updateDoc = {
                $set: {
                    userStatus: "Blocked",
                },
            };

            const result = await usersCollection.updateOne(filter, updateDoc, options);
            console.log(result);
            res.json(result);
        })




        //======PUT API for making admin======//
        /*   app.put('/users/admin', verifyToken, async (req, res) => {
              const user = req.body;
              const requester = req.decodedEmail;
              if (requester) {
                  const requesterAccount = await usersCollection.findOne({ email: requester });
                  if (requesterAccount.role === 'admin') {
                      const filter = { email: user.email };
                      const updateDoc = {
                          $set: {
                              role: 'admin'
                          }
                      }
                      const result = await usersCollection.updateOne(filter, updateDoc);
                      res.json(result);
                  }
  
              } else {
                  res.status(403).json({ message: 'You can not make admin' })
              }
          }) */

    } finally {
        // await client.close();
    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello Hero Rider!');
});


app.listen(port, () => {
    console.log('Server is running on port', port);
})