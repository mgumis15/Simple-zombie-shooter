let board = document.querySelector(".board")
let mouse = document.querySelector(".cursor")
let stats = document.querySelector("h1")
let livesDisplay = document.querySelector("#lives")
let nickDisplay = document.querySelector(".board h2")
let finnalStat = document.querySelector(".endModal p span")
let lives = 3
let points = 0

//Funkcje obsługujące rozgrywkę
cursorMove = (e) => {
    mouse.style.top = e.pageY + "px"
    mouse.style.left = e.pageX + "px"
}

endGame = () => {
    let zombies = document.querySelectorAll(".zombie")
    clearInterval(board.waves)
    for (const zombie of zombies) {
        clearInterval(zombie.animation)
        zombie.remove()
    }
    board.removeEventListener("click", wrongShoot)
    finnalStat.textContent = points
    modal.style.display = "flex"
    endModal.style.display = "flex"
    mouse.style.display = 'none'
    getData()
}

animate = (zombie, speed) => {
    zombie.style.backgroundPosition = zombie.animPos + "px"
    zombie.animPos -= 200
    if (zombie.animPos == -2000) zombie.animPos = 0
    zombie.posX -= (speed * 0.5)
    zombie.style.left = zombie.posX + "%"
    if (zombie.getBoundingClientRect().left < -300) {
        lives -= 1
        updateLives(lives)
        if (lives <= 0) endGame()
        zombie.remove()

    }
}
updateLives = (lives) => {
    livesDisplay.innerHTML = "&#10084;".repeat(lives)
}
updatePoints = (points) => {
    let showPoints = points.toString()
    stats.innerHTML = "0".repeat(5 - showPoints.length) + showPoints
}
wrongShoot = (e) => {
    e.stopPropagation()
    points -= 6
    if (points < 0) points = 0
    updatePoints(points)
}


shootZombie = (e) => {
    e.stopPropagation()
    e.preventDefault()
    clearInterval(e.target.animation)
    e.target.remove()
    points += 12
    updatePoints(points)
}
board.addZombie = (randomScale) => {
    let maxh = 100
    if (window.innerHeight > 800) {
        maxh = (window.innerHeight - 800) / 2
    }

    // let randomPosition=Math.floor(Math.random() * (25)) 
    let randomPosition = Math.floor(Math.random() * (maxh + 1))
    let randomSpeed = Math.floor(Math.random() * (5) + 1)
    let zombie = document.createElement('div')
    zombie.className = "zombie"
    zombie.animPos = 0
    zombie.posX = 110
    zombie.style.transform = `scale(${randomScale})`
    zombie.style.bottom = randomPosition + "px"
    zombie.addEventListener("click", (e) => { shootZombie(e) })

    zombie.animation = setInterval(function () { animate(zombie, randomSpeed) }, 42)
    board.appendChild(zombie)

}
wave = (board) => {
    let randomTime = Math.floor((Math.random() * (2500)) + 500)
    let randomScale = Math.floor((Math.random() * (5)) + 9) / 10

    setTimeout(board.addZombie(randomScale), randomTime)
}
restartGame = () => {
    lives = 3
    points = 0
    updateLives(lives)
    updatePoints(points)
    board.addEventListener("click", wrongShoot)
    board.waves = setInterval(function () { wave(board) }, 600)
    modal.style.display = "none"

    mouse.style.display = "block"
}



//funkcje obsługujące graczy

let modal = document.querySelector(".modal")
let startModal = document.querySelector(".startModal")
let endModal = document.querySelector(".endModal")

let form = document.forms["form"]
let startButton = form["startGame"]
let nick = form["nick"]
let restart = document.querySelector("button")
restart.addEventListener("click", restartGame)


validateForm = (e) => {
    e.preventDefault()
    nick.style.border = "1px solid blue"
    nick.value = nick.value.trim()
    if (nick.value.length < 1) {
        nick.value = ""
        nick.placeholder = "Wprowadź nick!"
        nick.style.border = "1px solid red"
    } else {
        nickDisplay.innerHTML = nick.value
        modal.style.display = "none"
        startModal.style.display = "none"
        endModal.style.display = "flex"
        mouse.style.display = "block"
        document.addEventListener('mousemove', cursorMove)
        board.addEventListener("click", wrongShoot)
        board.waves = setInterval(function () { wave(board) }, 600)
    }
}

getData = () => {
    fetch("https://jsonblob.com/api/jsonBlob/1077540322355200000", {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.json())
        .then(result => {
            updateData(result)

        })

        .catch((err) => {
            console.log("error", err)
        })
}
makeRank = (data) => {
    let list = document.querySelector("table")
    list.innerHTML = "<tr><th>Rank.</th><th>Nick</th><th>Wynik</th><th>Data</th></tr>"

    for (const user in data) {
        let newLi = document.createElement("tr")
        let newPlace = document.createElement("td")
        let newNick = document.createElement("td")
        let newScore = document.createElement("td")
        let newDate = document.createElement("td")
        newPlace.innerHTML = (parseInt(user) + 1) + "."
        newNick.innerHTML = data[user].nick
        newScore.innerHTML = data[user].score
        newDate.innerHTML = data[user].date
        newLi.appendChild(newPlace)
        newLi.appendChild(newNick)
        newLi.appendChild(newScore)
        newLi.appendChild(newDate)
        list.appendChild(newLi)
    }
}
updateData = (data) => {
    let newUser = {
        nick: nick.value,
        score: points,
        date: ""
    }
    let date = new Date()
    let day = String(date.getDate()).padStart(2, '0')
    let month = String(date.getMonth() + 1).padStart(2, '0')
    let year = date.getFullYear()
    date = day + "." + month + "." + year
    newUser.date = date
    data.users.push(newUser)
    data.users.sort((x, y) => (x.score > y.score) ? -1 : ((y.score > x.score) ? 1 : 0))
    while (data.users.length > 7) {
        data.users.pop()
    }
    fetch("https://jsonblob.com/api/jsonBlob/1077540322355200000", {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    makeRank(data.users)

}

startButton.addEventListener("click", validateForm)
