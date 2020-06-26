function HTMLActuator() {
  this.tileContainer    = document.getElementsByClassName("tile-container")[0];
  this.scoreContainer   = document.getElementsByClassName("score-container")[0];
  this.bestContainer   = document.getElementsByClassName("best-container")[0];
  this.messageContainer = document.getElementsByClassName("game-message")[0];
  this.sharingContainer = document.getElementsByClassName("score-sharing")[0];

  this.score = 0;
  this.best  = 0;
}

HTMLActuator.prototype.actuate = function (grid, metadata) {
  var self = this;

  window.requestAnimationFrame(function () {
    self.clearContainer(self.tileContainer);

    grid.cells.forEach(function (column) {
      column.forEach(function (cell) {
        if (cell) {
          self.addTile(cell);
        }
      });
    });
    
    //console.log(metadata);
    minSearchTime = Math.ceil(Math.log(metadata.score)/Math.log(2)*9.2);
    if(minSearchTime<1) minSearchTime=1;
    self.updateScore(metadata);

    if (metadata.over) self.message(false); // You lose
    if (metadata.won) self.message(true); // You win!
  });
};

HTMLActuator.prototype.restart = function () {
  if (ga) ga("send", "event", "game", "restart");
  this.clearMessage();
};

HTMLActuator.prototype.clearContainer = function (container) {
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
};

HTMLActuator.prototype.addTile = function (tile) {
  var self = this;

  var element   = document.createElement("div");
  var position  = tile.previousPosition || { x: tile.x, y: tile.y };
  positionClass = this.positionClass(position);

  // We can't use classlist because it somehow glitches when replacing classes
  var classes = ["tile", "tile-" + tile.value, positionClass];
  this.applyClasses(element, classes);
    
  var txt = {
    "1":"赵明毅",
    "2":"刘博文",
    "4":"孙祥杰",
    "8":"林伟杰",
    "16":"程子洋大佬",
    "32":"高梓涵大佬",
    "64":"赵紫郡大佬",
    "128":"刘玄辉大佬",
    "256":"胡津铭大佬",
    "512":"刘修良巨佬",
    "1024":"曹家鸣巨佬",
    "2048":"赵伟涵巨佬",
    "4096":"赵煊泽巨佬",
    "8192":"李睿博巨佬",
    "16384":"李佳璇奆佬",
    "32768":"曹瀚文奆佬",
    "65536":"郭星智奆佬",
	"131072":"刘瀚文！",
    "-1":"菜鸡林靖然",
    "-2":"朱恩泽神犇",
    "-4":"二爷"
  };
  element.innerHTML = txt[tile.value]?txt[tile.value]:tile.value;

  if (tile.previousPosition) {
    // Make sure that the tile gets rendered in the previous position first
    window.requestAnimationFrame(function () {
      classes[2] = self.positionClass({ x: tile.x, y: tile.y });
      self.applyClasses(element, classes); // Update the position
    });
  } else if (tile.mergedFrom) {
    classes.push("tile-merged");
    this.applyClasses(element, classes);

    // Render the tiles that merged
    tile.mergedFrom.forEach(function (merged) {
      self.addTile(merged);
    });
  } else {
    classes.push("tile-new");
    this.applyClasses(element, classes);
  }

  // Put the tile on the board
  this.tileContainer.appendChild(element);
};

HTMLActuator.prototype.applyClasses = function (element, classes) {
  element.setAttribute("class", classes.join(" "));
};

HTMLActuator.prototype.normalizePosition = function (position) {
  return { x: position.x + 1, y: position.y + 1 };
};

HTMLActuator.prototype.positionClass = function (position) {
  position = this.normalizePosition(position);
  return "tile-position-" + position.x + "-" + position.y;
};

HTMLActuator.prototype.updateScore = function (score) {
  //console.info("UpdateScore: ");
  //console.info(this);
  this.clearContainer(this.scoreContainer);

  var difference = score.score - this.score;
  this.score = score.score;

  this.scoreContainer.textContent = this.score;

  if (difference > 0) {
    var addition = document.createElement("div");
    addition.classList.add("score-addition");
    addition.textContent = "+" + difference;

    this.scoreContainer.appendChild(addition);
  }
  
  //setBest
  this.clearContainer(this.bestContainer);

  difference = score.best - this.best;
  this.best = score.best;

  this.bestContainer.textContent = this.best;

  if (difference > 0) {
    var addition = document.createElement("div");
    addition.classList.add("score-addition");
    addition.textContent = "=" + this.best;

    this.bestContainer.appendChild(addition);
  }
};

HTMLActuator.prototype.message = function (won) {
  var type    = won ? "game-won" : "game-over";
  var message = won ? "大佬NB！！" : "LRB AKIOI！！"

  // if (ga) ga("send", "event", "game", "end", type, this.score);

  this.messageContainer.classList.add(type);
  this.messageContainer.getElementsByTagName("p")[0].textContent = message;

  //this.clearContainer(this.sharingContainer);
  //this.sharingContainer.appendChild(this.scoreTweetButton());
  twttr.widgets.load();
};

HTMLActuator.prototype.clearMessage = function () {
  this.messageContainer.classList.remove("game-won", "game-over");
};

HTMLActuator.prototype.scoreTweetButton = function () {
  var tweet = document.createElement("a");
  tweet.classList.add("twitter-share-button");
  tweet.setAttribute("href", "https://localhost:1/share");
  tweet.setAttribute("data-via", "gabrielecirulli");
  tweet.textContent = "Tweet";

  var text = "I scored " + this.score + " points at 65536, a game where you " +
             "join numbers to score high! #65536game #65536ai";
  tweet.setAttribute("data-text", text);

  return tweet;
};


HTMLActuator.prototype.showHint = function(hint) {
  document.getElementById('feedback-container').innerHTML = ['↑','→','↓','←'][hint];
}

HTMLActuator.prototype.setRunButton = function(message) {
  document.getElementById('run-button').innerHTML = message;
}
