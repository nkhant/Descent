// Features_RS Copy of Main

// Globals Variables
// Instantiating game object
var game = new Phaser.Game(500, 350, Phaser.AUTO);

var player, playerSpeed;
var transparency, semiTransparent;
var invisDoor, invisDoor2;
var gray;
var filter;
var counter;
var green_switch, blue_switch, teal_switch, brown_switch, red_trigger;
var timer;
//var basic;
//var fragmentSrc;

// Global Groups
var interactive;
var trigger;
var clue;
var door;
var door2;
var signs;
var hint_signs;

// On Load
window.onload = function()
{
	/* 
	 * Add states to the StateManager
	 */

	// Asset Loading and Menus (Maybe include in-game pause)
	game.state.add('Boot', Boot);
	game.state.add('MainMenu', MainMenu);
	game.state.add('GameOver', GameOver);

	// Game "Levels"
	game.state.add('FrontDoor', FrontDoor);
	game.state.add('LivingRoom', LivingRoom);
	game.state.add('BedRoom', BedRoom);
	game.state.add('Backyard', Backyard);

	game.state.start('Boot');
}

// Boot state to load assets
var Boot = function(game){};
Boot.prototype = 
{
	/*	
	 *	Loading temporary assets.
	 *	When have final assets, make a sprite atlas.
	 */
	preload:  function()
	{
		// Temporary Assets (If use later then add to atlas)
		// Sprites
		game.load.image('green_box', 'assets/img/greenbox.png');
		game.load.image('blue_box', 'assets/img/bluebox.png');
		game.load.image('teal_box', 'assets/img/tealbox.png');
		game.load.image('brown_box', 'assets/img/brownbox.png');
		game.load.image('red_box', 'assets/img/redbox.png');
		game.load.image('one', 'assets/img/one.png');
		game.load.image('two', 'assets/img/two.png');

		// SFX
		game.load.audio('scream', 'assets/audio/scream_horror1.mp3');
		game.load.audio('click', 'assets/audio/UI_SFX_Set/click1.mp3');
		game.load.audio('beep', 'assets/audio/beep.ogg');
		game.load.audio('locked', 'assets/audio/DoorLockSounds/LockedDoorHandleJiggle.ogg');
		game.load.audio('opened', 'assets/audio/DoorLockSounds/UnlockDoor.ogg');

		// Scripts
		game.load.script('gray', 'https://cdn.rawgit.com/photonstorm/phaser-ce/master/filters/Gray.js');
		//game.load.script('basic', 'https://github.com/photonstorm/phaser-examples/blob/master/examples/filters/basic.js');

		// Background and Sprites
		game.load.image('front_door_bg', 'assets/img/temp_art/front-door-temp-no-gate.png');
		game.load.image('living_room_bg', 'assets/img/temp_art/inside-temp.png');
		game.load.atlas("sprite_atlas", 'assets/img/atlas/tempsprite.png', 'assets/img/atlas/tempsprite.json');

		// Audio and SFX
		game.load.audio('viligante_justice', 'assets/audio/walking_with_poseidon.mp3');
		game.load.audio('shades', 'assets/audio/Shades/Shades.mp3');
		game.load.audio('walk_sfx', 'assets/audio/Fantasy Sound Library/Fantasy Sound Library/Mp3/Footsteps/Footstep_Dirt_00.mp3');
	},
	create: function()
	{
		game.scale.pageAlignHorizontally = true;
		game.scale.pageAlignVertically = true;
		game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
		game.scale.setMinMax(0, 0, 1280, 356);
		game.renderer.renderSession.roundPixels = true;	// No Blurring of Pixels
		game.state.start('MainMenu')
	}
}

// Main Menu state (GUI functionality)
var MainMenu = function(game){};
MainMenu.prototype = 
{
	preload: function()
	{
		console.log("Main Menu");
	},
	create: function()
	{

	},
	update: function()
	{
		if(game.input.keyboard.justPressed(Phaser.Keyboard.TILDE))
		{
			game.state.start('FrontDoor');
		}
	}
}

