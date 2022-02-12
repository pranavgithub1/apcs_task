
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
  function rotatePiece(piece,originPiece=piece){
  
    let rdim = Math.max(piece.skin.height,piece.skin.width);
    let rotater = createGraphics(rdim*2,rdim*2);
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
  
    let newSkin = createGraphics(piece.skin.width,piece.skin.height);
    // newSkin.pixelDensity(density);
    newSkin.clear();
    newSkin.imageMode(CENTER);
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
    origMouseX = mouseX;
    origMouseY = mouseY;
    [piece.originalGrabbedX,piece.originalGrabbedY] = [piece.x,piece.y];
    // [piece.x,piece.y] = rotate90ccw([piece.x,piece.y],origin);
    // redraw();
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
      this.grabbed = false;
      this.originalGrabbedX;
      this.originalGrabbedY;
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

  function followPosition(tile,x_init,y_init,x_final,y_final){
    tile.x += x_final - x_init;
    tile.y += y_final - y_init;
  }

  function combineGroups(piece1,piece2){
    let group1 = piece1.neighbors.slice();
    group1.push(piece1.id);
    let group2 = piece2.neighbors.slice();
    group2.push(piece2.id);
    // console.log(group1);
    // console.log(group2);
    // piece1.neighbors.push(group2);
    for(o of piece1.neighbors){
      pieceMap[o].neighbors.push(...group2);
    }
    piece1.neighbors.push(...group2);
    // piece2.neighbors.push(group1);
    for(o of piece2.neighbors){
      pieceMap[o].neighbors.push(...group1);
    }
    piece2.neighbors.push(...group1);
    // console.log(piece1.neighbors);
    // console.log(piece2.neighbors);
  }
  
  // check if piece has is close enough to snap to a fit. If there is a fit, snap the piece and its neighbors, and return true.
  // Otherswise return false
  function fit(piece){
    let xy = [piece.x,piece.y];
    let curTopLeft = vecAdd(piece.data.topLeft,xy);
    let curTopRight = vecAdd(piece.data.topRight,xy);
    let curBotLeft = vecAdd(piece.data.botLeft,xy);
    let curBotRight = vecAdd(piece.data.botRight,xy);
    // let foundfit = false;
    let x_init = piece.x;
    let y_init = piece.y;
    // let orig_neighbors = piece.neighbors.slice();
    // console.log(orig_neighbors);
    // top fit
    let fitSens = 12;
    if(piece.row > 0 && !piece.neighbors.includes(piece.id - pieceCount[0])){
      let top = pieceMap[piece.id - pieceCount[0]];
      let xyt = [top.x,top.y];
      let topBotLeft = vecAdd(top.data.botLeft,xyt);
      let topBotRight = vecAdd(top.data.botRight,xyt)
      if(pointDist(...curTopLeft,...topBotLeft)<fitSens && pointDist(...curTopRight,...topBotRight)<fitSens){
        console.log("top fit");
        [piece.x,piece.y] = vecAdd(topBotLeft,piece.data.topLeft,-1);
        for(o of piece.neighbors){
          followPosition(pieceMap[o],x_init,y_init,piece.x,piece.y);
        }
        combineGroups(piece,top);
        
        // for(o of piece.neighbors){
        //   pieceMap[o].neighbors.push(top.id,...top.neighbors);
        // }
        // piece.neighbors.push(top.id,...top.neighbors);
        // top.neighbors.push(piece.id,...orig_neighbors);
        // // top.neighbors.push(piece.id,...orig_neighbors);
        // foundfit = true;
        return true;
      }
    }
    // bottom fit
    if(piece.row+1 < pieceCount[1] && !piece.neighbors.includes(piece.id + pieceCount[0])){
      let bot = pieceMap[piece.id + pieceCount[0]];
      let xyb = [bot.x,bot.y];
      let botTopLeft = vecAdd(bot.data.topLeft,xyb);
      let botTopRight = vecAdd(bot.data.topRight,xyb);
      if(pointDist(...curBotLeft,...botTopLeft)<fitSens && pointDist(...curBotRight,...botTopRight)<fitSens){
        console.log("bot fit");
        console.log(piece.id,bot.id);
        [piece.x,piece.y] = vecAdd(botTopLeft,piece.data.botLeft,-1);
        for(o of piece.neighbors){
          followPosition(pieceMap[o],x_init,y_init,piece.x,piece.y);
        }
        combineGroups(piece,bot);
        // for(o of piece.neighbors){
        //   pieceMap[o].neighbors.push(bot.id,...bot.neighbors);
        // }
        // piece.neighbors.push(bot.id,...bot.neighbors);
        // bot.neighbors.push(piece.id,...orig_neighbors);
        // foundfit = true;
        return true;
      }
    }
    // left fit
    if(piece.col > 0 && !piece.neighbors.includes(piece.id-1)){
      let left = pieceMap[piece.id-1];
      let xyl = [left.x,left.y];
      let leftTopRight = vecAdd(left.data.topRight,xyl);
      let leftBotRight = vecAdd(left.data.botRight,xyl);
      if(pointDist(...curBotLeft,...leftBotRight)<fitSens && pointDist(...curTopLeft,...leftTopRight)<fitSens){
        console.log("left fit");
        [piece.x,piece.y] = vecAdd(leftBotRight,piece.data.botLeft,-1);
        for(o of piece.neighbors){
          followPosition(pieceMap[o],x_init,y_init,piece.x,piece.y);
        }
        combineGroups(piece,left);
        // for(o of piece.neighbors){
        //   pieceMap[o].neighbors.push(left.id,...left.neighbors);
        // }
        // piece.neighbors.push(left.id,...left.neighbors);
        // left.neighbors.push(piece.id,...orig_neighbors);
        // foundfit = true;
        return true;
      }
    }
    // right fit
    if(piece.col+1 < pieceCount[0] && !piece.neighbors.includes(piece.id+1)){
      let right = pieceMap[piece.id+1];
      let xyr = [right.x,right.y];
      let rightBotLeft = vecAdd(right.data.botLeft,xyr);
      let rightTopLeft = vecAdd(right.data.topLeft,xyr);
      if(pointDist(...curBotRight,...rightBotLeft)<fitSens && pointDist(...curTopRight,...rightTopLeft)<fitSens){
        console.log("right fit");
        [piece.x,piece.y] = vecAdd(rightTopLeft,piece.data.topRight,-1);
        for(o of piece.neighbors){
          followPosition(pieceMap[o],x_init,y_init,piece.x,piece.y);
        }
        combineGroups(piece,right);
        // for(o of piece.neighbors){
        //   pieceMap[o].neighbors.push(right.id,...right.neighbors);
        // }
        // piece.neighbors.push(right.id,...right.neighbors);
        // right.neighbors.push(piece.id,...orig_neighbors);
        // foundfit = true;
        return true;
      }
    }
    return false;
  }