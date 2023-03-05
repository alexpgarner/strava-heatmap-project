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

    app.get('/',(request,response)=>{
        response.sendFile(__dirname+'/index.html')
    })

    // The below configuration is the minimum required. OATH2 Stuff from https://www.npmjs.com/package/strava-oauth2
    //eventually store this on MONGO as well
    const config = {
        client_id: 101662,
        client_secret: '209a2403d1d6334bfaa4cb0c259bf96503a65735',
        redirect_uri: 'https://strava-heatmap-project.herokuapp.com/auth/callback',
        scopes: ['read','read_all','activity:read_all'],
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
        console.log(token);
        // Process token...to MONGODB
        const firstName = token.athlete.firstname;
        const lastName = token.athlete.lastname;
        authCollection.findOneAndUpdate(
            {name:`${firstName} ${lastName}`},
            {
                $set: {
                name: `${firstName} ${lastName}`,
                token: token
                }
            },
            {upsert: true}
        )
        .then(result => {
            console.log(result);
            res.json('Success')
        })
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

    // app.get('/activies',(request,response)=>{
    //     const url = `https://www.strava.com/api/v3/activities?access_token=${access_token}&per_page=200&page=${pageNum}`//URL to get 200 activies per page
    // }
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