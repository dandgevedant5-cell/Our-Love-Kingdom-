const config = {
  type: Phaser.AUTO,
  width: 960,
  height: 640,
  pixelArt: true,
  scene: [TitleScene, GameScene],
  physics: {
    default: 'arcade',
    arcade: { debug: false }
  }
};

new Phaser.Game(config);

function TitleScene() {
  Phaser.Scene.call(this, { key: "TitleScene" });
}
TitleScene.prototype = Object.create(Phaser.Scene.prototype);

TitleScene.prototype.preload = function () {
  this.load.image("titlebg", "assets/tiles.png");
};

TitleScene.prototype.create = function () {
  this.add.rectangle(480, 320, 960, 640, 0x2f2a24);

  this.add.text(480, 250, "Our Little World", {
    font: "48px monospace",
    color: "#ffe9c4"
  }).setOrigin(0.5);

  this.add.text(480, 320, "A small place made with love", {
    font: "22px monospace",
    color: "#ffd9a0"
  }).setOrigin(0.5);

  this.add.text(480, 420, "Press any key", {
    font: "18px monospace",
    color: "#ffffff"
  }).setOrigin(0.5);

  this.input.keyboard.once("keydown", () => {
    this.scene.start("GameScene");
  });
};

function GameScene() {
  Phaser.Scene.call(this, { key: "GameScene" });
}
GameScene.prototype = Object.create(Phaser.Scene.prototype);

GameScene.prototype.preload = function () {
  this.load.image("ground", "assets/tiles.png");
  this.load.image("heart", "assets/heart.png");
  this.load.image("tree", "assets/tree.png");
  this.load.image("house", "assets/house.png");
  this.load.image("cafe", "assets/cafe.png");
  this.load.image("bench", "assets/bench.png");
  this.load.image("arcade", "assets/arcade.png");
  this.load.image("gate", "assets/gate.png");
  this.load.image("player", "assets/player.png");

  this.load.audio("music", "assets/music.mp3");
  this.load.audio("chime", "assets/chime.mp3");
};

GameScene.prototype.create = function () {

  // 🌿 warm background
  this.add.rectangle(480, 320, 2000, 2000, 0xe6d2b0);

  // 🎵 music
  this.music = this.sound.add("music", { loop: true, volume: 0.4 });
  this.music.play();

  // 👤 player
  this.player = this.physics.add.sprite(200, 200, "player");
  this.player.setCollideWorldBounds(true);

  this.cursors = this.input.keyboard.createCursorKeys();
  this.keyE = this.input.keyboard.addKey("E");

  // 🌳 decorations
  this.add.image(200,150,"house");
  this.add.image(500,180,"cafe");
  this.add.image(300,420,"bench");
  this.add.image(650,350,"arcade");

  // swaying trees
  for(let i=0;i<6;i++){
    let t=this.add.image(100+i*120,520,"tree");
    this.tweens.add({
      targets:t,
      angle: {from:-2,to:2},
      yoyo:true,
      repeat:-1,
      duration:2000
    });
  }

  // ❤️ hearts
  this.heartMessages = [
    "You make ordinary days magical.",
    "Certified cute human detected.",
    "My favorite place = next to you.",
    "You + Me = Best story.",
    "Still my favorite notification.",
    "You are my safe place."
  ];

  this.heartsCollected = 0;

  this.hearts = this.physics.add.group();

  const heartSpots = [
    [350,200],[600,120],[720,420],[150,350],[480,500],[820,260]
  ];

  heartSpots.forEach((p,i)=>{
    let h=this.hearts.create(p[0],p[1],"heart");
    h.msg=this.heartMessages[i];
    this.tweens.add({
      targets:h,
      y:"+=10",
      yoyo:true,
      repeat:-1,
      duration:900
    });
  });

  // 🚧 locked hill gate
  this.gate = this.physics.add.staticImage(880,120,"gate");
  this.gateLocked = true;

  // collisions
  this.physics.add.overlap(this.player, this.hearts, this.collectHeart, null, this);

  // ✨ particles
  const particles = this.add.particles("heart");
  particles.createEmitter({
    x: {min:0,max:960},
    y: {min:0,max:640},
    speedY: {min:-10,max:-30},
    scale: 0.05,
    lifespan: 4000,
    quantity: 1,
    frequency: 300
  });

  // popup box
  this.popup = this.add.text(480,580,"",{
    font:"18px monospace",
    color:"#2b2b2b",
    backgroundColor:"#fff3d6",
    padding:10,
    wordWrap:{width:800}
  }).setOrigin(0.5).setDepth(10).setVisible(false);

  this.interactZones = [
    {x:200,y:150,msg:"Home — where every beautiful story begins."},
    {x:500,y:180,msg:"Our café talks could last forever."},
    {x:300,y:420,msg:"That bench remembers our laughs."},
    {x:650,y:350,msg:"Snack + fun + you = perfect day."}
  ];
};

GameScene.prototype.collectHeart = function(player, heart){
  heart.destroy();
  this.sound.play("chime");
  this.heartsCollected++;
  this.showPopup(heart.msg);

  if(this.heartsCollected === 6){
    this.gateLocked = false;
    this.showPopup("The hill path is open now.");
    this.gate.destroy();
  }
};

GameScene.prototype.showPopup = function(text){
  this.popup.setText(text);
  this.popup.setVisible(true);
  this.time.delayedCall(3000,()=>this.popup.setVisible(false));
};

GameScene.prototype.update = function () {

  const speed = 160;
  this.player.setVelocity(0);

  if(this.cursors.left.isDown) this.player.setVelocityX(-speed);
  if(this.cursors.right.isDown) this.player.setVelocityX(speed);
  if(this.cursors.up.isDown) this.player.setVelocityY(-speed);
  if(this.cursors.down.isDown) this.player.setVelocityY(speed);

  // interact memories
  if(Phaser.Input.Keyboard.JustDown(this.keyE)){
    this.interactZones.forEach(z=>{
      if(Phaser.Math.Distance.Between(
        this.player.x,this.player.y,z.x,z.y) < 60){
        this.showPopup(z.msg);
      }
    });
  }

  // 🌌 final hill ending
  if(!this.gateLocked && this.player.x>820 && this.player.y<160){
    this.showPopup("Under every star — I’d still choose you.");
  }
};
