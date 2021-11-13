let data;
let endpoint = "https://api.artic.edu/api/v1/artworks";
let img;
let pieces = [];
let imageLoaded = false;

function preload() {
  let randomPage = int(random(0,400));
  let url = endpoint+`?page=${randomPage}`;
  httpGet(url,'json',false,function(response){
    data = response;
    let randomIndex = int(random(0,12));
    let image_id = data.data[randomIndex].image_id;
    let imageURL = `https://www.artic.edu/iiif/2/${image_id}/full/843,/0/default.jpg`;
    console.log(imageURL);
    loadImage(imageURL,function(i){
      img = i;
      imageLoaded = true;
    });
  });
}

function setup() {
  createCanvas(800, 800);
}

function draw() {
  if(!imageLoaded) return;
  background(255);
  if(pieces.length == 0){
    for(let i = 0;i<4;i++){
      pieces.push([]);
      for(let j = 0;j<4;j++){
        pieces[i].push(img.get());
      }
    }
  }
  let testMask = generateMask(0,0);
  pieces[0][0].mask(testMask);
  image(testMask,100,100);
  image(pieces[0][0],0,0);
  console.log(pieces[0][0]);
  // each puzzle piece will be an image that has been clipping masked from the original image
  // so we need 16 clipping masks in the shape of puzzle pieces
  // puzzle piece shape: square -> curve edges
  noLoop();
}
// pieceX,pieceY is coords of the puzzle piece indexing the puzzle like a 2d array
// ex. top left piece is 0,0
// we gen mask for each piece moving top to bottom left to right
// shape for next piece only depends on left and upper previous pieces
function generateMask(pieceX,pieceY) {
  let pieceDims = {
    x: img.width/4,
    y: img.height/4
  };
  let pieceMask = createGraphics(img.width,img.height);
  pieceMask.fill('rgba(0, 0, 0, 1)');
  pieceMask.square(0,0,100);
  return pieceMask;
}
