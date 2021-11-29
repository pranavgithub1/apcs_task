let data;
let artData;
let endpoint = "https://api.artic.edu/api/v1/artworks";
let img;
let pieces = [];
let imageLoaded = false;
let loadRandom = true;
let pieceGen = false;
let pieceCount = [5,0];
let xDims;
let yDims;
let prefxDims;
let prefyDims;
let currentlyGrabbed = null;
let grabbedX;
let grabbedY;
let piecesToDraw = [];
let pieceMap;
let maxDim;
let visited = [];
let component = [];
let showingImage = false;
let referenceImage;
let started = false;
let textFadeCounter = 0;
let fade = 2;
function preload() {
  if(loadRandom){
    let randomPage = int(random(0,400));
    let url = endpoint+`?page=${randomPage}`;
    httpGet(url,'json',false,function(response){
      console.log(response);
      data = response;
      let randomIndex = int(random(0,12));
      let image_id = data.data[randomIndex].image_id;
      artData = data.data[randomIndex];
      console.log(image_id);
      if(image_id===null) {
        imageLoaded = true;
        return;
      }
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
  createCanvas(document.documentElement.clientWidth*0.9, document.documentElement.clientHeight*0.9);
  background(255);
  // console.log(window)
}

function draw() {
  if(!imageLoaded) {
    text('Loading...',width/2,height/2);
    return;
  }
  // 303
  if(img==null){
    background(255);
    text('Image fetch failed, please reload',width/2,height/2);
    return;
  }

  if(!pieceGen){
    background(255);
    text('Generating Puzzle...',width/2,height/2);
    // resize image and generate piece bounds as squares
    img.resize(0,height*0.75);
    let imgWHratio = img.height / img.width;
    // pieceCount[0] = Math.floor(img.width/100);
    pieceCount[1] = Math.ceil(pieceCount[0] * imgWHratio);
    // generate the pieces
    pieceId = 0;
    resetVisited(pieceCount[0]*pieceCount[1]);
    referenceImage = createImg(img.canvas.toDataURL(),'referenceImage').hide();

    referenceImage.position(0,0);
    xDims = partition(img.width,pieceCount[0]);
    yDims = partition(img.height,pieceCount[1]);
    maxDim = Math.max(...xDims,...yDims) *2;
    // maxDim*=2;
    // console.log(maxDim);
    prefxDims = [0];
    prefyDims = [0];
    for(let i = 0;i<xDims.length-1;i++){
      prefxDims.push(prefxDims[i] + xDims[i]);
    }
    for(let i = 0;i<yDims.length-1;i++){
      prefyDims.push(prefyDims[i] + yDims[i]);
    }
    // console.log(img.width,img.height)
    // console.log(xDims);
    // console.log(yDims);
    // console.log(prefxDims);
    // console.log(prefyDims);
    for(let i = 0;i<pieceCount[1];i++){
      pieces.push([]);
      for(let j = 0;j<pieceCount[0];j++){
        let p = generatePiece(i,j,pieceId);
        pieceId++;
        pieces[i].push(p);
        // piecesToDraw.push(p);
      }
    }
    for(let i = 0;i<pieceCount[1];i++){
      for(let j = 0;j<pieceCount[0];j++){
        let pieceCol = j;
        let pieceRow = i;
        let topLeftX = prefxDims[pieceCol];
        let topLeftY = prefyDims[pieceRow];
        let pieceGraphics = createGraphics(maxDim*pieceCount[0],maxDim*pieceCount[1]);
        pieceGraphics.clear();
        let center = [maxDim*pieceCol + maxDim/2,maxDim*pieceRow + maxDim/2];
        let pieceCenter = [topLeftX + pieces[i][j].data.width/2,topLeftY + pieces[i][j].data.height/2];
        pieceGraphics.image(pieces[i][j].skin,center[0]-pieceCenter[0],center[1]-pieceCenter[1]);
        let shift = [(center[0]-pieceCenter[0]),(center[1]-pieceCenter[1])];
        let lightData = {};                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             
        lightData.topLeft = vecAdd(pieces[i][j].data.topLeft,shift);
        lightData.topRight = vecAdd(pieces[i][j].data.topRight,shift);
        lightData.botRight = vecAdd(pieces[i][j].data.botRight,shift);
        lightData.botLeft = vecAdd(pieces[i][j].data.botLeft,shift);
        lightData.cellCenter = center;
        lightData.pieceCenter = pieceCenter;
        
        let pos = getRandomPosition(0,width-maxDim,0,height-maxDim);
        let p = new lightPiece(pieceGraphics.get(),pieces[i][j].skinNoBorder,0,-50,pieces[i][j].row,pieces[i][j].col,pieces[i][j].id,lightData);
        // console.log(pos);
        p.x = pos[0] - p.data.topLeft[0];
        p.y = pos[1] - p.data.topLeft[1];
        let rotations = Math.floor(Math.random()*4);
        for(let i = 0;i<rotations;i++){
          rotatePiece(p);
        }
        pieceGraphics.remove();
        pieceGraphics = null;
        piecesToDraw.push(p);
        
      }
    }
    pieces = null;
    pieceMap = piecesToDraw.slice();
    pieceGen=true;
  }
  if(!started){
    background(255);
    image(img,0,0);
    textSize(32);
    fill('black');
    // stroke('white');
    // text('Jigsaw Puzzle',0,img.height+50)
    textSize(18);
    let artTitle = "Unknown title";
    let artist = "Unkown artist";
    let artDate = "unknown date"
    if(artData.title != null) artTitle = artData.title;
    if(artData.artist_title != null) artist = artData.artist_title;
    if(artData.date_start != null) artDate = artData.date_start;
    text(artTitle,0,img.height+50)
    textSize(16);
    text(artist+" - "+artDate,0,img.height+100);
    textFadeCounter+=fade;
    if(textFadeCounter === 150 || textFadeCounter === 0) fade = -fade;
    fill(0,0,0,textFadeCounter);
    push();
    textStyle(BOLD);
    text('Press enter to start',width/2,height/2);
    pop();
    return;
  }
  noLoop();
  background(255);
  for(piece of piecesToDraw){
    image(piece.skin,piece.x,piece.y);
  }
}
function keyPressed(){
  if(key === 'a' && currentlyGrabbed!=null){
    rotatePiece(currentlyGrabbed);
  }
  if(key === ' '){
    if(showingImage){
      referenceImage.hide();
      showingImage = false;
    }
    else {
      referenceImage.show();
      showingImage = true;
    }
  }
  if(keyCode===ENTER){
    started = true;
  }
  return false;
}
function mousePressed(){
  for(let i = piecesToDraw.length-1;i>=0;i--){
    let [r,g,b,a] = piecesToDraw[i].skin.get(mouseX-piecesToDraw[i].x,mouseY-piecesToDraw[i].y);
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
  if(currentlyGrabbed!=null && currentlyGrabbed.neighbors.length!=0){
    for(o of currentlyGrabbed.neighbors){
      pieceMap[o].neighbors = pieceMap[o].neighbors.filter(e => e!=currentlyGrabbed.id);
    }
    currentlyGrabbed.neighbors = [];
  }
  if(currentlyGrabbed!=null){
    currentlyGrabbed.x = mouseX - grabbedX;
    currentlyGrabbed.y = mouseY - grabbedY;
    redraw();
  }
}
function mouseReleased(){
  if(currentlyGrabbed===null) return;
  let xy = [currentlyGrabbed.x,currentlyGrabbed.y];
  let curTopLeft = vecAdd(currentlyGrabbed.data.topLeft,xy);
  let curTopRight = vecAdd(currentlyGrabbed.data.topRight,xy);
  let curBotLeft = vecAdd(currentlyGrabbed.data.botLeft,xy);
  let curBotRight = vecAdd(currentlyGrabbed.data.botRight,xy);
  let foundfit = false;
  // top fit
  let fitSens = 12;
  if(currentlyGrabbed.row > 0 && !currentlyGrabbed.neighbors.includes(currentlyGrabbed.id - pieceCount[0])){
    let top = pieceMap[currentlyGrabbed.id - pieceCount[0]];
    let xyt = [top.x,top.y];
    let topBotLeft = vecAdd(top.data.botLeft,xyt);
    let topBotRight = vecAdd(top.data.botRight,xyt)
    if(pointDist(...curTopLeft,...topBotLeft)<fitSens && pointDist(...curTopRight,...topBotRight)<fitSens){
      [currentlyGrabbed.x,currentlyGrabbed.y] = vecAdd(topBotLeft,currentlyGrabbed.data.topLeft,-1);
      currentlyGrabbed.neighbors.push(top.id);
      top.neighbors.push(currentlyGrabbed.id);
      foundfit = true;
    }
  }
  // bottom fit
  if(currentlyGrabbed.row+1 < pieceCount[1] && !currentlyGrabbed.neighbors.includes(currentlyGrabbed.id + pieceCount[0])){
    let bot = pieceMap[currentlyGrabbed.id + pieceCount[0]];
    let xyb = [bot.x,bot.y];
    let botTopLeft = vecAdd(bot.data.topLeft,xyb);
    let botTopRight = vecAdd(bot.data.topRight,xyb);
    if(pointDist(...curBotLeft,...botTopLeft)<fitSens && pointDist(...curBotRight,...botTopRight)<fitSens){
      [currentlyGrabbed.x,currentlyGrabbed.y] = vecAdd(botTopLeft,currentlyGrabbed.data.botLeft,-1);
      currentlyGrabbed.neighbors.push(bot.id);
      bot.neighbors.push(currentlyGrabbed.id);
      foundfit = true;
    }
  }
  // left fit
  if(currentlyGrabbed.col > 0 && !currentlyGrabbed.neighbors.includes(currentlyGrabbed.id-1)){
    let left = pieceMap[currentlyGrabbed.id-1];
    let xyl = [left.x,left.y];
    let leftTopRight = vecAdd(left.data.topRight,xyl);
    let leftBotRight = vecAdd(left.data.botRight,xyl);
    if(pointDist(...curBotLeft,...leftBotRight)<fitSens && pointDist(...curTopLeft,...leftTopRight)<fitSens){
      [currentlyGrabbed.x,currentlyGrabbed.y] = vecAdd(leftBotRight,currentlyGrabbed.data.botLeft,-1);
      currentlyGrabbed.neighbors.push(left.id);
      left.neighbors.push(currentlyGrabbed.id);
      foundfit = true;
    }
  }
  // right fit
  if(currentlyGrabbed.col+1 < pieceCount[0] && !currentlyGrabbed.neighbors.includes(currentlyGrabbed.id+1)){
    let right = pieceMap[currentlyGrabbed.id+1];
    let xyr = [right.x,right.y];
    let rightBotLeft = vecAdd(right.data.botLeft,xyr);
    let rightTopLeft = vecAdd(right.data.topLeft,xyr);
    if(pointDist(...curBotRight,...rightBotLeft)<fitSens && pointDist(...curTopRight,...rightTopLeft)<fitSens){
      [currentlyGrabbed.x,currentlyGrabbed.y] = vecAdd(rightTopLeft,currentlyGrabbed.data.topRight,-1);
      currentlyGrabbed.neighbors.push(right.id);
      right.neighbors.push(currentlyGrabbed.id);
      foundfit = true;
    }
  }
  if(foundfit){
    redraw();
    let cnt = countConnected(currentlyGrabbed.id);
    resetVisited(pieceCount[0]*pieceCount[1]);
    // console.log(cnt);
    if(cnt == pieceCount[0]*pieceCount[1]){
      // for(piece of piecesToDraw){
      //   piece.skin = piece.skinNoBorder;
      // }
      alert("congragulations on solving the puzzle");
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
  let pieceWithBorder = createGraphics(img.width,img.height);
  pieceWithBorder.clear();
  pieceWithBorder.image(tempImage,0,0);
  pieceWithBorder.noFill();
  pieceWithBorder.strokeWeight(1);
  let pieceBorder = pieceData.template;
  pieceWithBorder.beginShape();
  pieceWithBorder.vertex(pieceData.topLeft[0],pieceData.topLeft[1]);
  for(arr of pieceBorder){
    pieceWithBorder.bezierVertex(...arr);
  }
  pieceWithBorder.endShape();
  let p = new myPiece(pieceWithBorder.get(),tempImage,curOrientations,pieceRow,pieceCol,pieceData,pieceId,100,100);
  pieceWithBorder.remove();
  pieceWithBorder = null;
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
  let res = pieceMask.get();
  pieceMask.remove();
  pieceMask = null;
  return [res,pieceData];
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
  // console.log(tabHeight);
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
function rotatePiece(piece){

  let rdim = Math.max(piece.skin.height,piece.skin.width);
  let rotater = createGraphics(rdim*2,rdim*2);
  rotater.clear();
  rotater.translate(rotater.width/2,rotater.height/2);
  rotater.rotate(Math.PI/2);
  rotater.image(piece.skin,0,0);
  let rotated = rotater.get();
  rotater.remove();
  rotater=null;

  let newSkin = createGraphics(piece.skin.width,piece.skin.height);
  newSkin.clear();
  newSkin.imageMode(CENTER);
  newSkin.image(rotated,piece.data.cellCenter[0]+piece.data.cellCenter[1],piece.data.cellCenter[1]-piece.data.cellCenter[0]);
  let newskin = newSkin.get();
  newSkin.remove();
  newSkin=null;
  piece.data.topLeft = rotate90ccw(piece.data.topLeft,piece.data.cellCenter);
  piece.data.topRight = rotate90ccw(piece.data.topRight,piece.data.cellCenter);
  piece.data.botLeft = rotate90ccw(piece.data.botLeft,piece.data.cellCenter);
  piece.data.botRight = rotate90ccw(piece.data.botRight,piece.data.cellCenter);
  piece.skin = newskin;
  redraw();
}
function rotate90ccw(point,origin){
  let xDist = point[0] - origin[0];
  let yDist = point[1] - origin[1];
  return vecAdd(origin,[-yDist,xDist])
}
class myPiece {
  constructor(skin,skinNoBorder,orientations,pieceRow,pieceCol,pieceData,id,x,y){
    this.skin = skin;
    this.skinNoBorder = skinNoBorder;
    this.orientations = orientations;
    this.row = pieceRow;
    this.col = pieceCol;
    this.data = pieceData;
    this.id = id;
    this.x = x;
    this.y = y;
  }
}
class lightPiece {
  constructor(skin,skinNoBorder,x,y,row,col,id,data){
    this.skin = skin;
    this.skinNoBorder = skinNoBorder;
    this.x = x;
    this.y = y;
    this.row = row;
    this.col = col;
    this.id = id;
    this.data = data;
    this.neighbors = [];
  }
}
function resetVisited(n){
  visited = [];
  for(let i = 0;i<n;i++){
    visited.push(false);
  }
}
function countConnected(s){
  let cnt = 1;
  visited[s]=true;
  for(o of pieceMap[s].neighbors){
    if(!visited[o]){
      cnt += countConnected(o);
    }
  }
  return cnt;
}
function getComponent(s){
  component.push(s);
  for(o of pieceMap[s].neighbors){
    getComponent(o);
  }
}
function getRandomPosition(xmin=0,xmax,ymin=0,ymax){
  let x = Math.floor(Math.random() * (xmax-xmin+1)) + xmin;
  let y = Math.floor(Math.random() * (ymax-ymin+1)) + ymin;
  return [x,y];
}