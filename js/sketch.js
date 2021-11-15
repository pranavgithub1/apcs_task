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
  let template = generatePieceTemplate(0,0,100);
  pieceMask.beginShape();
  pieceMask.vertex(0,0);
  for(arr of template){
    pieceMask.bezierVertex(...arr);
  }
  pieceMask.endShape();

  return pieceMask;
}

function generatePieceTemplate(topLeftX,topLeftY,width,height=width){
  let topLeft = [topLeftX,topLeftY];
  let topRight = [topLeftX+width,topLeftY];
  let botRight = [topLeftX+width,topLeftY+height];
  let botLeft = [topLeftX,topLeftY+height];

  let masterTemplate = [
    [topLeft[0]+20,topLeft[1],topLeft[0]+60,topLeft[1],topLeft[0]+35,topLeft[1]+25],
    [(topLeft[0]+35)-10,(topLeft[1]+25)+10,(topRight[0]-35)+10,(topLeft[1]+25)+10,topRight[0]-35,topLeft[1]+25],
    [topRight[0]-60,topRight[1],topRight[0]-20,topRight[1],topRight[0],topRight[1]],

    [topRight[0],topRight[1]+20,topRight[0],topRight[1]+60,topRight[0]-25,topRight[1]+35],
    [(topRight[0]-25)-10,(topRight[1]+35)-10,(botRight[0]-25)-10,(botRight[1]-35)+10,botRight[0]-25,botRight[1]-35],
    [botRight[0],botRight[1]-60,botRight[0],botRight[1]-20,botRight[0],botRight[1]],

    [botRight[0]-20,botRight[1],botRight[0]-60,botRight[1],botRight[0]-35,botRight[1]-25],
    [(botRight[0]-35)+10,(botRight[1]-25)-10,(botLeft[0]+35)-10,(botLeft[1]-25)-10,botLeft[0]+35,botLeft[1]-25],
    [botLeft[0]+60,botLeft[1],botLeft[0]+20,botLeft[1],botLeft[0],botLeft[1]],

    [botLeft[0],botLeft[1]-20,botLeft[0],botLeft[1]-60,botLeft[0]+25,botLeft[1]-35],
    [(botLeft[0]+25)+10,(botLeft[1]-35)+10,(topLeft[0]+25)+10,(topLeft[1]+35)-10,topLeft[0]+25,topLeft[1]+35],
    [topLeft[0],topLeft[1]+60,topLeft[0],topLeft[1]+20,topLeft[0],topLeft[1]]
  ];
  return masterTemplate;
}

function reflectxy(template){
  let swappedTemplate = template;
  for(let arr of template){
    for(let i = 0;i<=arr.length-2;i+=2){
      let temp = arr[i+1];
      arr[i+1] = arr[i];
      arr[i] = temp;
    }
  }
  return swappedTemplate;
}

  // pieceMask.beginShape();
  // pieceMask.curveVertex(100,0);

  // pieceMask.curveVertex(100,0); 
  // pieceMask.curveVertex(100,35);
  // pieceMask.curveVertex(75,35); 
  // pieceMask.curveVertex(75,65);
  // pieceMask.vertex(100,65);
  // // pieceMask.curveVertex(100,100);

  // // pieceMask.curveVertex(100,100);
  // //
  // pieceMask.vertex(100,100);
  // // pieceMask.curveVertex(100,100);

  // // pieceMask.curveVertex(100,100);
  // pieceMask.vertex(65,100);
  // pieceMask.curveVertex(65,75);
  // pieceMask.curveVertex(35,75);
  // pieceMask.curveVertex(35,100);
  // pieceMask.curveVertex(0,100);

  // pieceMask.curveVertex(0,100);
  
  // pieceMask.endShape();


  // let topLeft = [0,0];
  // let topRight = [100,0];
  // let botRight = [100,100];
  // let botLeft = [0,100]
  // let masterTemplate = [
  //   [topLeft[0]+20,topLeft[1],topLeft[0]+60,topLeft[1],topLeft[0]+35,topLeft[1]+25],
  //   [(topLeft[0]+35)-10,(topLeft[1]+25)+10,(topRight[0]-35)+10,(topLeft[1]+25)+10,topRight[0]-35,topLeft[1]+25],
  //   [topRight[0]-60,topRight[1],topRight[0]-20,topRight[1],topRight[0],topRight[1]],

  //   [topRight[0],topRight[1]+20,topRight[0],topRight[1]+60,topRight[0]-25,topRight[1]+35],
  //   [(topRight[0]-25)-10,(topRight[1]+35)-10,(botRight[0]-25)-10,(botRight[1]-35)+10,botRight[0]-25,botRight[1]-35],
  //   [botRight[0],botRight[1]-60,botRight[0],botRight[1]-20,botRight[0],botRight[1]],

  //   [botRight[0]-20,botRight[1],botRight[0]-60,botRight[1],botRight[0]-35,botRight[1]-25],
  //   [(botRight[0]-35)+10,(botRight[1]-25)-10,(botLeft[0]+35)-10,(botLeft[1]-25)-10,botLeft[0]+35,botLeft[1]-25],
  //   [botLeft[0]+60,botLeft[1],botLeft[0]+20,botLeft[1],botLeft[0],botLeft[1]],

  //   [botLeft[0],botLeft[1]-20,botLeft[0],botLeft[1]-60,botLeft[0]+25,botLeft[1]-35],
  //   [(botLeft[0]+25)+10,(botLeft[1]-35)+10,(topLeft[0]+25)+10,(topLeft[1]+35)-10,topLeft[0]+25,topLeft[1]+35],
  //   [topLeft[0],topLeft[1]+60,topLeft[0],topLeft[1]+20,topLeft[0],topLeft[1]]
  // ]