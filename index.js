"use strict";

// manually load boards for now
/*
const easy = [
    "68532917497-4853262-4761--936257498154961873271829346582394651719-852643456137298",
    "685329174971485326234761859362574981549618732718293465823946517197852643456137298"
  ];
*/

// create variables
var actionList = [];
var action_it = -1;
var timer;
var timePassed;
var selectedNum;
var selectedTile;
var disableSelect;
var board;
var solvedBoard;
var nextEasy;
var nextEasySolved;
var nextMedium;
var nextMediumSolved;
var nextHard;
var nextHardSolved;

window.onload = function() {
    // Run startgame function when button is clicked
    generateNextBoards();
    id("start-btn").classList.add("bigger");
    id("start-btn").addEventListener("click", startGame);
    id("delete-btn").addEventListener("click", updateMove);
    id("undo-btn").addEventListener("click", undoMove);
    id("redo-btn").addEventListener("click", redoMove);
    id("check-btn").addEventListener("click", checkBoard);
    id("restart-btn").addEventListener("click", restartGame);
    // add click event listener to each number in number container
    for (let i = 0; i < id("number-container").children.length; i++) {
        id("number-container").children[i].addEventListener("click", function() {
            // if selecting is not disabled
            if (!disableSelect) {
                // if number is already selected
                if (this.classList.contains("selected")) {
                    // then remove selection
                    this.classList.remove("selected");
                    selectedNum = null;
                } else {
                    for (let i = 0; i < id("number-container").children.length; i++) {
                        id("number-container").children[i].classList.remove("selected");
                    }
                    this.classList.add("selected");
                    selectedNum = this;
                    updateMove();
                }
            }
        });
    }
    // add keydown event listener to window for number container (check for numbers entered)
    window.addEventListener('keydown', function(event) {
        if (event.key == "Backspace" || event.key == "Delete") {
            if (!disableSelect && selectedTile) {
                let remove = true;
                updateMove(remove);
                return;
            }
        }
        if (event.key == "p") {
            console.log(board);
            console.log(solvedBoard);
        }
        let key_num = Number(event.key);
        if (!key_num || key_num < 1 || key_num > 9) return;
        key_num -= 1;
        // if selecting is not disabled
        if (!disableSelect) {
            // if number is already selected
            if (id("number-container").children[key_num].classList.contains("selected")) {
                // then remove selection
                id("number-container").children[key_num].classList.remove("selected");
                selectedNum = null;
            } else {
                for (let i = 0; i < id("number-container").children.length; i++) {
                    id("number-container").children[i].classList.remove("selected");
                }
                id("number-container").children[key_num].classList.add("selected");
                selectedNum = id("number-container").children[key_num];
                updateMove();
            }
        }
    });
}

function generateNextBoards() {
    getBoard("easy");
    getBoard("medium");
    getBoard("hard");
}

function getBoard(difficulty) {
    // get filename
    let fn;
    switch(difficulty) {
        case("easy"): 
            fn = 'easy_puzzles.txt';
            break;
        case("medium"):
            fn = 'medium_puzzles.txt';
            break;
        case("hard"):
            fn = 'hard_puzzles.txt';
            break;
    }
    // read from file
    var lines;
    var r;
    fetch(fn)
        .then(function(response) {
            return response.text();
        })
        .then(function(data) {
            // make array of lines from file
            lines = data.split('\n');
            // console.log(data);
            //Random item number
            r = Math.floor(Math.random() * lines.length);
            if (r%2) r++;
        })
        .then(function() {
            //Get random line and fill boards
            switch(difficulty) {
                case("easy"): 
                    nextEasy = lines[r];
                    nextEasySolved = lines[r+1]
                    break;
                case("medium"):
                    nextMedium = lines[r];
                    nextMediumSolved = lines[r+1];
                    break;
                case("hard"):
                    nextHard = lines[r];
                    nextHardSolved = lines[r+1];
                    break;
            }
        })
    
}

