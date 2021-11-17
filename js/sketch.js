let data;
let endpoint = "https://api.artic.edu/api/v1/artworks";
let img;
let pieces = [];
let imageLoaded = false;
let pieceCount = 4;
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
        // let piece = img.get();
        // let pieceMask = generateMask();
        pieces[i].push(img.get());
      }
    }

  }

  // let testMask = generateMask(100,100,100);
  // pieces[0][0].mask(testMask);
  // pieces[0][0] = pieces[0][0].get(100,100,100,100);
  // image(pieces[0][0],0,0);
  // console.log(pieces[0][0]);
  noLoop();
}
// pieceX,pieceY is coords of the puzzle piece indexing the puzzle like a 2d array
// ex. top left piece is 0,0
// we gen mask for each piece moving top to bottom left to right
// shape for next piece only depends on left and upper previous pieces

// function imgToPiece(pimg,topLeftX,topLeftY,width,height=width){
//   let pieceMask = generateMask(mask,topLeftX,topLeftY,width,height);
//   pimg.mask(pieceMask);
//   return pimg.get(topLeftX,topLeftY,width,height);
// }
function generateMask(pieceX,pieceY,width,height=width) {
  let pieceDims = {
    x: img.width/4,
    y: img.height/4
  };
  let pieceMask = createGraphics(img.width,img.height);
  pieceMask.fill('rgba(0, 0, 0, 1)');
  let template = generatePieceTemplate(pieceX,pieceY,width,height);
  pieceMask.beginShape();
  pieceMask.vertex(pieceX,pieceY);
  for(arr of template){
    pieceMask.bezierVertex(...arr);
  }
  pieceMask.endShape();

  return pieceMask;
}

function generatePieceTemplate(topLeftX,topLeftY,width,height=width,topOrientation=-1,rightOrientation=-1,botOrientation=-1,leftOrientation=-1){
  topOrientation*=-1;
  leftOrientation*=-1;
  let topLeft = [topLeftX,topLeftY];
  let topRight = [topLeftX+width,topLeftY];
  let botRight = [topLeftX+width,topLeftY+height];
  let botLeft = [topLeftX,topLeftY+height];
  let tabHeight = 15;
  let tabInset = 40;
  let r = 1;
  let topBridgeStart = [topLeft[0]+(tabInset),topLeft[1]+(tabHeight*topOrientation)];
  let topBridgeEnd = [topRight[0]-(tabInset),topRight[1]+(tabHeight*topOrientation)];
  let rightBridgeStart = [topRight[0]+(tabHeight*rightOrientation),topRight[1]+tabInset];
  let rightBridgeEnd = [botRight[0]+(tabHeight*rightOrientation),botRight[1]-tabInset];
  let botBridgeStart = [botRight[0]-tabInset,botRight[1]+(tabHeight*botOrientation)];
  let botBridgeEnd = [botLeft[0]+tabInset,botLeft[1]+(tabHeight*botOrientation)];
  let leftBridgeStart = [botLeft[0]+(tabHeight*leftOrientation),botLeft[1]-tabInset];
  let leftBridgeEnd = [topLeft[0]+(tabHeight*leftOrientation),topLeft[1]+tabInset];
  let masterTemplate = [
    [topLeft[0]+20,topLeft[1],topLeft[0]+60,topLeft[1],...topBridgeStart],
    [...getLine(topLeft[0]+60,topLeft[1],...topBridgeStart,r),...getLine(topRight[0]-60,topRight[1],...topBridgeEnd,r),...topBridgeEnd],
    [topRight[0]-60,topRight[1],topRight[0]-20,topRight[1],topRight[0],topRight[1]],

    [topRight[0],topRight[1]+20,topRight[0],topRight[1]+60,...rightBridgeStart],
    [...getLine(topRight[0],topRight[1]+60,...rightBridgeStart,r),...getLine(botRight[0],botRight[1]-60,...rightBridgeEnd,r) ,...rightBridgeEnd],
    [botRight[0],botRight[1]-60,botRight[0],botRight[1]-20,botRight[0],botRight[1]],

    [botRight[0]-20,botRight[1],botRight[0]-60,botRight[1],...botBridgeStart],
    [...getLine(botRight[0]-60,botRight[1],...botBridgeStart,r),...getLine(botLeft[0]+60,botLeft[1],...botBridgeEnd,r),...botBridgeEnd],
    [botLeft[0]+60,botLeft[1],botLeft[0]+20,botLeft[1],botLeft[0],botLeft[1]],

    [botLeft[0],botLeft[1]-20,botLeft[0],botLeft[1]-60,...leftBridgeStart],
    [...getLine(botLeft[0],botLeft[1]-60,...leftBridgeStart,r),...getLine(topLeft[0],topLeft[1]+60,...leftBridgeEnd,r),...leftBridgeEnd],
    [topLeft[0],topLeft[1]+60,topLeft[0],topLeft[1]+20,topLeft[0],topLeft[1]]
  ];
  return masterTemplate;
}
function getLine(x1,y1,x2,y2,r){
  return [x2 + (x2-x1)/r,y2 + (y2-y1)/r];
}

function partition(n,p){
  // parition some number n into p most equal parts
  let base = Math.floor(n/p);
  let remainder = n % base;
  let add = Math.ceil(remainder/p);
  let res = [];
  for(let i = 0;i<p;i++){
    let x = base;
    if(remainder-add>=0) {
      remainder-=add;
      x+=add;
    }
    else {
      x+=remainder;
      remainder = 0;
    }
    res.push(x);
  }
  return res;
}