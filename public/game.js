var game = new Phaser.Game(960, 540, Phaser.AUTO, '', {preload: preload, create: create, update: update, render: render});
/// height and width, Phaser.Auto: will choose what type. 'domId'
// preload: loaded into memory
// create puts things on the screen. visible functionality
// update jumps into game loop. 60 frames/second.
// render isn't imperative, debugging purposes
var PLAYER_SPEED = 400;
/// defining a constant value
// var LAZER_SPEED = 100;

function preload() {
	game.load.image('background', 'assets/spacekitten.jpg');
	game.load.spritesheet('player', 'assets/Paranoid.png', 32, 32);
	game.load.image('lazer', 'assets/beam.png');
	game.load.image('badGuy', 'assets/enemy-guy.png');
	game.load.spritesheet('explosion', 'assets/explosion.png', 64,64);


	game.load.audio('bgMusic', ['assets/crazyinlove.mp3']);
	game.load.audio('pewPew', ['assets/meow.mp3']);

	game.load.audio('explosionSound', ['assets/explosion.mp3', 'assets/explosion.ogg']);

};


var background;
var player;
var cursors;
var badGuys;
var lazers;
var fireButton;
var lazerTimer = 0;
var pewPew;
var bgMusic;
var explosions;
var explosionSound;
var score = 0;
var scoreText;
var titleText;

function create() {
	game.physics.startSystem(Phaser.Physics.ARCADE);
	// game.physics.arcade.gravity.y = 100;


	background = game.add.tileSprite(0, 0, 960, 540, 'background');
	// x,y, height,width
	player = game.add.sprite(game.world.width/2, game.world.height/2, 'player');
	player.anchor.setTo(0.5);
	player.scale.setTo(2);
	player.animations.add('spin', [0, 1, 2, 3], 10, true);
	// true means loop until we stop it
	player.animations.play('spin');
	game.physics.arcade.enable(player);
	// player.body.collideWorldBounds = true;

	//// LOAD ORDER IS IMPORTANT. BADGUYS BEFORE LAZERS MEANS THAT LAZERS WILL GO OVER ENEMIES. Z INDEX.

	lazers = game.add.group();
	lazers.enableBody = true;
	lazers.physicsBodyType = Phaser.Physics.ARCADE;
	lazers.createMultiple(30, 'lazer');
	lazers.setAll('anchor.x', 0.5);
	lazers.setAll('anchor.y', 1);
	lazers.setAll('outOfBoundsKill', true);
	lazers.setAll('checkWorldBounds', true);

	badGuys = game.add.group();
	badGuys.enableBody = true;
	badGuys.physicsBodyType = Phaser.Physics.ARCADE;
	badGuys.createMultiple(15, 'badGuy');
	badGuys.setAll('body.immovable', true);
	badGuys.setAll('anchor.x', 0.5);
	badGuys.setAll('anchor.y', 0.5);

	explosions = game.add.group();
	explosions.createMultiple(20, 'explosion');
	explosions.setAll('anchor.x', 0.5);
	explosions.setAll('anchor.y', 0.5);
	explosions.callAll('animations.add', 'animations', 'explosion');

	scoreText = game.add.text(32, 32, 'Score! '+ score, {font: '20px Arial Black', fill: 'orange'});
	// where you want text to be added, what you want, then styling object
	titleText = game.add.text(game.world.width/2, 32, 'SPACE KITTENS!!', {font: '38px Arial Black', fill: 'limegreen' });
	titleText.anchor.setTo(0.5);


	cursors = game.input.keyboard.createCursorKeys();
	fireButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

	pewPew = game.add.audio('pewPew', 0.6, false);
	explosionSound = game.add.audio('explosionSound', 0.5, false);
	bgMusic = game.add.audio('bgMusic', 0.7, true);
	bgMusic.play();
	/// false/true refers to loop

	game.time.events.loop(Phaser.Timer.SECOND * 1.5, spawnEnemies, this);
};

function spawnEnemies(){
	var badGuy = badGuys.getFirstExists(false);
	badGuy.reset(game.rnd.integerInRange(10,940), game.rnd.integerInRange(10,380));
	//// tween is inBetween animations so the badGuy can move around
	var tween = game.add.tween(badGuy).to({x: game.rnd.integerInRange(10, 940), y: game.rnd.integerInRange(10, 480)}, 1000, Phaser.Easing.Linear.None).to({x: game.rnd.integerInRange(10, 940), y: game.rnd.integerInRange(10, 380)}, 1000).to({x: game.rnd.integerInRange(10, 940), y: game.rnd.integerInRange(10, 480)}, 1000).loop().start();

	// tween._lastChild.onComplete(endTween, this);
	//// Linear is straight shot.
	/// to get a random number: game.rnd.integerInRange(num, num)
}

function endTween(sprite){
	console.log(sprite);
};

function update() {

	game.world.wrap(player);

	game.physics.arcade.overlap(lazers, badGuys, lazerHitBadGuy, null, this);


	background.tilePosition.y += 1;
	//// game will implicitly pause if clicked away

	player.body.velocity.setTo(0,0);

	if (cursors.left.isDown){
		player.body.velocity.x = -PLAYER_SPEED;
	} else if(cursors.right.isDown) {
		player.body.velocity.x = PLAYER_SPEED;
	}

	if (cursors.up.isDown){
		player.body.velocity.y = -PLAYER_SPEED;
	} else if(cursors.down.isDown){
		player.body.velocity.y = PLAYER_SPEED;
	}

	if (fireButton.isDown){
		fireLazers();
	}
};

function badGuyHitPlayer(player, badGuy){
	player.kill();
	badGuy.kill();
	locaion.reload();
}


function lazerHitBadGuy(lazer, badGuy) {
	lazer.kill();
	badGuy.kill();
	var explosion = explosions.getFirstExists(false);
	explosion.reset(badGuy.x, badGuy.y);
	explosion.play('explosion', 30, false, true);
	//// 30 frames/second, false loop, true kill
	explosionSound.play();
	score += 10;
	scoreText.text = 'Score! ' + score;
}

function fireLazers(){
	if(game.time.now > lazerTimer){
		var lazer = lazers.getFirstExists(false);

		if(lazer) {
			lazer.reset(player.x, player.y + 10);
			lazer.body.velocity.y = -300;
			// lazer.body.velocity.x = 300;
			lazerTimer = game.time.now +200;
			pewPew.play();
		}

	}
};

function render() {

};