const auth_link = 'https://www.strava.com/oauth/token' //make this not global eventually?
let allData = [];//all activies in one array
//from leafly API not sure why I moved it outside of fetch to get to work. I think I moved it so map doesn't have to reinitialize for each page request.
var map = L.map('map').setView([47.399627, -122.070913], 12);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);

function getActivites(access_token,pageNum='1'){
  //console.log(access_token)
  const url = `https://www.strava.com/api/v3/activities?access_token=${access_token}&per_page=200&page=${pageNum}`//URL to get 200 activies per page
  //console.log(url)

  return fetch(url)
      .then(res => res.json()) // parse response as JSON
      .then(data => {
        console.log(data)//should log actives on pageNUM
        //for each activity we grap summary_polyline and covert to latitude longitude coordiates and then add to map.
        data.forEach(element=>{
          let polyline = L.Polyline.fromEncoded(element.map.summary_polyline); //from https://github.com/jieter/Leaflet.encoded/blob/master/Polyline.encoded.js
          // prints an array of 3 LatLng objects.
          let coordinates = polyline.getLatLngs();//coverts the polyline to latlng coorditnates
          //console.log(coordinates);
          //console.log(element.map.summary_polyline)
          L.polyline(
            coordinates,
            {
              color: 'red',
              weight: 5,
              opacity: 7,
              lineJoin: 'round'
            }
          ).addTo(map)//adds activy coordinates to the map
        })
        return data;//for now returns page data to get out of while loop in reAuthorize(). Want to store all user data later so I can keep requests at a minimum.
      })
      .catch(err => {
          console.log(`error ${err}`)
      });
}

//this function reauthorizes login access with refresh_token
function reAuthorize(){
  //sends authorization DATA to strava server NEED TO FIGURE OUT HOW TO HIDE CLIENT DATA FROM BROWSER
  fetch(auth_link, {
    method: "POST",
    headers: {
      'Accept': 'application/json, text/plain, */*',
      'Content-Type': 'application/json'
    },

    body: JSON.stringify({
      //BAD to have client info in JS!!! We just trying to get app working.
      client_id: '101662',
      client_secret: '209a2403d1d6334bfaa4cb0c259bf96503a65735',
      refresh_token:'970e8bba0038b738d8aaa2bc1756a70a305ce360',
      grant_type: 'refresh_token'


    })
  })
    .then((res) => res.json())//gets new access code for user to now get activies
    .then(async (json) => {
      //the max number of activies per page that can be requested is 200. So have to run mutiple requests to get all data if user has more than 200 activies.
      //had to use async because we have to wait for fetch() in getActivies to resolve in order to not have a undefined error with data.
      //console.log(json.access_token);
      let pageNum=1;
      let pageEmpty = false;
      let data;
      while(!pageEmpty){
        data =await getActivites(json.access_token,pageNum);
        allData = allData.concat(data);
        //console.log(data)
        //console.log(pageNum)
        //console.log(data.length)
        //console.log(pageEmpty)
        if(data.length<200){//last page will have less than 200 activities
          pageEmpty = true;
        }else{
          pageNum++;
        }
      }
      console.table(allData)//table of all activies
    })
}
reAuthorize();

