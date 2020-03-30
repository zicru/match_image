let header = document.querySelector('.game-header'),
    gameArea = document.querySelector('.game-area'),
    paused = false,
    fetchedData,
    headerHeight = header.getBoundingClientRect().height,
    imageMatchSize = {
        width: 240,
        height: 240
    },
    imageMatchedPosition = {
        top: (window.innerHeight - headerHeight - imageMatchSize.height) / 2,
        left: (window.innerWidth - imageMatchSize.width) / 2
    },
    gameData = {},
    counter,
    position,
    range,
    stepSize,
    middleStepPosition,
    matched = false,
    score = 0,
    animationFrameHandle,
    currentLevelIndex = 7,
    timeSinceLastClick = 0,
    rapidClickCount = 0,
    rapidClickSpeed = 75,
    timesClicked = 0;

let matchingPositionElement = document.querySelector('#matching-position'),
    matchingElement = document.querySelector('#matching-element');


matchingPositionElement.style.top = imageMatchedPosition.top + 'px';
matchingPositionElement.style.left = imageMatchedPosition.left + 'px';

matchingElement.style.top = imageMatchedPosition.top + 'px';

window.setInterval(() => {
    timeSinceLastClick++;
}, 1);

document.addEventListener('click', () => {
    paused = !paused;

    if (timeSinceLastClick <= rapidClickSpeed) {
        rapidClickCount++;

        if (rapidClickCount > 2) {
            rapidClickCount = 0;

            timesClicked += 20;
            return false;
        }
    } else {
        rapidClickCount = 0;
    }

    timeSinceLastClick = 1;
    if (paused) timesClicked++;


    if (paused && matched) {
        score += calculateScoreForLevel();

        currentLevelIndex++;
        window.cancelAnimationFrame(animationFrameHandle);

        if (currentLevelIndex >= fetchedData.levels.length) {
            endGame();
        }
        initializeParameters(fetchedData.levels);
    }
});

function moveIt() {
    animationFrameHandle = requestAnimationFrame(moveIt);

    if (paused) return false;

    if (counter % gameData.speedFactor === 0)  {
        if (position === middleStepPosition) {
            matched = true;
            matchingElement.style.left = imageMatchedPosition.left + 'px';
        } else {
            matchingElement.style.left = position * stepSize + 'px';
            if (matched) matched = false;
        }
        position++;
    }
    counter++;

    if (position === gameData.stepCount) position = 0;
}


function startGame(gamemode) {
    let xhr = new XMLHttpRequest();

    xhr.open('POST',`level-data/${gamemode}-mode.json`, true);
    xhr.send();

    xhr.onreadystatechange = function() {
        if (this.status === 200 && this.readyState === 4) {
            fetchedData = JSON.parse(this.responseText);

            initializeParameters(fetchedData.levels);
        }
    }
}

function initializeParameters(data) {
    gameData.stepCount = data[currentLevelIndex].stepCount;
    gameData.speedFactor = data[currentLevelIndex].speedFactor;
    timesClicked = 0;

    runLevel();
}

function runLevel() {
    counter = 0;
    position = 0;

    range = window.innerWidth + imageMatchSize.width;
    stepSize = range / gameData.stepCount;
    middleStepPosition = Math.floor(gameData.stepCount / 2) - 2;

    moveIt();
}

function calculateScoreForLevel() {
    let maxScore = (700 * Math.pow((currentLevelIndex + 1), 2)) + 2000;

    return maxScore - (timesClicked > 10 ? 10 * timesClicked : Math.pow(timesClicked, 2)) * 379;
}

function endGame() {
    document.querySelector('#score').innerHTML = `${score}`;

    document.querySelector('.finished').style.display = 'flex';
}

startGame('normal');







