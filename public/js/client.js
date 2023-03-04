document.querySelector('#login').addEventListener('click',oathRedirect);
console.log("HELLO")
async function oathRedirect(){
    //console.log('click')
    const res = await fetch(`/auth`)
    const data = await res.json()
   
    console.log(data);
  }