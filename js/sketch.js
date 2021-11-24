let data;
let endpoint = "https://api.artic.edu/api/v1/artworks";
let img;
let pieces = [];
let imageLoaded = false;
let loadRandom = false;
let pieceGen = false;
let pieceCount = [5,0];
let xDims;
let yDims;
let prefxDims;
let prefyDims;
let currentlyGrabbed;
let grabbedX;
let grabbedY;
let piecesToDraw = [];
let pieceMap;
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
    img = loadImage('https://www.artic.edu/iiif/2/4636c76d-8ff1-6f00-b409-e10438d1320b/full/843,/0/default.jpg');
    // img = loadImage('https://www.artic.edu/iiif/2/4a87e43e-8777-d36f-126d-545286eb9c4f/full/843,/0/default.jpg');
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
  pieceId = 0;
  if(!pieceGen){
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
        let p = generatePiece(i,j,pieceId);
        pieceId++;
        pieces[i].push(p);
        piecesToDraw.push(p);
      }
    }
    pieces = null;
    pieceMap = piecesToDraw.slice();
    pieceGen=true;
  }

  for(piece of piecesToDraw){
    image(piece.skin,piece.x,piece.y);
  }
  // console.log(pieceMap[0].x);
}
function mousePressed(){
  for(let i = piecesToDraw.length-1;i>=0;i--){
    let xpos = piecesToDraw[i].x;
    let ypos = piecesToDraw[i].y;
    let [r,g,b,a] = piecesToDraw[i].skin.get(mouseX-xpos,mouseY-ypos);
    if(a!=0) {
      currentlyGrabbed = piecesToDraw[i];
      grabbedX = mouseX - currentlyGrabbed.x;
      grabbedY = mouseY - currentlyGrabbed.y;
      piecesToDraw.splice(i,1);
      piecesToDraw.push(currentlyGrabbed);
      return;
    }
  }
}
function mouseDragged(){
  if(currentlyGrabbed!=null){

    currentlyGrabbed.x = mouseX - grabbedX;
    currentlyGrabbed.y = mouseY - grabbedY;
  }
}
function mouseReleased(){
  if(currentlyGrabbed===null) return;
  // top fit
  if(currentlyGrabbed.row > 0){
    let top = pieceMap[currentlyGrabbed.id - pieceCount[0]];
    let xy = [currentlyGrabbed.x,currentlyGrabbed.y];
    let xyt = [top.x,top.y]
    let curTopLeft = vecAdd(currentlyGrabbed.data.topLeft,xy);
    let curTopRight = vecAdd(currentlyGrabbed.data.topRight,xy)
    let topBotLeft = vecAdd(top.data.botLeft,xyt);
    let topBotRight = vecAdd(top.data.botRight,xyt)
    if(pointDist(...curTopLeft,...topBotLeft)<5 && pointDist(...curTopRight,...topBotRight)<5){
      [currentlyGrabbed.x,currentlyGrabbed.y] = vecAdd(topBotLeft,currentlyGrabbed.data.topLeft,-1);
    }
  }
  // bottom fit
  if(currentlyGrabbed.row+1 < pieceCount[1]-1){
    let bot = pieceMap[currentlyGrabbed.id + pieceCount[0]];
    let xy = [currentlyGrabbed.x,currentlyGrabbed.y];
    let xyb = [bot.x,bot.y];
    let curBotLeft = vecAdd(currentlyGrabbed.data.botLeft,xy);
    let curBotRight = vecAdd(currentlyGrabbed.data.botRight,xy);
    let botTopLeft = vecAdd(bot.data.topLeft,xyb);
    let botTopRight = vecAdd(bot.data.topRight,xyb);
    if(pointDist(...curBotLeft,...botTopLeft)<5 && pointDist(...curBotRight,...botTopRight)<5){
      [currentlyGrabbed.x,currentlyGrabbed.y] = vecAdd(botTopLeft,currentlyGrabbed.data.botLeft,-1);
    }
  }
  
  currentlyGrabbed = null;
  grabbedX = null;
  grabbedY = null;
}
function generatePiece(pieceRow,pieceCol,pieceId) {

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
  let res = generateMask(pieceRow,pieceCol,curOrientations);
  let pieceMask = res[0];
  let pieceData = res[1];
  tempImage.mask(pieceMask);
  let pieceGraphics = createGraphics(img.width,img.height);
  // pieceGraphics.clear();
  pieceGraphics.image(tempImage,0,0);
  pieceGraphics.noFill();
  pieceGraphics.strokeWeight(1);
  // let pieceBorder = generatePieceTemplate(pieceRow,pieceCol,curOrientations)[0];
  let pieceBorder = pieceData.template;
  pieceGraphics.beginShape();
  pieceGraphics.vertex(pieceData.topLeft[0],pieceData.topLeft[1]);
  for(arr of pieceBorder){
    pieceGraphics.bezierVertex(...arr);
  }
  pieceGraphics.endShape();
  pieceGraphics.stroke('red');
  pieceGraphics.strokeWeight('4');
  pieceGraphics.point(pieceData.topLeft[0],pieceData.topLeft[1]);
  // let pieceElement = createImg(pieceGraphics.canvas.toDataURL(),`piece ${pieceId}`);
  let p = new myPiece(pieceGraphics.get(),curOrientations,pieceRow,pieceCol,pieceData,pieceId,100,100);
  return p;
};

