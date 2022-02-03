
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

    let originOfRotation = [originPiece.x + originPiece.data.cellCenter[0],originPiece.y + originPiece.data.cellCenter[1]];
    let pieceCenter = [piece.x + piece.data.cellCenter[0],piece.y + piece.data.cellCenter[1]];
    let rotatedCenter = rotate90ccw(pieceCenter,originOfRotation);
    [piece.x,piece.y] = [rotatedCenter[0] - piece.data.cellCenter[0],rotatedCenter[1] - piece.data.cellCenter[1]];
    origMouseX = mouseX;
    origMouseY = mouseY;
    [piece.originalGrabbedX,piece.originalGrabbedY] = [piece.x,piece.y];
    // [piece.x,piece.y] = rotate90ccw([piece.x,piece.y],origin);
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