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
    loadImage('https://www.artic.edu/iiif/2/4636c76d-8ff1-6f00-b409-e10438d1320b/full/843,/0/default.jpg',function(i){
      img = i;
      imageLoaded=true;
    });
    // img = loadImage('https://www.artic.edu/iiif/2/4a87e43e-8777-d36f-126d-545286eb9c4f/full/843,/0/default.jpg');
    // imageLoaded = true;
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
        
        let p = new lightPiece(pieceGraphics.get(),pieces[i][j].skinNoBorder,0,-50,pieces[i][j].row,pieces[i][j].col,pieces[i][j].id,lightData);
        // console.log(pos);
        if(loadRandom){
          let pos = getRandomPosition(0,width-maxDim,0,height-maxDim);
          p.x = pos[0] - p.data.topLeft[0];
          p.y = pos[1] - p.data.topLeft[1];
          let rotations = Math.floor(Math.random()*4);
          for(let i = 0;i<rotations;i++){
            rotatePiece(p);
          }
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
  if(!started && loadRandom){
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
    if(artData.date_start != null) {
      artDate = artData.date_start;
      if(artDate<0){
        artDate = -artDate;
        artDate  = `${artDate} BC`;
      }
    }
    push();
    textStyle(BOLD);
    text(artTitle,0,img.height+50)
    pop();
    textSize(16);
    text(artist+" - "+artDate,0,img.height+100);
    let controls = "Controls:\nDrag pieces around with the mouse\nspace - see reference image\na - rotate piece\nrefresh for new image";
    text(controls,width-300,100);
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
  console.log(currentlyGrabbed.neighbors)
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
