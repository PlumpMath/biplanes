
var menuState = {
  preload: function() {
    myGame = this;
    this.count=0;
    /* use the whole window up */
    game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    /* if the full screen button is pressed, use this scale mode: */
    game.scale.fullScreenScaleMode = Phaser.ScaleManager.SHOW_ALL;

    game.load.image("ribbon", "img/ribbon700w.png");
    game.load.image("biplane", "img/biplane550w.png");
    game.load.spritesheet("prop", "img/prop17w234h.png", 17,234);
    game.load.image("pilot", "img/aviator125w.png");
    game.load.image("sky", "img/sky720h.jpg");
    game.load.spritesheet("buttons", "img/buttons103w47h.png", 103,47);
    game.load.spritesheet("smoke", "img/smoke200wh.png", 200,200);
  },
  create: function() {
    game.physics.startSystem(Phaser.Physics.ARCADE);
    game.scale.onSizeChange.add(this.onSizeChange, this);

    //game.stage.backgroundColor = '#94e1f3'; /* sky blue */
    game.add.tileSprite(0,0, 1280, 720, 'sky');
    //game.world.setBounds(-5,-5, game.width+10,game.height+10);

    this.clouds = new Clouds( game.world );
    this.clouds.menuClouds( 8, /*near*/1 );
    this.clouds.menuClouds( 8, /*far*/2 );

    this.ribbon = game.add.sprite(game.width/2, game.height/2, 'ribbon');
    this.ribbon.anchor.set(0.5, 0.5); this.ribbon.scale.set(0.9,0.9);

    this.planeGroup = game.add.group();
    this.planeGroup.x=-300; this.planeGroup.y=game.height/2;
    this.plane = game.add.sprite(0,0, 'biplane'); this.plane.scale.set(0.85,0.85);
    this.plane.anchor.set(0.5, 0.5); 
    this.planeGroup.add(this.plane);
    this.prop = game.add.sprite(271,-4, 'prop');
    this.prop.anchor.set(0.5, 0.5); 
    this.prop.animations.add('spin', [0,1,3], 60, true);
    this.prop.animations.play('spin');
    this.plane.addChild(this.prop);

    this.inTheClouds = new InTheClouds( game.world );

    this.startButton=game.add.button(game.width/2, game.height*0.85, 'buttons', function(){
      this.divePlane();
    }, this,4,4,4 );
    this.startButton.anchor.set(0.5,0.5);

    this.wobble = [ new Wobble(20, 2000, 100),
            /*new Wobble(6, 600, 1000),*/
              new Wobble(1, 400, 600) ];

    this.combineWobbles();

    this.fullScreenButton=game.add.button(3,-8, 'buttons', this.fullScreenButtonPress, this,6,6,6);
  },
  update: function() {
    this.count++;
    /* Fade in from Black at start of Game */
    if (this.count==1) game.camera.flash(0x000000, 600, true);
    
    if (this.count==1) {
      /* Bring the plane in Tween */
      game.add.tween(this.planeGroup).to( { x: game.width/2}, /*duration*/5500,
        Phaser.Easing.Cubic.Out , /*autostart*/true, /*delay*/500, /*repeat*/0, /*yoyo*/false)
        .onComplete.add(function(sprite, tween){
          /* */
      }, this);
      /* reveal the Ribbon and Play button */
      game.add.tween(this.ribbon).from( { alpha:0.0 }, /*duration*/1000,
        Phaser.Easing.Linear.None , /*autostart*/true, /*delay*/3000, /*repeat*/0, /*yoyo*/false);
      game.add.tween(this.startButton).from( { alpha:0.0 }, /*duration*/1000,
        Phaser.Easing.Linear.None , /*autostart*/true, /*delay*/3000, /*repeat*/0, /*yoyo*/false);
    }
    this.combineWobbles();
    if (game.rnd.between(0,200)==1) {
      this.inTheClouds.createClouds( game.rnd.between(2,4) );
    }
    this.clouds.update();

  },
  divePlane: function() {
    /* Take the plane downwards */
    game.add.tween(this.planeGroup).to( { y: game.height+200, x:this.planeGroup.x-100 }, 
      /*duration*/2500,Phaser.Easing.Cubic.In, /*autostart*/true, /*delay*/0, /*repeat*/0, /*yoyo*/false)
      .onComplete.add(function(sprite, tween){
        this.closeMenu(GAME); /* start the game */
    }, this);
    game.add.tween(this.planeGroup).to( { angle:15 }, /*duration*/2100,
      Phaser.Easing.Cubic.InOut , /*autostart*/true, /*delay*/0, /*repeat*/0, /*yoyo*/false);

    /* Remove Ribbon and Play button */
    game.add.tween(this.ribbon).to( { alpha:0.0 }, /*duration*/400,
      Phaser.Easing.Linear.None , /*autostart*/true, /*delay*/0, /*repeat*/0, /*yoyo*/false);
    game.add.tween(this.startButton).to( { alpha:0.0 }, /*duration*/400,
      Phaser.Easing.Linear.None , /*autostart*/true, /*delay*/0, /*repeat*/0, /*yoyo*/false);

},
  combineWobbles: function() {
    this.plane.x=0; this.plane.y=0;
    for (var n=0; n<this.wobble.length; n++) {
      this.plane.x += this.wobble[n].x;
      this.plane.y += this.wobble[n].y;
    }

  },
  closeMenu: function( toGameMode ) { /* Fade to black and end this game screen */
    game.camera.fade(0x000000, 300);  /* fade to black */
    game.time.events.add(350, function() {
      game.stage.backgroundColor = '#000000';
      if (toGameMode == GAME) {
        game.state.start('play');
        //}else if (toGameMode == TITLE_SCREEN) {
        //  game.state.start('play');
      }
    }, this);
  },
  shutdown: function() {
    /* delete all the things! */
    this.count=0;
    this.wobble=null;
  },
  onSizeChange: function() {
    if (this.touchControl) {
      this.touchControl.onSizeChange();
    }

  },
  fullScreenButtonPress: function() {
    if (game.scale.isFullScreen)
      game.scale.stopFullScreen();
    else
      game.scale.startFullScreen(false);
  },
};

