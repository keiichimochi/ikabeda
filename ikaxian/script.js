const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const GAME_WIDTH = window.innerWidth;
const GAME_HEIGHT = window.innerHeight;

canvas.width = GAME_WIDTH;
canvas.height = GAME_HEIGHT;

// ゲーム状態
let gameOver = false;
let gameClear = false;

// プレイヤー設定
const player = {
    width: 60,
    height: 40,
    x: GAME_WIDTH / 2 - 30,
    y: GAME_HEIGHT - 80,
    speed: 7,
    dx: 0,
    dy: 0,
    color: 'cyan',
    bullets: [],
    image: new Image()
};
player.image.src = './jiki.png'; // プレイヤーの画像URLを指定

// プレイヤーの弾設定
const playerBullets = [];
const playerBulletSpeed = 10;

// イカ設定
const enemies = [];
const enemyRows = 5;
const enemyCols = 10;
const enemyWidth = 50;
const enemyHeight = 50;
const enemyPadding = 20;
const enemyOffsetTop = 50;
const enemyOffsetLeft = 50;
let enemyDirection = 1; // 1: 右, -1: 左
let enemySpeed = 0.5;
let enemyMoveDown = false;
const maxAttackingEnemies = 3; // 同時に攻撃するイカの最大数
const enemyAttackInterval = 3000; // イカの攻撃間隔（ミリ秒）

// イカ墨（敵の弾）
const enemyBullets = [];
const enemyBulletSpeed = 1; // ここを5から3に変更

// スコア
let score = 0;

// キー入力
const keys = {};

// イカの画像
const squidImage = new Image();
squidImage.src = './ika.png'; // イカの画像URLを指定

// イカとプレイヤーの画像が読み込まれた後にゲーム開始
let imagesLoaded = 0;
[player.image, squidImage].forEach(img => {
    img.onload = () => {
        imagesLoaded++;
        if (imagesLoaded === 2) {
            initEnemies();
            requestAnimationFrame(gameLoop);
        }
    };
});

// イカの初期化
function initEnemies() {
    for (let row = 0; row < enemyRows; row++) {
        for (let col = 0; col < enemyCols; col++) {
            const enemyX = enemyOffsetLeft + col * (enemyWidth + enemyPadding);
            const enemyY = enemyOffsetTop + row * (enemyHeight + enemyPadding);
            enemies.push({
                x: enemyX,
                y: enemyY,
                width: enemyWidth,
                height: enemyHeight,
                alive: true,
                image: squidImage,
                shootTimer: Math.random() * 2000 + 1000 // ランダムに撃つタイミング
            });
        }
    }
}

// イベントリスナー
document.addEventListener('keydown', keyDownHandler);
document.addEventListener('keyup', keyUpHandler);

// タッチコントロール
let touchStartX = null;

canvas.addEventListener('touchstart', function(e) {
    e.preventDefault();
    touchStartX = e.touches[0].clientX;
    shootPlayerBullet();
}, false);

canvas.addEventListener('touchmove', function(e) {
    e.preventDefault();
    if (touchStartX !== null) {
        const touchX = e.touches[0].clientX;
        const deltaX = touchX - touchStartX;
        if (deltaX > 30) {
            player.dx = player.speed;
            touchStartX = touchX;
        } else if (deltaX < -30) {
            player.dx = -player.speed;
            touchStartX = touchX;
        }
    }
}, false);

canvas.addEventListener('touchend', function(e) {
    e.preventDefault();
    player.dx = 0;
    touchStartX = null;
}, false);

// キーハンドラー
function keyDownHandler(e) {
    keys[e.code] = true;
    if (e.code === 'Space') {
        shootPlayerBullet();
    }
}

function keyUpHandler(e) {
    keys[e.code] = false;
}

// プレイヤーの弾を発射
function shootPlayerBullet() {
    playerBullets.push({
        x: player.x + player.width / 2 - 2.5,
        y: player.y,
        width: 5,
        height: 10
    });
}

// ゲームループ
function gameLoop(currentTime) {
    if (!gameOver && !gameClear) {
        update(currentTime);
        draw();
        requestAnimationFrame(gameLoop);
    }
}

