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