// GamePlay State
var FrontDoor = function(game){};
FrontDoor.prototype = 
{
	preload: function()
	{
		console.log("Front Door");
	},
	create: function()
	{
		/*fragmentSrc = [

	        "precision mediump float;",

	        "varying vec2 vTextureCoord;",
	        "uniform sampler2D uSampler;",

	        "void main(void) {",

	            "vec4 texColor = texture2D(uSampler, vTextureCoord);",

	            "if (vTextureCoord.x < 0.1) {",
	                "texColor = vec4(1.0, 0.0, 1.0, 1.0);",
	            "}",
	     
	            "gl_FragColor = texColor;",

	        "}"
    	];*/

		// Initalizing Variables
		transparency = 0.0;
		semiTransparent = 0.6;
		counter = 0;
		playerSpeed = 1;
		gray = game.add.filter('Gray');
		timer = game.time.create(false);
		//basic = new Phaser.Filter(game, null, fragmentSrc);
		game.physics.startSystem(Phaser.Physics.Arcade);

		// Creating audio
		// TEMP MUSIC -- CHANGE TO CREEPY EERIE
		//game.music = game.add.audio('viligante_justice');
		game.music = game.add.audio('shades');
		game.music.play('', 0, 1.0, true);

		// Creating sfx
		this.walk_sfx = game.add.audio('walk_sfx');
		this.scream = game.add.audio('scream');
		this.beep = game.add.audio('beep');
		this.click = game.add.audio('click');
		this.locked = game.add.audio('locked');
		this.opened = game.add.audio('opened');

		var bg_front_door = game.add.sprite(0, 0, 'front_door_bg');
		bg_front_door.width = game.width;
		bg_front_door.height = game.height;

		// Trigger Group
		trigger = game.add.group();
		trigger.enableBody = true;

		// Create Active Triggers
		red_trigger = trigger.create(450, game.world.height-120, 'red_box');
		this.red_trigger_active = 0;
		red_trigger.scale.setTo(0.4, 0.9);
		red_trigger.alpha = 0.4

		// Door Group -- Can we fix this if theres only one door?
		door = game.add.group();
		door2 = game.add.group();
		door.enableBody = true;
		door2.enableBody = true;

		// Door Object Invisible Sprite
		invisDoor2 = door2.create(235, game.height-210, 'green_box');
		this.invisDoor2_openable = 0;
		invisDoor2.scale.setTo(0.20, 4.5);
		invisDoor2.alpha = 0.0;

		invisDoor = door.create(67, game.height-210, 'blue_box');
		this.invisDoor_openable = 0;
		invisDoor.scale.setTo(0.2, 4.5);
		invisDoor.alpha = 0.0;	// THIS DOOR WONT SHOW BUT IS IN THE CORRECT SPOT

		// Clue Group
		clue = game.add.group();
		clue.alpha = semiTransparent;

		// Create clue sequence
		var clue_symbol = clue.create(300, game.world.height-180, 'green_box');
		clue_symbol.scale.setTo(0.3, 0.7);
		//clue_symbol.alpha = transparency;
		clue_symbol = clue.create(335, game.world.height-180, 'brown_box');
		clue_symbol.scale.setTo(0.3, 0.7);
		//clue_symbol.alpha = transparency;
		clue_symbol = clue.create(382, game.world.height-180, 'teal_box');
		clue_symbol.scale.setTo(0.3, 0.7);
		//clue_symbol.alpha = transparency;
		clue_symbol = clue.create(420, game.world.height-180, 'blue_box');
		clue_symbol.scale.setTo(0.3, 0.7);
		//clue_symbol.alpha = transparency;

		// Interactive Group
		interactive = game.add.group();
		interactive.enableBody = true;
		interactive.alpha = transparency;

		// Create Interactive Squares
		green_switch = interactive.create(100, game.world.height-120, 'green_box');
		green_switch.scale.setTo(0.4, 0.9);
		this.green_switch_on = 0;
		green_switch.alpha = semiTransparent;

		blue_switch = interactive.create(130, game.world.height-120, 'blue_box');
		blue_switch.scale.setTo(0.4, 0.9);
		this.blue_switch_on = 0;
		blue_switch.alpha = semiTransparent;

		teal_switch = interactive.create(160, game.world.height-120, 'teal_box');
		teal_switch.scale.setTo(0.4, 0.9);
		this.teal_switch_on = 0;
		teal_switch.alpha = semiTransparent;

		brown_switch = interactive.create(190, game.world.height-120, 'brown_box');
		brown_switch.scale.setTo(0.4, 0.9);
		this.brown_switch_on = 0;
		brown_switch.alpha = semiTransparent;

		// Create Door Signs
		/*signs = game.add.group();
		signs.alpha = 1.0;
		this.one = signs.create(63, game.height-180, 'one');
		this.one.scale.setTo(0.4, 0.9);
		this.two = signs.create(230, game.height-180, 'two');
		this.two.scale.setTo(0.4, 0.9);*/

		// Create Hint signs
		hint_signs = game.add.group();
		hint_signs.alpha = transparency;
		this.hintOne = hint_signs.create(316, game.height-220, 'one');
		this.hintOne.scale.setTo(0.4, 0.9);
		this.hintTwo = hint_signs.create(400, game.height-220, 'two');
		this.hintTwo.scale.setTo(0.4, 0.9);

		// Creating Player Instance
		player = game.add.sprite(70, game.height-108, 'sprite_atlas', 'player-idle');
		player.scale.setTo(0.9, 3);
		player.anchor.setTo(0.5, 0.5);

		// Player Physics
		game.physics.arcade.enable(player);
		//player.body.bounce.y = 0.1;
		// NO PLATFORM SO CANNOT USE GRAVY, YES GRAVY.
		//player.body.gravity.y = 1200;
		player.body.collideWorldBounds = true;

		// Player Animations
		player.animations.add('idle', ['player-idle'], 0, false);
		player.animations.add('walk', Phaser.Animation.generateFrameNames('player-walk-0', 1, 6), 10, true);
		player.animations.play('idle');
	},
	setGreenSwitch: function()
	{
		// MAKE ALL SWITCHES HAVE A STRING TO CHECK SWITCHES IN ONE FUNCTION
		this.click.play('', 0, 1, false);
		green_switch.alpha = 1.0;
		this.green_switch_on = 1;
		//console.log(this.green_switch_on);
	},
	unsetGreenSwitch: function()
	{
		this.click.play('', 0, 1, false);
		green_switch.alpha = semiTransparent;
		this.green_switch_on = 0;
		//console.log(this.green_switch_on);
	},
	setBlueSwitch: function()
	{
		this.click.play('', 0, 1, false);
		blue_switch.alpha = 1.0;
		this.blue_switch_on = 1;
	},
	unsetBlueSwitch: function()
	{
		this.click.play('', 0, 1, false);
		blue_switch.alpha = semiTransparent;
		this.blue_switch_on = 0;
	},
	setTealSwitch: function()
	{
		this.click.play('', 0, 1, false);
		teal_switch.alpha = 1.0;
		this.teal_switch_on = 1;
	},
	unsetTealSwitch: function()
	{
		this.click.play('', 0, 1, false);
		teal_switch.alpha = semiTransparent
		this.teal_switch_on = 0;
	},
	setBrownSwitch: function()
	{
		this.click.play('', 0, 1, false);
		brown_switch.alpha = 1.0;
		this.brown_switch_on = 1;
	},
	unsetBrownSwitch: function()
	{
		this.click.play('', 0, 1, false);
		brown_switch.alpha = semiTransparent;
		this.brown_switch_on = 0;
	},
	setClueOpaque: function(clue)
	{
		clue.alpha = semiTransparent;
	},
	setClueInvisible: function(clue)
	{
		clue.alpha = 0.0;
	},
	setInteractiveOpaque: function(interactive)
	{
		interactive.alpha = 1.0;
	},
	setInteractiveInvisible(interactive)
	{
		interactive.alpha = transparency;
	},
	contChangeDim: function()
	{
		this.red_trigger_active = 1;
		this.setClueInvisible(clue);
		this.setInteractiveOpaque(interactive);
		hint_signs.alpha = 0.2;
		counter += 1;
	},
	changeDimension: function(player, trigger)
	{
		if(counter == 0)
		{
			red_trigger.alpha = 1.0;
			this.scream.play('', 1, 0.15, false);
			this.scream.onStop.add(this.contChangeDim, this)	
		}
		else
		{
			red_trigger.alpha = 1.0;
			//timer.loop(3000, this.contChangeDim, this);
			//timer.start();
			this.contChangeDim();
		}
		//filter = game.world.filters = [gray];
		//game.world.filters = [basic];
	},
	unchangeDimension: function(player, trigger)
	{
		red_trigger.alpha = 0.4;
		this.setClueOpaque(clue);
		this.setInteractiveInvisible(interactive);
		this.red_trigger_active = 0;
		hint_signs.alpha = 0.0;
	},
	openDoor: function(player, door)
	{
		// Does not check which door can open any door.
		if(this.invisDoor_openable == 1)
		{
			console.log("You opened the 1st door");
			this.opened.play('', 0, 1, false);
			game.state.start("MainMenu");
		}
		else if(this.invisDoor_openable == 0)
		{
			console.log("This door is locked.");
			this.locked.play('', 0, 1, false);
		}
	},
	openDoor2: function(player, door2)
	{
		// Does not check which door can open any door.
		if(this.invisDoor2_openable == 1)
		{
			console.log("You opened the 2nd door");
			this.opened.play('', 0, 1, false);
			game.state.start("MainMenu");
		}
		else if(this.invisDoor2_openable == 0)
			this.locked.play('', 0, 1, false);
		{
			console.log("This door is locked.");
		}
	},
	walkSFX: function()
	{
		//this.walk_sfx.play('', 0, 1, false);
	},
	update: function()
	{
		if(game.input.keyboard.isDown(Phaser.Keyboard.RIGHT))
		{
			//player.scale.x *= -1;
			//player.position.x += 10;
			player.position.x += playerSpeed;
			player.scale.setTo(0.9, 3);
			player.animations.play('walk');
			//timer.loop(2000, this.walkSFX, this);
			// this.walk_sfx.play('', 0, 1, false);
		}
		else if(game.input.keyboard.isDown(Phaser.Keyboard.LEFT))
		{
			//player.scale.x *= -1;
			//player.position.x -= 10;
			player.position.x -= playerSpeed;
			player.scale.setTo(-0.9, 3);
			player.animations.play('walk');
			//this.walk_sfx.play('', 0, 0.50, false);
		// Maybe change these to ifs so not reliant on movement ifs?
		else if(game.input.keyboard.justPressed(Phaser.Keyboard.SPACEBAR) && this.red_trigger_active == 0)
		{
			game.physics.arcade.overlap(player, trigger, this.changeDimension, null, this);
			game.physics.arcade.overlap(player, door, this.openDoor, null, this);
			game.physics.arcade.overlap(player, door2, this.openDoor2, null, this);
		}
		else if(game.input.keyboard.justPressed(Phaser.Keyboard.SPACEBAR) && this.red_trigger_active == 1)
		{
			game.physics.arcade.overlap(player, trigger, this.unchangeDimension, null, this);
			game.physics.arcade.overlap(player, door, this.openDoor, null, this);
			game.physics.arcade.overlap(player, door2, this.openDoor2, null, this);

			if(this.green_switch_on == 0)
			{
				game.physics.arcade.overlap(player, green_switch, this.setGreenSwitch, null, this);
			}
			else if(this.green_switch_on == 1)
			{
				game.physics.arcade.overlap(player, green_switch, this.unsetGreenSwitch, null, this);
			}
			if(this.blue_switch_on == 0)
			{
				game.physics.arcade.overlap(player, blue_switch, this.setBlueSwitch, null, this);
			}
			else if(this.blue_switch_on == 1)
			{
				game.physics.arcade.overlap(player, blue_switch, this.unsetBlueSwitch, null, this);
			}
			if(this.teal_switch_on == 0)
			{
				game.physics.arcade.overlap(player, teal_switch, this.setTealSwitch, null, this);
			}
			else if(this.teal_switch_on == 1)
			{
				game.physics.arcade.overlap(player, teal_switch, this.unsetTealSwitch, null, this);
			}
			if(this.brown_switch_on == 0)
			{
				game.physics.arcade.overlap(player, brown_switch, this.setBrownSwitch, null, this);
			}
			else if(this.brown_switch_on == 1)
			{
				game.physics.arcade.overlap(player, brown_switch, this.unsetBrownSwitch, null, this);
			}
			// Change later to fine tune door codes
			if(this.green_switch_on == 1 && this.blue_switch_on == 0 && this.teal_switch_on == 0 && this.brown_switch_on == 1)
			{
				this.invisDoor_openable = 1;
			}
			else if(this.green_switch_on == 0 && this.blue_switch_on == 1 && this.teal_switch_on == 1 && this.brown_switch_on == 0)
			{
				this.invisDoor2_openable = 1;
			}
			else
			{
				this.invisDoor_openable = 0;
				this.invisDoor2_openable = 0;
			}
		}
		else
		{
			player.animations.play('idle')
		}
	}
}

// GamePlay State
var LivingRoom = function(game){};
LivingRoom.prototype = 
{
	preload: function()
	{

	},
	create: function()
	{

	},
	update: function()
	{
		
	}
}

// GamePlay State
var BedRoom = function(game){};
BedRoom.prototype = 
{
	preload: function()
	{

	},
	create: function()
	{

	},
	update: function()
	{
		
	}
}

// GamePlay State
var Backyard = function(game){};
Backyard.prototype = 
{
	preload: function()
	{

	},
	create: function()
	{

	},
	update: function()
	{
		
	}
}

// Game Over
var GameOver = function(game){};
GameOver.prototype =
{
	preload: function()
	{

	},
	create: function()
	{

	},
	update: function()
	{

	}
}