function restartGame() {
    if (!confirm("Are you sure you want to restart?")) {
        return;
    }
    // enables selecting numbers and tiles
    disableSelect = false;

    while(actionList.length > 0) {
        actionList.pop();
    }
    action_it = -1;

    // create board based on difficulty
    generateBoard();

    // clear timer
    if (timer) clearInterval(timer);

    // starts timer
    startTimer();

    // show board
    id("board").classList.remove("hidden");
    //show number container
    for (let i = 0; i < id("number-container").children.length; i++) {
        id("number-container").children[i].classList.remove("hidden");
    }
    id("game-buttons-container").classList.remove("hidden");
}

function startGame() {
    if (timer && !confirm("Are you sure you want to start a new game?")) {
        return;
    }
    // getBoard();
    let difficulty = "";
    if (id("diff-easy").checked) difficulty = "easy";
    else if (id("diff-medium").checked) difficulty = "medium";
    else difficulty = "hard";

    // enables selecting numbers and tiles
    disableSelect = false;

    // create board based on difficulty
    switch(difficulty) {
        case("easy"):
            board = nextEasy;
            solvedBoard = nextEasySolved;
            break;
        case("medium"):
            board = nextMedium;
            solvedBoard = nextMediumSolved;
            break;
        case("hard"):
            board = nextHard;
            solvedBoard = nextHardSolved;
    }

    console.log(board);
    console.log(solvedBoard);

    generateNextBoards();

    generateBoard();

    // clear timer
    if (timer) clearInterval(timer);

    // starts timer
    startTimer();

    // resize new game button
    id("start-btn").classList.remove("bigger");

    // show board
    id("board").classList.remove("hidden");
    //show number container
    for (let i = 0; i < id("number-container").children.length; i++) {
        id("number-container").children[i].classList.remove("hidden");
    }
    id("game-buttons-container").classList.remove("hidden");
}

function startTimer() {
    timePassed = 0;
    // sets initial time for timer (0s)
    id("timer").textContent = timeConversion(timePassed);

    // sets timer to update every second
    timer = setInterval(function() {
        timePassed++;
        id("timer").textContent = timeConversion(timePassed);
    }, 1000)
}

// converts seconds into MM:SS format
function timeConversion(time) {
    let seconds = time % 60;
    if (seconds < 10) seconds = "0" + seconds;
    let minutes = Math.floor(time/60);
    let hours = Math.floor(minutes/60);
    if (hours > 0) {
        minutes = minutes % 60;
        if (minutes < 10) minutes = "0" + minutes;
        return hours + ":" + minutes + ":" + seconds;
    }
    else return minutes + ":" + seconds;
}

function generateBoard() {
    // clear previous board
    clearPrevious();
    
    // Let used to increment tile id's
    let idCount = 0;
    for (let i = 0; i < 81; i++) {
        // create new paragraph element
        let tile = document.createElement("p");
        if (board.charAt(i) != "-") {
            // set tile text to correct number
            tile.textContent = board.charAt(i);
        } else {
            // add click event listener to tile
            tile.addEventListener("click", function() {
                if (!disableSelect) {
                    // if the tile is already selected
                    if (tile.classList.contains("selected")) {
                        // then remove selection
                        tile.classList.remove("selected");
                        selectedTile = null;
                    } else {
                        // deselect all other tiles
                        for (let i = 0; i < 81; i++) {
                            qsa(".tile")[i].classList.remove("selected");
                        }
                        // add selection and update variable
                        tile.classList.add("selected");
                        selectedTile = tile;
                        updateMove();
                    }
                }
            });
        }
        // assign tile id
        tile.id = idCount;
        // increment for next tile
        idCount++;
        // add tile class to all tiles
        tile.classList.add("tile");
        
        // add bottom border to separate sections
        if ((tile.id > 17 && tile.id < 27) || (tile.id > 44 && tile.id < 54)) {
            tile.classList.add("bottomBorder");
        }

        // add right border to separate sections
        if ((tile.id + 1) % 9 == 3 || (tile.id + 1) % 9 == 6) {
            tile.classList.add("rightBorder");
        }

        //add tile to board
        id("board").appendChild(tile);
    }
}

