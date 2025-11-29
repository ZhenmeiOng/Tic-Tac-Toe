import { useState } from 'react'
import './App.css'
import stickerleft from './assets/planet2.png';
import stickerRight from './assets/planet3.png';

export default function Game() {
  const size = 3;
  const [history, setHistory] = useState([Array(size*size).fill(null)]);
  // const [isXNext, setIsXNext] = useState(true);
  const [moveIdx, setMoveIdx] = useState(history.length - 1);
  const currSquares = history[moveIdx];
  const isXNext = moveIdx % 2 === 0;
  const [isReversed, setIsReversed] = useState(false);
  const [moves, setMoves] = useState([null]);
  const [popupContent, setPopupContent] = useState(null);

  function handlePlay(newSquares, clickedSquare) {
    const nextHistory = [...history.slice(0, moveIdx + 1), newSquares];
    const nextMoves = [...moves, clickedSquare];
    // console.log('handlePlay - newSquares:', newSquares, 'nextHistory length:', nextHistory.length);
    setHistory(nextHistory);
    // setIsXNext(!isXNext); // handled when rerendering moveIdx
    setMoveIdx(nextHistory.length - 1);
    setMoves(nextMoves);
  }
  function jumpTo(idx) {
    if (checkWinner(currSquares)) {
      // alert('Game has ended. Restart.');
      setPopupContent(['Invalid action', 'Game has ended. Restart to continue.']);
      return;
    }
    setMoveIdx(idx);
    // when idx==0, isXNext=true, next player is X
    // setIsXNext(idx % 2 == 0); // handled when rerendering moveIdx
  }
  function resetBoard() {
    const newHistory = [Array(size*size).fill(null)];
    setHistory(newHistory);
    // setIsXNext(true); // handled when rerendering moveIdx
    setMoveIdx(newHistory.length - 1);
  }
  let moveList = history.map((squares,idx) => {
    if (idx > 0) {
      const row = Math.floor(moves[idx] / size);
      const col = moves[idx] % size;
      if (idx === moveIdx) {
        return (<li className='currMove' key={idx}>You're currently at ({row}, {col})</li>);
      } else {
        return (
          <li key={idx}>
            <button className='moveItem' onClick={() => jumpTo(idx)}>Go to ({row}, {col})</button>
          </li>);
      }
    }
    return null;
  });
  let ordering;
  if (isReversed) {
    ordering = 'Descending';
    moveList = moveList.reverse();
  } else {
    ordering = 'Ascending';
  }

  function onReverse() {
    setIsReversed(!isReversed);
  }
  return (
    <div className='outerBox'>
      <div className='titleBar'>
        <img src={stickerleft} class='sticker'/>
        <h1>Tic Tac Toe</h1>
        <img src={stickerRight} class='sticker'/>
      </div>
      <div className='game'>
        {popupContent && (
        <div className='popup-overlay'> 
          <div className='popup-content' onClick={(e) => e.stopPropagation()}> 
            <h2>{popupContent[0]}</h2>
            <p>{popupContent[1]}</p> 
            <button className='popup-button' onClick={() => setPopupContent(null)}>OK</button> 
          </div>
        </div>
        )}
        <div className='gameBoard'>
          <Board 
          squares={currSquares} 
          isX={isXNext} 
          onPlay={handlePlay} 
          reset={resetBoard}
          boardSize={size}
          popupContent={setPopupContent}/>
        </div>
        {history.length > 1 &&
        <div className='game-info'>
          <button className='orderButton' onClick={() => onReverse()}>{ordering}</button>
          <ol>{moveList}</ol>
        </div>
        }
      </div>
    </div>
  );
}

// these variables needs to be outside of App
// because the function App is run 
// every time the square is clicked (re-render)
// so every re-render, currPlayer will become 'X',
// and the value showed on clicked squares will only be 'O'
const PLAYER1 = 'X';
const PLAYER2 = 'O';

function Board({squares, isX, onPlay, reset, boardSize, popupContent}) {
  const winner = checkWinner(squares);

  function handleClick(i) {
    if (winner) {
      popupContent(['Game Over', winner + ' has won. Please restart to continue.']);
      return;
    }
    if (squares[i] != null) {
      popupContent(['Invalid action','This square is occupied. Select a different square.']);
      return;
    }
    const newSquares = squares.slice();
    let currPlayer = isX? PLAYER1 : PLAYER2;
    newSquares[i] = currPlayer;
    // console.log('handleClick - i:', i, 'currPlayer:', currPlayer, 'newSquares:', newSquares);
    onPlay(newSquares, i);
  }

  // `status` variable will rerender everytime a square is clicked
  let status = winner
    ? 'Winner: ' + winner
    : 'Next player: ' + (isX? PLAYER1 : PLAYER2);

  const boardRows = Array.from({length:boardSize}).map((_, rowIdx) => {
    return (<div key={rowIdx} className='board'>
      {
        Array.from({length:boardSize}).map((_, colIdx) => {
          const squareIdx = rowIdx * boardSize + colIdx;
          return (<Square 
            key={squareIdx}
            value={squares[squareIdx]}
            onhandleClick={() => handleClick(squareIdx)}
          />);
        })
      }
    </div>);
  });

  return (<>
  <div className='boardContainer'>
    <div className='status'>{status}</div>
    {boardRows}
    <div><ResetButton clickReset={reset}/></div>
  </div>
  </>);
}

function Square({ value, onhandleClick}) {
  return (
    <button 
      className="square"
      onClick={onhandleClick}
    >
      {value}
    </button>
  );
}

function ResetButton({clickReset}) {
  return <button className = 'resetButton' onClick={clickReset}>Restart Game</button>;
}

function checkWinner(squares) {
  const winningLines = [
    // rows
    [0,1,2], [3,4,5], [6,7,8],
    // columns
    [0,3,6], [1,4,7], [2,5,8],
    // diagonals
    [0,4,8], [2,4,6]
  ]
  for (let i = 0; i < winningLines.length; i++) {
    const [a,b,c] = winningLines[i];
    if (squares[a] && squares[a] == squares[b] && squares[a] == squares[c]) {
      return squares[a]; // the winner
    } 
  }
  return null;
}

