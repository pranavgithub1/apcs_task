let data;
let endpoint = "https://api.artic.edu/api/v1/artworks";
let img;
let pieces = [];
let imageLoaded = false;
let loadRandom = false;
let pieceCount = [5,0];
let xDims;
let yDims;
let prefxDims;
let prefyDims;
function preload() {
  if(loadRandom){
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
  else {
    img = loadImage('https://www.artic.edu/iiif/2/4a87e43e-8777-d36f-126d-545286eb9c4f/full/843,/0/default.jpg');
    imageLoaded = true;
  }
  
}

function setup() {
  createCanvas(1000, 1000);
}

function draw() {
  if(!imageLoaded) return;
  // resize image and generate piece bounds as squares
  img.resize(0,500);
  let imgWHratio = img.height / img.width;
  // pieceCount[0] = Math.floor(img.width/100);
  pieceCount[1] = Math.ceil(pieceCount[0] * imgWHratio);
  background(255);
  // generate the pieces

  if(pieces.length == 0){
    xDims = partition(img.width,pieceCount[0]);
    yDims = partition(img.height,pieceCount[1]);
    prefxDims = [0];
    prefyDims = [0];
    for(let i = 0;i<xDims.length-1;i++){
      prefxDims.push(prefxDims[i] + xDims[i]);
    }
    for(let i = 0;i<yDims.length-1;i++){
      prefyDims.push(prefyDims[i] + yDims[i]);
    }
    console.log(img.width,img.height)
    console.log(xDims);
    console.log(yDims);
    console.log(prefxDims);
    console.log(prefyDims);
    for(let i = 0;i<pieceCount[1];i++){
      pieces.push([]);
      for(let j = 0;j<pieceCount[0];j++){

        let p = generatePiece(i,j);
        pieces[i].push(p);
        image(p.skin,0,0);
        // if(i==0&&j==0) save(p.skin);
        // point(pieceX,pieceY);
        // stroke('red');
        // strokeWeight(5);
      }
    }
  }

  // let tempImage = img.get();
  // let pieceMask = generateMask(100,100,100,100,[1,1,1,1]);
  // tempImage.mask(pieceMask);
  // save(tempImage,'piece.png');
  // image(tempImage,0,0);

  // console.log(pieces);
  // point(605,468);
  // let testMask = generateMask(100,100,100);
  // pieces[0][0].mask(testMask);
  // pieces[0][0] = pieces[0][0].get(100,100,100,100);
  // image(pieces[0][0],0,0);
  // console.log(pieces[0][0]);
  noLoop();
}
function generatePiece(pieceRow,pieceCol) {
  let pieceWidth = xDims[pieceCol];
  let pieceHeight = yDims[pieceRow];
  let pieceX = prefxDims[pieceCol];
  let pieceY = prefyDims[pieceRow];

  let curOrientations = getRandomOrientations();
  if(pieceCol==0) curOrientations[3]=0;
  if(pieceCol==pieceCount[0]-1) curOrientations[1]=0;
  if(pieceRow==0) curOrientations[0]=0;
  if(pieceRow==pieceCount[1]-1) curOrientations[2]=0;
  if(pieceRow>0){
    curOrientations[0] = pieces[pieceRow-1][pieceCol].orientations[2] * -1;
  }
  if(pieceCol>0){
    curOrientations[3] = pieces[pieceRow][pieceCol-1].orientations[1] * -1;
  }
  // generate the piece
  let tempImage = img.get();
  let pieceMask = generateMask(pieceRow,pieceCol,curOrientations);
  tempImage.mask(pieceMask);
  let pieceGraphics = createGraphics(img.width,img.height);
  // pieceGraphics.clear();
  pieceGraphics.image(tempImage,0,0);
  pieceGraphics.noFill();
  pieceGraphics.strokeWeight(1);
  let pieceBorder = generatePieceTemplate(pieceRow,pieceCol,curOrientations);
  pieceGraphics.beginShape();
  pieceGraphics.vertex(pieceX,pieceY);
  for(arr of pieceBorder){
    pieceGraphics.bezierVertex(...arr);
  }
  pieceGraphics.endShape();
  let p = new myPiece(pieceGraphics,curOrientations,pieceX,pieceY);
  return p;
};

function generateMask(pieceRow,pieceCol,orientations) {
  let pieceX = prefxDims[pieceCol];
  let pieceY = prefyDims[pieceRow];
  let pieceMask = createGraphics(img.width,img.height);
  pieceMask.clear();
  // pieceMask.background('rgba(0, 0, 0, 0');
  pieceMask.fill('rgba(0, 0, 0, 1)');
  let template = generatePieceTemplate(pieceRow,pieceCol,orientations);
  pieceMask.beginShape();
  pieceMask.vertex(pieceX,pieceY);
  for(arr of template){
    pieceMask.bezierVertex(...arr);
  }
  pieceMask.endShape();

  return pieceMask;
}

function generatePieceTemplate(pieceRow,pieceCol,orientations){

  let width = xDims[pieceCol];
  let height = yDims[pieceRow];
  let topLeftX = prefxDims[pieceCol];
  let topLeftY = prefyDims[pieceRow];

  topOrientation = orientations[0];
  rightOrientation = orientations[1];
  botOrientation = orientations[2];
  leftOrientation = orientations[3];

  topOrientation*=-1;
  leftOrientation*=-1;
  let topLeft = [topLeftX,topLeftY];
  let topRight = [topLeftX+width,topLeftY];
  let botRight = [topLeftX+width,topLeftY+height];
  let botLeft = [topLeftX,topLeftY+height];
  let tabHeight = normalize(width,20);//-Math.floor((100-width)/10);
  //Math.floor((100)/width);
  console.log(tabHeight);
  let tabInset = normalize(width,40);
  let c1 = normalize(width,20);
  let c2 = normalize(width,50);
  let r = 1.5;
  let topBridgeStart = [topLeft[0]+(tabInset),topLeft[1]+(tabHeight*topOrientation)];
  let topBridgeEnd = [topRight[0]-(tabInset),topRight[1]+(tabHeight*topOrientation)];
  // console.log(topBridgeStart);
  // console.log(topBridgeEnd);
  let rightBridgeStart = [topRight[0]+(tabHeight*rightOrientation),topRight[1]+tabInset];
  let rightBridgeEnd = [botRight[0]+(tabHeight*rightOrientation),botRight[1]-tabInset];
  let botBridgeStart = [botRight[0]-tabInset,botRight[1]+(tabHeight*botOrientation)];
  let botBridgeEnd = [botLeft[0]+tabInset,botLeft[1]+(tabHeight*botOrientation)];
  let leftBridgeStart = [botLeft[0]+(tabHeight*leftOrientation),botLeft[1]-tabInset];
  let leftBridgeEnd = [topLeft[0]+(tabHeight*leftOrientation),topLeft[1]+tabInset];
  let masterTemplate = [
    [topLeft[0]+c1,topLeft[1],topLeft[0]+c2,topLeft[1],...topBridgeStart],
    [...getLine(topLeft[0]+c2,topLeft[1],...topBridgeStart,r),...getLine(topRight[0]-c2,topRight[1],...topBridgeEnd,r),...topBridgeEnd],
    [topRight[0]-c2,topRight[1],topRight[0]-c1,topRight[1],topRight[0],topRight[1]],

    [topRight[0],topRight[1]+c1,topRight[0],topRight[1]+c2,...rightBridgeStart],
    [...getLine(topRight[0],topRight[1]+c2,...rightBridgeStart,r),...getLine(botRight[0],botRight[1]-c2,...rightBridgeEnd,r) ,...rightBridgeEnd],
    [botRight[0],botRight[1]-c2,botRight[0],botRight[1]-c1,botRight[0],botRight[1]],

    [botRight[0]-c1,botRight[1],botRight[0]-c2,botRight[1],...botBridgeStart],
    [...getLine(botRight[0]-c2,botRight[1],...botBridgeStart,r),...getLine(botLeft[0]+c2,botLeft[1],...botBridgeEnd,r),...botBridgeEnd],
    [botLeft[0]+c2,botLeft[1],botLeft[0]+c1,botLeft[1],botLeft[0],botLeft[1]],

    [botLeft[0],botLeft[1]-c1,botLeft[0],botLeft[1]-c2,...leftBridgeStart],
    [...getLine(botLeft[0],botLeft[1]-c2,...leftBridgeStart,r),...getLine(topLeft[0],topLeft[1]+c2,...leftBridgeEnd,r),...leftBridgeEnd],
    [topLeft[0],topLeft[1]+c2,topLeft[0],topLeft[1]+c1,topLeft[0],topLeft[1]]
  ];
  return masterTemplate;
}
function getLine(x1,y1,x2,y2,r){
  return [x2 + Math.floor((x2-x1)/r),y2 + Math.floor((y2-y1)/r)];
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

function normalize(dim,parameter,to=100){
  return Math.ceil((parameter/to)*dim);
}
function getRandomOrientations(){
  let res = []
  for(let i = 0;i<4;i++){
    let r = Math.random();
    if(r>=0.5) res.push(1);
    else res.push(-1);
  }
  return res;
}
class myPiece {
  constructor(skin,orientations,x,y){
    this.skin = skin;
    this.orientations = orientations;
    this.x = x;
    this.y = y;
  }
}