function checkBoard() {
    let tiles = qsa(".tile");
    let done = true;
    for (let i = 0; i < tiles.length; i++) {
        if (!checkCorrect(tiles[i])) {
            if (tiles[i].textContent != "") tiles[i].classList.add("incorrect");
            done = false;
        }
    }
    if (done) endGame();
    else {
        if (selectedTile) {
            selectedTile.classList.remove("selected");
            selectedTile.textContent = "";
            selectedTile = null;
        }
        if (selectedNum) {
            selectedNum.classList.remove("selected");
            selectedNum = null;
        }
    }
}

function undoMove() {
    if (action_it >= 0) {
        //load the current action
        let act = loadAction();
        // undo that action
        let tiles = qsa(".tile");
        selectedTile = tiles[act.tile_idx];
        selectedNum = id("number-container").children[act.num];
        if (act.type == "remove") {
            selectedTile.textContent = selectedNum.textContent;
            selectedTile.classList.add("added");
        }
        if (act.type == "add") {
            selectedTile.textContent = "";
            if (selectedTile.classList.contains("incorrect")) {
                selectedTile.classList.remove("incorrect");
            }
        }
        // decrement action iterator
        action_it--;
        selectedTile = null;
        selectedNum = null;
    }
}

function redoMove() {
    if (action_it < actionList.length-1) {
        // increment action iterator
        action_it++;
        // load next action
        let act = loadAction();
        // redo the changes of that action
        let tiles = qsa(".tile");
        selectedTile = tiles[act.tile_idx];
        selectedNum = id("number-container").children[act.num];
        if (act.type == "add") { 
            selectedTile.textContent = selectedNum.textContent;
            selectedTile.classList.add("added");
        }
        if (act.type == "remove") {
            if (selectedTile.classList.contains("incorrect")) {
                selectedTile.classList.remove("incorrect");
            }
        }
        selectedTile = null;
        selectedNum = null;
    }
}

function updateMove(remove = false) {
    if (remove && selectedTile) {
        saveAction("remove");
        selectedTile.textContent = "";
        if (selectedTile.classList.contains("incorrect")) selectedTile.classList.remove("incorrect");
        selectedTile.classList.remove("selected");
        if(selectedNum) selectedNum.classList.remove("selected");
        selectedTile = null;
        selectedNum = null;
        return;
    }
    // if a tile and number are selected
    else if (selectedTile && selectedNum) {
        // set the tile to the correct number
        selectedTile.classList.add("added");
        selectedTile.textContent = selectedNum.textContent;
        selectedTile.classList.remove("selected");
        selectedNum.classList.remove("selected");
        saveAction("add");
        selectedTile = null;
        selectedNum = null;
        if(checkDone()) {
            endGame();
        }
    }
}

function checkDone() {
    let tiles = qsa(".tile");
    for (let i = 0; i < tiles.length; i++) {
        if (!checkCorrect(tiles[i])) return false;
    }
    return true;
}

function endGame() {
    disableSelect = true;
    clearInterval(timer);
    id("timer").textContent = "All done! Time: " + timeConversion(timePassed);
}

function checkCorrect(tile) {
    // check if tile number is equal to solution's number
    return (solvedBoard.charAt(tile.id) === tile.textContent);
}

function clearPrevious() {
    let tiles = qsa(".tile");
    
    // remove each tile
    for (let i = 0; i < tiles.length; i++) {
        tiles[i].remove();
    }

    // deselect any numbers
    for (let i = 0; i < id("number-container").children.length; i++) {
        id("number-container").children[i].classList.remove("selected");
    }
    selectedTile = null;
    selectedNum = null;
}

// Helper Functions

function loadAction() {
    if (action_it < 0 || action_it >= actionList.length)
        console.error("loadAction(): invalid action_it");   
    let act = actionList[action_it];
    return act;
    
}

function saveAction(action_type) {
    if (action_it >= actionList.length)
        console.error("saveAction(): invalid action_it");
    let act = {
        tile_idx: selectedTile.id,
        num: (Number(selectedTile.textContent) - 1),
        type: action_type
    };
    while(action_it != -1 && action_it < actionList.length - 1) 
        actionList.pop();
    actionList.push(act);
    action_it = actionList.length - 1;
}

function id(id) {
    return document.getElementById(id);
}

function qs(selector) {
    return document.querySelector(selector);
}

function qsa(selector) {
    return document.querySelectorAll(selector);
}