function update(currentTime) {
    // プレイヤーの移動
    if (keys['ArrowRight'] || player.dx > 0) {
        player.x += player.speed;
        if (player.x + player.width > GAME_WIDTH) {
            player.x = GAME_WIDTH - player.width;
        }
    }
    if (keys['ArrowLeft'] || player.dx < 0) {
        player.x -= player.speed;
        if (player.x < 0) {
            player.x = 0;
        }
    }
    player.dx = 0; // 自動停止

    // プレイヤーの弾の更新
    playerBullets.forEach((bullet, index) => {
        bullet.y -= playerBulletSpeed;
        if (bullet.y < 0) {
            playerBullets.splice(index, 1);
        }
    });

    // イカの移動
    let shouldMoveDown = false;
    enemies.forEach(enemy => {
        if (enemy.alive) {
            enemy.x += enemySpeed * enemyDirection;
            if (enemy.x + enemy.width > GAME_WIDTH - enemyOffsetLeft || enemy.x < enemyOffsetLeft) {
                shouldMoveDown = true;
            }
        }
    });

    if (shouldMoveDown) {
        enemyDirection *= -1;
        enemies.forEach(enemy => {
            if (enemy.alive) {
                enemy.y += enemyHeight / 2;
                // 敵がプレイヤーに到達したらゲームオーバー
                if (enemy.y + enemy.height >= player.y) {
                    gameOver = true;
                    document.getElementById('gameOver').classList.remove('hidden');
                    document.getElementById('finalScore').innerText = score;
                }
            }
        });
    }

    // イカの弾発射
    let lastEnemyAttackTime = 0;
    function updateEnemyAttacks(currentTime) {
        // ここをコメントアウトして攻撃を無効にする
        /*
        if (currentTime - lastEnemyAttackTime > enemyAttackInterval) {
            let attackingEnemies = 0;
            enemies.forEach(enemy => {
                if (enemy.alive && Math.random() < 0.3 && attackingEnemies < maxAttackingEnemies) {
                    shootEnemyBullet(enemy);
                    attackingEnemies++;
                }
            });
            lastEnemyAttackTime = currentTime;
        }
        */
    }
    updateEnemyAttacks(currentTime);

    // イカ墨の更新
    enemyBullets.forEach((bullet, index) => {
        bullet.y += enemyBulletSpeed;
        if (bullet.y > GAME_HEIGHT) {
            enemyBullets.splice(index, 1);
        }
    });

    // 衝突判定
    // プレイヤーの弾とイカの衝突
    playerBullets.forEach((bullet, bIndex) => {
        enemies.forEach((enemy, eIndex) => {
            if (enemy.alive && isColliding(bullet, enemy)) {
                enemies[eIndex].alive = false;
                playerBullets.splice(bIndex, 1);
                score += 10;
                // すべての敵が倒されたらゲームクリア
                if (enemies.every(e => !e.alive)) {
                    gameClear = true;
                    document.getElementById('gameClear').classList.remove('hidden');
                    document.getElementById('clearScore').innerText = score;
                }
            }
        });
    });

    // イカ墨とプレイヤーの衝突
    enemyBullets.forEach((bullet, bIndex) => {
        if (isColliding(bullet, player)) {
            enemyBullets.splice(bIndex, 1);
            gameOver = true;
            document.getElementById('gameOver').classList.remove('hidden');
            document.getElementById('finalScore').innerText = score;
        }
    });

    // イカとプレイヤーの衝突
    enemies.forEach(enemy => {
        if (enemy.alive && isColliding(enemy, player)) {
            gameOver = true;
            document.getElementById('gameOver').classList.remove('hidden');
            document.getElementById('finalScore').innerText = score;
        }
    });
}

// 描画処理
function draw() {
    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // プレイヤー
    if (player.image.complete) {
        ctx.drawImage(player.image, player.x, player.y, player.width, player.height);
    } else {
        ctx.fillStyle = player.color;
        ctx.fillRect(player.x, player.y, player.width, player.height);
    }

    // プレイヤーの弾
    ctx.fillStyle = 'yellow';
    playerBullets.forEach(bullet => {
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    });

    // イカ（敵）
    enemies.forEach(enemy => {
        if (enemy.alive) {
            ctx.drawImage(enemy.image, enemy.x, enemy.y, enemy.width, enemy.height);
        }
    });

    // イカ墨（敵の弾）
    ctx.fillStyle = 'purple';
    enemyBullets.forEach(bullet => {
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    });

    // スコア表示
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText(`スコア: ${score}`, 10, 30);
}

// 衝突判定
function isColliding(a, b) {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
}

// 敵の弾を発射
function shootEnemyBullet(enemy) {
    enemyBullets.push({
        x: enemy.x + enemy.width / 2 - 2.5,
        y: enemy.y + enemy.height,
        width: 5,
        height: 10
    });
}

// 再スタート
function restartGame() {
    // 初期化
    enemies.length = 0;
    playerBullets.length = 0;
    enemyBullets.length = 0;
    score = 0;
    player.x = GAME_WIDTH / 2 - player.width / 2;
    enemyDirection = 1;
    enemySpeed = 1;
    gameOver = false;
    gameClear = false;
    document.getElementById('gameOver').classList.add('hidden');
    document.getElementById('gameClear').classList.add('hidden');
    initEnemies();
    requestAnimationFrame(gameLoop);
}