/**************************************************************************************/
Wobble = function( range, duration, frequency ) {
  this.x=0; this.y=0;
  this.range = range;
  this.dur = duration;
  this.frequency = frequency;

  this.logic();
};
Wobble.prototype.logic = function() {
  var x = game.rnd.between(-this.range,this.range);
  var y = game.rnd.between(-this.range,this.range);
  var dur = game.rnd.between(this.dur*0.80, this.dur*1.20);
  var freq = this.frequency;

  game.add.tween(this).to({x:x, y:y}, /*duration*/dur,
    Phaser.Easing.Quadratic.InOut , /*autostart*/true, /*delay*/0, 
    /*repeat*/0, /*yoyo*/true);
//this.x=x;this.y=y;

  this.logicTimer=game.time.events.add(/*time*/game.rnd.between(dur*2, (dur*2)+freq), function() {
    this.logic();
  }, this);
};

Wobble.prototype.stopLogic = function() {
  game.time.events.remove( this.logicTimer );
};


/**************************************************************************************/
var InTheClouds = function ( group ) {
  Phaser.Group.call(this, game); /* create a Group, the parent Class */
  
  this.createMultiple(20, 'smoke'/*sprite sheet*/);
  group.add( this );
  this.forEach(function(cld) {
    cld.anchor.set(0.5, 0.5);
  });

};
InTheClouds.prototype = Object.create(Phaser.Group.prototype);
InTheClouds.prototype.constructor = InTheClouds;

/* create a big explosion graphic */
InTheClouds.prototype.createClouds = function ( count ) {
  var cld, cloudSize = game.height*2.4;
  var cloudScale = cloudSize/200;
  var alpha = game.rnd.realInRange(0.1, 0.3)
  for (var n=0, dist=0; n<count; n++, dist+=110) {
    if (cld=this.getFirstExists(false)) {
      cld.reset(game.width + cloudSize/2, game.height/2);
      cld.anchor.set(0.5,0.5);
      cld.frame = game.rnd.between(3,5);
      cld.alpha=alpha;
      cld.scale.set(cloudScale, cloudScale);
      dist += (game.rnd.between(1,3)==1 ? 90 : 0);
      game.add.tween(cld).to({x: -(cloudSize/2)}, /*duration*/300, Phaser.Easing.Linear.None,
        /*autostart*/true, /*delay*/dist, /*repeat*/0, /*yoyo*/false)
        .onComplete.add(function(cld, tween){
          cld.kill();
        });

    }
  }

};

/**************************************************************************************/
var Clouds = function ( group ) {
  Phaser.Group.call(this, game); /* create a Group, the parent Class */
  
  this.createMultiple(20, 'smoke'/*sprite sheet*/);
  group.add( this );
  game.physics.enable(this, Phaser.Physics.ARCADE);
  this.forEach(function(cld) {
    cld.anchor.set(0.5, 0.5);
    cld.body.allowGravity = false;
  });

};
Clouds.prototype = Object.create(Phaser.Group.prototype);
Clouds.prototype.constructor = Clouds;

Clouds.prototype.menuClouds = function ( count, level ) {
  for (var n=0; n<count; n++) { 
    //lev = game.rnd.between(1,2);
    /* lev 1: near+large+fast. lev 2: far+small+slow */
    cloudScale = (level==1 ? 2.0 : 1.0);
    cloudSpeed = (level==1 ? 30 : 10);
    this.createCloud(-100,0,game.width+200,game.height, cloudScale, cloudSpeed, 1,5);
  }
};
Clouds.prototype.gameClouds = function ( count, level ) {
  var cld;
  for (var n=0; n<count; n++) { 
    /* lev 1: near+large+fast. lev 2: far+small+slow */
    cloudScale = (level==1 ? 0.7 : 0.7);
    cloudSpeed = (level==1 ? 7 : 4);
    cld=this.createCloud(-100, 50, game.width+200, 150, cloudScale, cloudSpeed, 6,7);
    cld.angle=0;
  }
};
Clouds.prototype.createCloud = function ( x,y, x2,y2, cloudScale, cloudSpeed, fr1,fr2 ) {
  var cld;
  if (cld=this.getFirstExists(false)) {
    cld.reset(game.rnd.between(x,x2), game.rnd.between(y,y2));
    cld.anchor.set(0.5,0.5);
    cld.frame = game.rnd.between(fr1,fr2);
    cld.alpha=1; //0.9;
    cld.angle=game.rnd.between(0, 360);
    cld.scale.set(cloudScale, cloudScale);
    cld.body.velocity = new Phaser.Point(-cloudSpeed, 0);
    return cld;
  }
};
Clouds.prototype.update = function () {
  this.forEach(function(cld) {
    if (cld.x < -150) {cld.x = game.width+150; /*cld.y=game.rnd.between(0,game.height);*/}
  if (cld.x > game.width+150) {cld.x = -150; /*cld.y=game.rnd.between(0,game.height);*/}
  });

};
