const express = require('express');
const app = express();
const cors = require('cors')
const myURL = 'https://strava-heatmap-project.hehrokuapp.com';
app.use(express.static('public'))
app.use(cors());




//MONGODB STUFF
const MongoClient = require('mongodb').MongoClient
const _connectionString = "mongodb+srv://CallMeAL:eLqSlF9oSLX6ZItb@cluster0.sjhenv3.mongodb.net/?retryWrites=true&w=majority";
const uri = process.env.MONGODB_URI;

MongoClient.connect(process.env.MONGODB_URI, { useUnifiedTopology: true })
  .then(client => {
    //app.set('view engine', 'ejs')//tells express we are using ejs template engine
    // Middlewares and other routes here...
    const db = client.db('strava-heatmap-project');
    const authCollection = db.collection('auth')

    //app.use(bodyParser.urlencoded({ extended: true })); //needed for forms probably not gonna use 
    // app.get('/',(req,res)=>{
    //     //res.sendFile(_currentDir + "/index.html");//sends index.html to browser. REMOVED THIS BECAUSE WE RENDERED html template with ejs engine?
    //     db.collection('quotes').find().toArray()
    //     .then(results => {
    //       console.log(results)
    //       res.render('index.ejs', {quotes: results})//this is why we don't need the res.sendFile(/index.html) anymore?
    //     })//gets quotes from database
    //     .catch(error => console.error(error));
        
    // });
    app.get('/',(request,response)=>{
        response.sendFile(__dirname+'/index.html')
    })

    // The below configuration is the minimum required. OATH2 Stuff from https://www.npmjs.com/package/strava-oauth2
    const config = {
        client_id: 101662,
        client_secret: '209a2403d1d6334bfaa4cb0c259bf96503a65735',
        redirect_uri: 'https://strava-heatmap-project.herokuapp.com/auth/callback'
    };
    var url = require('url');
    const { Client, Token } = require('strava-oauth2');
    const client_OATH = new Client(config);
    
    app.get('/auth', (req, res) => {
        res.redirect(client_OATH.getAuthorizationUri());
    });

    // Must be the same as the redirect_uri specified in the config
    app.get('/auth/callback', async (req, res) => {
        console.log('AM I WORKING?')
        const token = await client_OATH.getToken(req.originalUrl);
        // Process token...to MONGODB
        authCollection.insertOne(token)
        .then(result=>{
            console.log(result)
            res.redirect('/');
        })
        .catch(error=>console.error(error));
        // console.log(token)
        // res.redirect('/');
    });

    app.get('/',(request,response)=>{
        response.sendFile(__dirname+'/index.html')
    })

    // app.get('/stravalogin',(request,response)=>{
    //     // app.get('https://www.strava.com/oauth/authorize',(req,res)=>{
    //     //     console.log(res.json())
    //     // })
    //     response.redirect('https://www.strava.com/oauth/authorize');
    //     console.log("click")

    // })
    const PORT = 8000;
    app.listen(process.env.PORT||PORT,()=>{
        console.log(`Server running on port ${PORT}`)
    })
  });