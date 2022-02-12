let sketch = function(p) {
  
  p.preload = function() {
    if(loadRandom){
      p.loadImage(imageURL,function(i){
        img = i;
        imageLoaded=true;
      });
      // let randomPage = int(random(0,400));
      // let url = endpoint+`?page=${randomPage}`;
      // p.httpGet(url,'json',false,function(response){
      //   console.log(response);
      //   data = response;
      //   let randomIndex = int(random(0,12));
      //   let image_id = data.data[randomIndex].image_id;
      //   artData = data.data[randomIndex];
      //   console.log(image_id);
      //   if(image_id===null) {
      //     imageLoaded = true;
      //     return;
      //   }
      //   let imageURL = `https://www.artic.edu/iiif/2/${image_id}/full/843,/0/default.jpg`;
      //   console.log(imageURL);
      //   p.loadImage(imageURL,function(i){
      //     img = i;
      //     imageLoaded = true;
      //   });
      // });
    }
    else {
      let defaultImg = "https://www.artic.edu/iiif/2/4a87e43e-8777-d36f-126d-545286eb9c4f/full/843,/0/default.jpg";
      p.loadImage(defaultImg,function(i){
        img = i;
        imageLoaded=true;
      });
      // img = loadImage('https://www.artic.edu/iiif/2/4a87e43e-8777-d36f-126d-545286eb9c4f/full/843,/0/default.jpg');
      // imageLoaded = true;
    }  
  }
  
  p.setup = function() {
    p.createCanvas(document.documentElement.clientWidth*0.9, document.documentElement.clientHeight*0.9);
    p.background(255);
    p.pixelDensity(1);
    // density = pixelDensity();
    console.log(density);
    // console.log(window)
  }

  p.draw = function() {
    if(!imageLoaded) {
      p.text('Loading...',p.width/2,p.height/2);
      return;
    }
    // 303
    if(img==null){
      p.background(255);
      p.text('Image fetch failed, please reload',p.width/2,p.height/2);
      return;
    }
  
    if(!pieceGen){
      p.background(255);
      p.text('Generating Puzzle...',p.width/2,p.height/2);
      // resize image and generate piece bounds as squares
      img.resize(0,p.height*0.75);
      let imgWHratio = img.height / img.width;
      // pieceCount[0] = Math.floor(img.width/100);
      pieceCount[1] = Math.ceil(pieceCount[0] * imgWHratio);
      // generate the pieces
      pieceId = 0;
      resetVisited(pieceCount[0]*pieceCount[1]);
      referenceImage = p.createImg(img.canvas.toDataURL(),'referenceImage').hide();
  
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
          let p1 = generatePiece(i,j,pieceId);
          pieceId++;
          pieces[i].push(p1);
          // piecesToDraw.push(p);
        }
      }
      for(let i = 0;i<pieceCount[1];i++){
        for(let j = 0;j<pieceCount[0];j++){
          let pieceCol = j;
          let pieceRow = i;
          let topLeftX = prefxDims[pieceCol];
          let topLeftY = prefyDims[pieceRow];
          // let pieceGraphics = createGraphics(maxDim*pieceCount[0],maxDim*pieceCount[1]);
          let pieceGraphics = p.createGraphics(maxDim,maxDim);
          // pieceGraphics.pixelDensity(density);
          pieceGraphics.clear();
          let center = [maxDim/2,maxDim/2];
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
          
          let p1 = new lightPiece(pieceGraphics.get(),pieces[i][j].skinNoBorder,topLeftX,topLeftY,pieces[i][j].row,pieces[i][j].col,pieces[i][j].id,lightData);
          // console.log(pos);
          if(loadRandom){
            let pos = getRandomPosition(0,p.width-maxDim,0,p.height-maxDim);
            p1.x = pos[0] - p1.data.topLeft[0];
            p1.y = pos[1] - p1.data.topLeft[1];
            let rotations = Math.floor(Math.random()*4);
            for(let i = 0;i<rotations;i++){
              rotatePiece(p1);
            }
          }
          pieceGraphics.remove();
          pieceGraphics = null;
          piecesToDraw.push(p1);
          
        }
      }
      pieces = null;
      pieceMap = piecesToDraw.slice();
      pieceGen=true;
    }
    // if(!started && loadRandom){
    //   p.background(255);
    //   p.image(img,0,0);
    //   p.textSize(32);
    //   p.fill('black');
    //   // stroke('white');
    //   // text('Jigsaw Puzzle',0,img.height+50)
    //   p.textSize(18);
    //   let artTitle = "Unknown title";
    //   let artist = "Unkown artist";
    //   let artDate = "unknown date"
    //   if(artData.title != null) artTitle = artData.title;
    //   if(artData.artist_title != null) artist = artData.artist_title;
    //   if(artData.date_start != null) {
    //     artDate = artData.date_start;
    //     if(artDate<0){
    //       artDate = -artDate;
    //       artDate  = `${artDate} BC`;
    //     }
    //   }
    //   p.push();
    //   p.textStyle(BOLD);
    //   p.text(artTitle,0,img.height+50)
    //   p.pop();
    //   p.textSize(16);
    //   p.text(artist+" - "+artDate,0,img.height+100);
    //   let controls = "Controls:\nDrag pieces around with the mouse\nspace - see reference image\na - rotate piece\nrefresh for new image";
    //   p.text(controls,p.width-300,100);
    //   textFadeCounter+=fade;
    //   if(textFadeCounter === 150 || textFadeCounter === 0) fade = -fade;
    //   p.fill(0,0,0,textFadeCounter);
    //   p.push();
    //   p.textStyle(BOLD);
    //   p.text('Press enter to start',p.width/2,p.height/2);
    //   p.pop();
    //   return;
    // }
    // noLoop();
    p.background(255);
    for(piece of piecesToDraw){
      p.image(piece.skin,piece.x,piece.y);
      // noFill();
      // rect(piece.x,piece.y,piece.skin.width,piece.skin.height);
    }
  }

  p.keyPressed = function() {
    if(p.key === 'a' && currentlyGrabbed!=null){
      // let origin = [currentlyGrabbed.x,currentlyGrabbed.y]
      let originPiece = currentlyGrabbed;
      rotatePiece(currentlyGrabbed,originPiece);
      for(o of currentlyGrabbed.neighbors){
        rotatePiece(pieceMap[o],originPiece);
      }
    }
    if(p.key === ' '){
      if(showingImage){
        referenceImage.hide();
        showingImage = false;
      }
      else {
        referenceImage.show();
        showingImage = true;
      }
    }
    if(p.keyCode=== p.ENTER){
      started = true;
    }
    return false;
  }

  p.mousePressed = function() {
    for(let i = piecesToDraw.length-1;i>=0;i--){
      let [r,g,b,a] = piecesToDraw[i].skin.get(p.mouseX-piecesToDraw[i].x,p.mouseY-piecesToDraw[i].y);
      if(a!=0) {
        currentlyGrabbed = piecesToDraw[i];
        // grabbedX = mouseX - currentlyGrabbed.x;
        // grabbedY = mouseY - currentlyGrabbed.y;
  
        // originalGrabbedX = currentlyGrabbed.x;
        // originalGrabbedY = currentlyGrabbed.y;
  
        piecesToDraw.splice(i,1);
        piecesToDraw = piecesToDraw.filter(piece => !currentlyGrabbed.neighbors.includes(piece.id))
        piecesToDraw.push(currentlyGrabbed,...(currentlyGrabbed.neighbors.map(e => pieceMap[e])));
        // return;
        origMouseX = p.mouseX;
        origMouseY = p.mouseY;
        currentlyGrabbed.grabbed = true;
        currentlyGrabbed.originalGrabbedX = currentlyGrabbed.x;
        currentlyGrabbed.originalGrabbedY = currentlyGrabbed.y;
        for(o of currentlyGrabbed.neighbors){
          pieceMap[o].grabbed = true;
          pieceMap[o].originalGrabbedX = pieceMap[o].x;
          pieceMap[o].originalGrabbedY = pieceMap[o].y
        }
        return;
      }
    }
  }

  p.mouseDragged = function() {
    // if(currentlyGrabbed!=null && currentlyGrabbed.neighbors.length!=0){
    //   for(o of currentlyGrabbed.neighbors){
    //     pieceMap[o].neighbors = pieceMap[o].neighbors.filter(e => e!=currentlyGrabbed.id);
    //   }
    //   currentlyGrabbed.neighbors = [];
    // }
    if(currentlyGrabbed!=null){
      let dispX = p.mouseX - origMouseX;
      let dispY = p.mouseY - origMouseY;
      currentlyGrabbed.x = currentlyGrabbed.originalGrabbedX + dispX;
      currentlyGrabbed.y = currentlyGrabbed.originalGrabbedY + dispY;
      for(o of currentlyGrabbed.neighbors){
        pieceMap[o].x = pieceMap[o].originalGrabbedX + dispX;
        pieceMap[o].y = pieceMap[o].originalGrabbedY + dispY;
      }
      // for(piece of piecesToDraw){
      //   if(!piece.grabbed) continue;
      //   piece.x = piece.originalGrabbedX + dispX;
      //   piece.y = piece.originalGrabbedY + dispY;
      // }
      // redraw();
    }
  }

  p.mouseReleased = function() {
    if(currentlyGrabbed === null) return;

    // for every grabbed piece
    // console.log(currentlyGrabbed.neighbors);
    for(piece of piecesToDraw){
      if(!piece.grabbed) continue;
      // if the piece is grabbed, check whether it is near enough to snap to one of its fits
      if(fit(piece)){
        if(currentlyGrabbed.neighbors.length === (pieceCount[0]*pieceCount[1])-1){
          alert("Congragulations on solving the puzzle");
        }
        break;
      }
    }
    
    for(piece of piecesToDraw){
      if(!piece.grabbed) continue;
      piece.grabbed = false;
      piece.originalGrabbedX = null;
      piece.originalGrabbedY = null;
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
    let pieceWithBorder = p.createGraphics(img.width,img.height);
    pieceWithBorder.pixelDensity(density);
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
    let p1 = new myPiece(pieceWithBorder.get(),tempImage,curOrientations,pieceRow,pieceCol,pieceData,pieceId,100,100);
    pieceWithBorder.remove();
    pieceWithBorder = null;
    return p1;
  };
  
  function generateMask(pieceRow,pieceCol,orientations) {
    // let pieceX = prefxDims[pieceCol];
    // let pieceY = prefyDims[pieceRow];
    let pieceMask = p.createGraphics(img.width,img.height);
    pieceMask.pixelDensity(density);
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

  function rotatePiece(piece,originPiece=piece){
  
    let rdim = Math.max(piece.skin.height,piece.skin.width);
    let rotater = p.createGraphics(rdim*2,rdim*2);
    // rotater.pixelDensity(density);
    rotater.clear();
    rotater.translate(rotater.width/2,rotater.height/2);
    rotater.rotate(Math.PI/2);
    rotater.image(piece.skin,0,0);
    let rotated = rotater.get();
    // let rotated = createImage(rotater.width * density,rotater.height * density);
    // rotated.copy(rotater,0,0,rotater.width,rotater.height,0,0,rotater.width*density,rotater.height*density);
    rotater.remove();
    rotater=null;
  
    let newSkin = p.createGraphics(piece.skin.width,piece.skin.height);
    // newSkin.pixelDensity(density);
    newSkin.clear();
    newSkin.imageMode(p.CENTER);
    newSkin.image(rotated,piece.data.cellCenter[0]+piece.data.cellCenter[1],piece.data.cellCenter[1]-piece.data.cellCenter[0]);
    let newskin = newSkin.get();
    // let newskin = 
    newSkin.remove();
    newSkin=null;
    piece.data.topLeft = rotate90ccw(piece.data.topLeft,piece.data.cellCenter);
    piece.data.topRight = rotate90ccw(piece.data.topRight,piece.data.cellCenter);
    piece.data.botLeft = rotate90ccw(piece.data.botLeft,piece.data.cellCenter);
    piece.data.botRight = rotate90ccw(piece.data.botRight,piece.data.cellCenter);
    piece.skin = newskin;

    let originOfRotation = [originPiece.x + originPiece.data.cellCenter[0],originPiece.y + originPiece.data.cellCenter[1]];
    let pieceCenter = [piece.x + piece.data.cellCenter[0],piece.y + piece.data.cellCenter[1]];
    let rotatedCenter = rotate90ccw(pieceCenter,originOfRotation);
    [piece.x,piece.y] = [rotatedCenter[0] - piece.data.cellCenter[0],rotatedCenter[1] - piece.data.cellCenter[1]];
    origMouseX = p.mouseX;
    origMouseY = p.mouseY;
    [piece.originalGrabbedX,piece.originalGrabbedY] = [piece.x,piece.y];
    // [piece.x,piece.y] = rotate90ccw([piece.x,piece.y],origin);
    // redraw();
  }
}