function generateMask(pieceRow,pieceCol,orientations) {
  // let pieceX = prefxDims[pieceCol];
  // let pieceY = prefyDims[pieceRow];
  let pieceMask = createGraphics(img.width,img.height);
  pieceMask.clear();
  // pieceMask.background('rgba(0, 0, 0, 0');
  pieceMask.fill('rgba(0, 0, 0, 1)');
  let pieceData = generatePieceTemplate(pieceRow,pieceCol,orientations);
  let template = pieceData.template;
  pieceMask.beginShape();
  pieceMask.vertex(pieceData.topLeft[0],pieceData.topLeft[1]);
  for(arr of template){
    pieceMask.bezierVertex(...arr);
  }
  pieceMask.endShape();

  return [pieceMask,pieceData];
}

function generatePieceTemplate(pieceRow,pieceCol,orientations){

  let width = xDims[pieceCol];
  let height = yDims[pieceRow];
  let topLeftX = prefxDims[pieceCol];
  let topLeftY = prefyDims[pieceRow];

  let topOrientation = orientations[0] * -1;
  let rightOrientation = orientations[1];
  let botOrientation = orientations[2];
  let leftOrientation = orientations[3] * -1;


  let topLeft = [topLeftX,topLeftY];
  let topRight = [topLeftX+width,topLeftY];
  let botRight = [topLeftX+width,topLeftY+height];
  let botLeft = [topLeftX,topLeftY+height];
  let tabHeight = normalize(width,20);//-Math.floor((100-width)/10);
    console.log(tabHeight);
  let tabInset = normalize(width,40);
  let c1 = normalize(width,20);
  let c2 = normalize(width,50);
  let htabHeight = normalize(height,20);
  let htabInset = normalize(height,40);
  let hc1 = normalize(height,20);
  let hc2 = normalize(height,50);
  let r = 1.5;
  let topBridgeStart = [topLeft[0]+(tabInset),topLeft[1]+(tabHeight*topOrientation)];
  let topBridgeEnd = [topRight[0]-(tabInset),topRight[1]+(tabHeight*topOrientation)];
  let rightBridgeStart = [topRight[0]+(htabHeight*rightOrientation),topRight[1]+htabInset];
  let rightBridgeEnd = [botRight[0]+(htabHeight*rightOrientation),botRight[1]-htabInset];
  let botBridgeStart = [botRight[0]-tabInset,botRight[1]+(tabHeight*botOrientation)];
  let botBridgeEnd = [botLeft[0]+tabInset,botLeft[1]+(tabHeight*botOrientation)];
  let leftBridgeStart = [botLeft[0]+(htabHeight*leftOrientation),botLeft[1]-htabInset];
  let leftBridgeEnd = [topLeft[0]+(htabHeight*leftOrientation),topLeft[1]+htabInset];
  let bridgeNudgeDist = normalize(width,5,125);
  let botRightNudgeDist = normalize(width,10,125)// + Math.ceil((125-width)/42);
  if(pieceRow != pieceCount[1]-1 && pieceCol!= pieceCount[0]-1){
    nudge(botRight,botRightNudgeDist);
  }
  if(pieceRow!=pieceCount[1]-1){
    nudge(botBridgeStart,bridgeNudgeDist);
    nudge(botBridgeEnd,bridgeNudgeDist);
  }
  if(pieceCol!=pieceCount[0]-1){
    nudge(rightBridgeStart,bridgeNudgeDist);
    nudge(rightBridgeEnd,bridgeNudgeDist);
  }
  if(pieceRow > 0){
    topLeft = pieces[pieceRow-1][pieceCol].data.botLeft;
    topBridgeStart = pieces[pieceRow-1][pieceCol].data.botBridgeEnd;
    topBridgeEnd = pieces[pieceRow-1][pieceCol].data.botBridgeStart;
    topRight = pieces[pieceRow-1][pieceCol].data.botRight;
  }
  if(pieceCol > 0){
    botLeft = pieces[pieceRow][pieceCol-1].data.botRight;
    leftBridgeStart = pieces[pieceRow][pieceCol-1].data.rightBridgeEnd;
    leftBridgeEnd = pieces[pieceRow][pieceCol-1].data.rightBridgeStart;
    topLeft = pieces[pieceRow][pieceCol-1].data.topRight;

  }
  let pieceData = {
    width: width,
    height: height,
    topLeft: topLeft,
    topRight: topRight,
    botLeft: botLeft,
    botRight: botRight,
    topOrientation: topOrientation,
    rightOrientation: rightOrientation,
    botOrientation: botOrientation,
    leftOrientation: leftOrientation,
    tabInset: tabInset,
    tabHeight: tabHeight,
    c1: c1,
    c2: c2,
    r: r,
    topBridgeStart: topBridgeStart,
    topBridgeEnd: topBridgeEnd,
    rightBridgeStart: rightBridgeStart,
    rightBridgeEnd: rightBridgeEnd,
    botBridgeStart: botBridgeStart,
    botBridgeEnd: botBridgeEnd,
    leftBridgeStart: leftBridgeStart,
    leftBridgeEnd: leftBridgeEnd,
    // template: [],
  }
  let masterTemplate = [
    [topLeft[0]+c1,topLeft[1],topLeft[0]+c2,topLeft[1],...topBridgeStart],
    [...getLine(topLeft[0]+c2,topLeft[1],...topBridgeStart,r),...getLine(topRight[0]-c2,topRight[1],...topBridgeEnd,r),...topBridgeEnd],
    [topRight[0]-c2,topRight[1],topRight[0]-c1,topRight[1],topRight[0],topRight[1]],

    [topRight[0],topRight[1]+hc1,topRight[0],topRight[1]+hc2,...rightBridgeStart],
    [...getLine(topRight[0],topRight[1]+hc2,...rightBridgeStart,r),...getLine(botRight[0],botRight[1]-hc2,...rightBridgeEnd,r) ,...rightBridgeEnd],
    [botRight[0],botRight[1]-hc2,botRight[0],botRight[1]-hc1,botRight[0],botRight[1]],

    [botRight[0]-c1,botRight[1],botRight[0]-c2,botRight[1],...botBridgeStart],
    [...getLine(botRight[0]-c2,botRight[1],...botBridgeStart,r),...getLine(botLeft[0]+c2,botLeft[1],...botBridgeEnd,r),...botBridgeEnd],
    [botLeft[0]+c2,botLeft[1],botLeft[0]+c1,botLeft[1],botLeft[0],botLeft[1]],

    [botLeft[0],botLeft[1]-hc1,botLeft[0],botLeft[1]-hc2,...leftBridgeStart],
    [...getLine(botLeft[0],botLeft[1]-hc2,...leftBridgeStart,r),...getLine(topLeft[0],topLeft[1]+hc2,...leftBridgeEnd,r),...leftBridgeEnd],
    [topLeft[0],topLeft[1]+hc2,topLeft[0],topLeft[1]+hc1,topLeft[0],topLeft[1]]
  ];
  pieceData.template = masterTemplate;
  return pieceData;
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
function nudge(point,d){
  let x = Math.floor(Math.random() * d);
  let y = Math.floor(Math.random() * d);
  let xSign = (Math.random()>=0.5)? 1 : -1;
  let ySign = (Math.random()>=0.5)? 1 : -1;
  point[0] += (x*xSign);
  point[1] += (y*ySign);
}
function vecAdd(a,b,s=1){
  return [a[0]+(b[0]*s),a[1]+(b[1]*s)];
}
function pointDist(x1,y1,x2,y2){
  return Math.sqrt(
    Math.pow(y2-y1,2) + Math.pow(x2-x1,2)
  );
}
class myPiece {
  constructor(skin,orientations,pieceRow,pieceCol,pieceData,id,x,y){
    this.skin = skin;
    // this.skin.mousePressed()
    this.orientations = orientations;
    this.row = pieceRow;
    this.col = pieceCol;
    this.data = pieceData;
    this.id = id;
    this.grabbed = false;
    this.x = x;
    this.y = y;
    // this.width = xDims[pieceCol];
    // this.height = yDims[pieceRow];
    // this.x = prefxDims[pieceCol];
    // this.y = prefyDims[pieceRow];

    // this.topLeft = [this.x,this.y];
    // this.topRight = [this.x+this.width,this.y];
    // this.botRight = [this.x+this.width,this.y+this.height];
    // this.botLeft = [this.x,this.y+this.height];

    // this.topOrientation = this.orientations[0] * -1;
    // this.rightOrientation = this.orientations[1];
    // this.botOrientation = this.orientations[2];
    // this.leftOrientation = this.orientations[3] * -1;

    // this.topBridgeStart = [this.topLeft[0]+(tabInset),this.topLeft[1]+(tabHeight*this.topOrientation)];
    // this.topBridgeEnd = [this.topRight[0]-(tabInset),this.topRight[1]+(tabHeight*this.topOrientation)];
    // this.rightBridgeStart = [this.topRight[0]+(tabHeight*this.rightOrientation),this.topRight[1]+tabInset];
    // this.rightBridgeEnd = [this.botRight[0]+(tabHeight*this.rightOrientation),this.botRight[1]-tabInset];
    // this.botBridgeStart = [this.botRight[0]-tabInset,this.botRight[1]+(tabHeight*this.botOrientation)];
    // this.botBridgeEnd = [this.botLeft[0]+tabInset,this.botLeft[1]+(tabHeight*this.botOrientation)];
    // this.leftBridgeStart = [this.botLeft[0]+(tabHeight*this.leftOrientation),this.botLeft[1]-tabInset];
    // this.leftBridgeEnd = [this.topLeft[0]+(tabHeight*this.leftOrientation),this.topLeft[1]+tabInset];
  }
}


