const express = require('express');
const app = express();
const cors = require('cors')
const myURL = 'https://strava-heatmap-project.hehrokuapp.com';
app.use(express.static('public'))
app.use(cors());


// The below configuration is the minimum required.
const config = {
    client_id: 101662,
    client_secret: '209a2403d1d6334bfaa4cb0c259bf96503a65735',
    redirect_uri: 'https://strava-heatmap-project.herokuapp.com/auth/callback'
};

var url = require('url');
const { Client, Token } = require('strava-oauth2');
const client = new Client(config);

app.get('/auth', (req, res) => {
    res.redirect(client.getAuthorizationUri());
});

// Must be the same as the redirect_uri specified in the config
app.get('/auth/callback', async (req, res) => {
    console.log('AM I WORKING?')
    const token = await client.getToken(req.originalUrl);
    // Process token...
    console.log(token)
    res.redirect('/');
});

app.get('/home', (req, res) => {
    res.send('Welcome!');
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