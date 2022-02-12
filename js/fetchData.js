function initSketch() {
  // let node = document.createElement('div');
  // window.document.getElementsByTagName('body')[0].appendChild(node);
  new p5(sketch,'sketchContainer');
  document.querySelector('#welcomePage').style.display="none";
  document.querySelector('#sketchContainer').style.display="block";
}
async function getImageURL() {
  let randomPage = Math.floor(Math.random()*400);
  let url = endpoint+`?page=${randomPage}`;
  let response = await fetch(url);
  if(!response) alert("There was a problem fetching the image please reload");
  data = await response.json();
  console.log(randomPage);
  console.log(data);
  let randomIndex = Math.floor(Math.random()*12);
  let image_id = data.data[randomIndex].image_id;
  artData = data.data[randomIndex];
  let imgURL = `https://www.artic.edu/iiif/2/${image_id}/full/843,/0/default.jpg`;
  console.log(imgURL);
  return imgURL
}
let imageURL;
function loadPuzzle() {
  getImageURL().then(imgUrl => {
    imageURL = imgUrl;
    document.querySelector('#startButton').disabled=false;
    let puzzleImage = document.querySelector('#puzzleImg')
    puzzleImage.src = imgUrl;
    puzzleImage.height = innerHeight * 0.8;
    puzzleImage.style.display = 'block';
  }).catch(err => {
    console.log(err);
    alert("There was an error fetching the image. Please reload.")
  });
}

loadPuzzle();





