const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const bodyParser = require("body-parser");
//import libraries

// const firebase = require("firebase");

// var  firebaseConfig = {
//     apiKey: "AIzaSyCe-1ClobJQfEdZZ712E-fEi52n8ukTIlw",
//     authDomain: "react-auth-firebase-77224.firebaseapp.com",
//     databaseURL: "https://react-auth-firebase-77224-default-rtdb.asia-southeast1.firebasedatabase.app",
//     projectId: "react-auth-firebase-77224",
//     storageBucket: "react-auth-firebase-77224.appspot.com",
//     messagingSenderId: "386017738804",
//     appId: "1:386017738804:web:ce8bd87051b09d675d0a61",
//     measurementId: "G-GWPZX73RPF"
//   };
//   // Initialize Firebase
//   firebase.initializeApp(firebaseConfig);
//   // firebase.analytics();


// admin.initializeApp(firebaseConfig);

admin.initializeApp(functions.config().firebase);
//initialize express server
const app = express();
const main = express();

//add the path to receive request and set json as bodyParser to process the body 
main.use('/api/v1', app);
main.use(bodyParser.json());
main.use(bodyParser.urlencoded({ extended: false }));

//initialize the database and the collection 
const db = admin.firestore();
const userCollection = 'users';


app.get('/users', async (req, res) => {
    try {
        const userQuerySnapshot = await db.collection(userCollection).get();
        const users= [];
        userQuerySnapshot.forEach(
            (doc)=>{
                users.push({
                    id: doc.id,
                    data:doc.data()
            });
            }
        );
        res.status(200).json(users );
    } catch (error) {
        res.status(500).send(error);
    }
});

// Create new user
app.post('/users', async (req, res) => {

  try {
      const user = {
          name: req.body['name'],
          lastname: req.body['lastname'],
      }
      const newDoc = await db.collection(userCollection).add(user);
      res.status(201).send(`Created a new user: ${newDoc.id}`);
  } catch (error) {
      res.status(400).send(`User should cointain firstName, lastName, email, areaNumber, department, id and contactNumber!!!`)
  }
});


//get a single contact
app.get('/users/:userId', (req,res) => {

  const userId = req.params.userId; 
  db.collection(userCollection).doc(userId).get()
  .then(user => {
      if(!user.exists) throw new Error('User not found');
      res.status(200).json({id:user.id, data:user.data()})})
  .catch(error => res.status(500).send(error));
      
});


// Delete a user
app.delete('/users/:userId', (req, res) => {
  db.collection(userCollection).doc(req.params.userId).delete()
  .then(()=>res.status(204).send("Document successfully deleted!"))
  .catch(function (error) {
          res.status(500).send(error);
  });
})

// Update user
app.put('/users/:userId', async (req, res) => {
  await db.collection(userCollection).doc(req.params.userId).set(req.body,{merge:true})
  .then(()=> res.json({id:req.params.userId}))
  .catch((error)=> res.status(500).send(error))

});



// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   // functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });



//define google cloud function name
exports.webApi = functions.https.onRequest(main);



