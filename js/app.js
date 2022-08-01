'use strict'

const WALL = 'WALL'
const FLOOR = 'FLOOR'
const BALL = 'BALL'
const GAMER = 'GAMER'
const GLUE = 'GLUE'

const GAMER_IMG = '<img src="img/gamer.png" />'
const BALL_IMG = '<img src="img/ball.png" />'
const GLUE_IMG = '<img src="img/Glue.png" />'
const eatingAudio = new Audio('sound/eating-sound.audio')


var gBoard
var gGamerPos
var gBallsCounter
var gGlueInterval
var gIsStuck
var gBallInterval
var gAddBallsCounter

function initGame() {
    if(gBallsCounter)gBallsCounter=0
    gGamerPos = { i: 2, j: 9 }
    gBoard = buildBoard()
    renderBoard(gBoard)
    closeModal()
    gIsStuck = false
    gBallInterval = setInterval(addBall, 4000)
    gGlueInterval = setInterval(addGlue, 2000)
    gAddBallsCounter = 2
    gBallsCounter = 0
}

function buildBoard() {
    // Create the Matrix
    var board = createMat(10, 12)


    // Put FLOOR everywhere and WALL at edges
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            // Put FLOOR in a regular cell
            var cell = { type: FLOOR, gameElement: null }

            // Place Walls at edges
            if (i === 0 || i === board.length - 1 ||
                j === 0 || j === board[0].length - 1) {
                cell.type = WALL
            }

            //Passages
            if (i === 0 && j === 5 ||
                j === 0 && i === 5 ||
                j === 5 && i === board.length - 1 ||
                j === board[0].length - 1 && i === 5) {
                cell.type = FLOOR
            }

            // Add created cell to The game board
            board[i][j] = cell
        }
    }

    // Place the gamer at selected position
    board[gGamerPos.i][gGamerPos.j].gameElement = GAMER

    // Place the Balls (currently randomly chosen positions)
    board[3][8].gameElement = BALL
    board[7][4].gameElement = BALL

    console.log(board)
    return board
}

// Render the board to an HTML table
function renderBoard(board) {

    var strHTML = ''
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>\n'
        for (var j = 0; j < board[0].length; j++) {
            var currCell = board[i][j]

            var cellClass = getClassName({ i, j })

            // TODO - change to short if statement
            // if (currCell.type === FLOOR) cellClass += ' floor'
            // else if (currCell.type === WALL) cellClass += ' wall'
            cellClass += (currCell.type === FLOOR) ? ' floor' : ' wall'



            strHTML += `\t<td class="cell ${cellClass}"  onclick="moveTo(${i}, ${j})" >\n`

            // TODO - change to switch case statement
            // if (currCell.gameElement === GAMER) {
            //     strHTML += GAMER_IMG
            // } else if (currCell.gameElement === BALL) {
            //     strHTML += BALL_IMG
            // }
            switch (currCell.gameElement) {
                case GAMER:
                    strHTML += GAMER_IMG
                    break
                case BALL:
                    strHTML += BALL_IMG
                    break

                default: console.log('nothing in the switch case ')

            }


            strHTML += '\t</td>\n'
        }
        strHTML += '</tr>\n'
    }

    var elBoard = document.querySelector('.board')
    elBoard.innerHTML = strHTML
}
// Move the player by keyboard arrows
function handleKey(event) {

    var i = gGamerPos.i
    var j = gGamerPos.j


    switch (event.key) {
        case 'ArrowLeft':
            moveTo(i, j - 1)
            break
        case 'ArrowRight':
            moveTo(i, j + 1)
            break
        case 'ArrowUp':
            moveTo(i - 1, j)
            break
        case 'ArrowDown':
            moveTo(i + 1, j)
            break
            default:console.log('wrong key'.event.key)

    }

}

function renderCell(location, value) {
    var cellSelector = '.' + getClassName(location)
    var elCell = document.querySelector(cellSelector)
    elCell.innerHTML = value
}
// Move the player to a specific location
function moveTo(i, j) {
    if (gIsStuck) return

    if (i === -1) i = gBoard.length - 1
    else if (i === gBoard.length) i = 0
    else if (j === -1) j = gBoard[0].length - 1
    else if (j === gBoard[0].length) j = 0

    var targetCell = gBoard[i][j]
    if (targetCell.type === WALL) return

    // Calculate distance to make sure we are moving to a neighbor cell
    var iAbsDiff = Math.abs(i - gGamerPos.i)
    var jAbsDiff = Math.abs(j - gGamerPos.j)
    // If the clicked Cell is one of the Eight allowed
    if ((iAbsDiff === 1 && jAbsDiff === 0) ||
        (jAbsDiff === 1 && iAbsDiff === 0) ||
        //The passages 
        (iAbsDiff === gBoard.length-1 && 
            jAbsDiff === 0) ||
        (iAbsDiff === 0 && jAbsDiff === gBoard[0].length)) {

        if (targetCell.gameElement === BALL) {
            gBallsCounter++
            gAddBallsCounter--
            var elBallCounter = document.querySelector('.counter-ball')
            elBallCounter.innerText = gBallsCounter
            eatingAudio.play()
            checkGameOver()
        }

        else if (targetCell.gameElement === GLUE) {
            gIsStuck = true

            setTimeout(() => {
                gIsStuck = false
            }, 3000)
        }

        // MOVING from current position
        // Model:
        gBoard[gGamerPos.i][gGamerPos.j].gameElement = null
        // Dom:
        renderCell(gGamerPos, '')

        // MOVING to selected position
        // Model:
        gGamerPos.i = i
        gGamerPos.j = j
        gBoard[gGamerPos.i][gGamerPos.j].gameElement = GAMER
        // DOM:
        renderCell(gGamerPos, GAMER_IMG)
    }
}

// Convert a location object {i, j} to a selector and render a value in that element

function addBall() {
    var randLocation = getEmptyCell()
    var cell = gBoard[randLocation.i][randLocation.j]

    //MODEL
    cell.gameElement = BALL
    //DOM
    renderCell(randLocation, BALL_IMG)
    gAddBallsCounter++
}

function addGlue() {
    var randLocation = getEmptyCell()
    var cell = gBoard[randLocation.i][randLocation.j]
    setTimeout(removeGlue, 3000, randLocation)

    //MODEL
    cell.gameElement = GLUE
    //DOM
    renderCell(randLocation, GLUE_IMG)
}

function removeGlue(locationObj) {
    // //MODEL
    if(gBoard[locationObj.i][locationObj.j].gameElement === GAMER) return
    gBoard[locationObj.i][locationObj.j].gameElement = null
    // //DOM
    renderCell(locationObj, '')
}

function getEmptyCell() {
    var emptyCells = []
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            var cell = gBoard[i][j]
            if (!cell.gameElement && cell.type === FLOOR) { // null = false ( not emptyCells)
                emptyCells.push({ i, j })
            }
        }
    }
    var randFloorIdx = getRandomInt(0, emptyCells.length)
    return emptyCells[randFloorIdx]
}

function checkGameOver() {
    if (gAddBallsCounter === 0) {
        clearInterval(gBallInterval)
        clearInterval(gGlueInterval)
        //
        console.log('GAME OVER')
        showModal()
    }
}

function showModal() {
    var elModal = document.querySelector('.modal')
    elModal.style.display = 'block'
}

function closeModal() {
    var elModal = document.querySelector('.modal')
    elModal.style.display = 'none'
}

// Returns the class name for a specific cell
function getClassName(location) {
    var cellClass = `cell-${location.i}-${location.j}`
    return cellClass
}

