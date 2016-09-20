var EnemyManager = function(){
	this.enemys = null;
	this.bullets = null;
	this.enemyShootChance = 0.01;

	this.hasStartFormation = false;
	this.formationDelay = 0;
	this.formationDelayCounter = 0;

	this.enemySpawnDelay = 0;
	this.enemySpawnDelayCounter = 0;
	this.enemiesToSpawn = null;

	this.levelIndex = 0;
};

EnemyManager.prototype.init = function() {
	this.enemys = new Array();
	this.bullets = new Array();

	this.enemiesToSpawn = new Array();
	this.formationDelay = 75;
	this.enemySpawnDelay = 50;
};

EnemyManager.prototype.reset = function() {
	while (this.enemys.length > 0) {
		var enemy = this.enemys.pop();
		enemy.destroy();
	}

	while (this.bullets.length > 0) {
		var bullet = this.bullets.pop();
		bullet.destroy();
	}
};

EnemyManager.prototype.startFormations = function() {
	if (this.hasStartFormation == true) {
		return;
	}
	this.hasStartFormation = true;
	this.createFormation();
};

EnemyManager.prototype.createEnemy = function(angleIndex, enemyType){
	var enemy = new Enemy(angleIndex, enemyType);
	this.enemys.push(enemy);
};

EnemyManager.prototype.update = function() {
	this.updateEnemy();
	this.updateBullets();
	this.updateFormation();
};

EnemyManager.prototype.updateEnemy = function(){
	for(var i=0;i<this.enemys.length;i++)
	{
		if(this.enemys[i].radius > RADIUS - 15)
		{
			this.deleteEnemy(i);
		}
		else
		{
			this.enemys[i].update();
	
			// shoot bullet
			if(this.enemys[i].type == 4 && this.enemys[i].shootFlag)
			{
				//enemy can not create bullet when they are roatating
				if(!this.enemys[i].isRotate && this.enemys[i].radius < RADIUS * 0.5)
					this.createBullet(this.enemys[i]);
				this.enemys[i].shootFlag = false;
			}
		}
	}
};

EnemyManager.prototype.hitEnemy = function(enemyIndex){
	this.enemys[enemyIndex].health--;
	if(this.enemys[enemyIndex].health == 0)
		this.deleteEnemy(enemyIndex);
}

EnemyManager.prototype.deleteEnemy = function(enemyIndex){
	var temp = this.enemys[enemyIndex];
	this.enemys[enemyIndex] = this.enemys[this.enemys.length - 1];
	temp.destroy();
	delete temp;
	this.enemys.pop();
};

EnemyManager.prototype.createBullet = function(enemy){
	var bullet = enemy.createBullet();
	this.bullets.push(bullet);
};

EnemyManager.prototype.updateBullets = function(){
	for(var i=0;i<this.bullets.length;i++)
	{
		if(this.bullets[i].radius > RADIUS - 15)
			this.deleteBullet(i);
		else
			this.bullets[i].update();
	}
};

EnemyManager.prototype.deleteBullet = function(bulletIndex){
	var temp = this.bullets[bulletIndex];
	this.bullets[bulletIndex] = this.bullets[this.bullets.length - 1];
	temp.destroy();
	delete temp;
	this.bullets.pop();
};

EnemyManager.prototype.updateFormation = function() {

	// update formation counter
	if (this.formationDelayCounter > 0) {
		--this.formationDelayCounter;

		// check if a new formation is required
		if (this.formationDelayCounter == 0) {
			this.createFormation();
		}
	}

	// check if there are any enemies left to spawn
	if (this.enemiesToSpawn.length > 0) {
		// update enemy spawn counter
		if (this.enemySpawnDelayCounter > 0) {
			--this.enemySpawnDelayCounter;

			// check if the counter has elapsed
			if (this.enemySpawnDelayCounter == 0) {
				this.enemySpawnDelayCounter = this.enemySpawnDelay;
				var enemy = this.enemiesToSpawn.pop();
				enemy.setVisible(true);
				this.enemys.push(enemy);
			}
		}

		// check if all enemies have spawned
		if (this.enemiesToSpawn.length == 0) {
			// spawn the next formation
			this.formationDelayCounter = this.formationDelay;
		}
	}
};

EnemyManager.prototype.createFormation = function() {
	// pick an angle index
	var angleIndex = Math.round(Math.random() * ANGLES.length);

	// get the formation pattern
	var formationPattern = this.getFormationPattern();
	console.log("Spawning enemy types:" + formationPattern);

	// create enemies and add them to a spawning list
	for (var i = 0; i < formationPattern.length; ++i) {
		var enemy = new Enemy(angleIndex, formationPattern[i]);
		enemy.setVisible(false);
		this.enemiesToSpawn.push(enemy);
	}

	// start spawning enemies
	this.enemySpawnDelayCounter = this.enemySpawnDelay;
};

EnemyManager.prototype.getFormationPattern = function() {
	var count = 0;
	var formationPattern = [];

	// get the required number of enemies for this formation
	var numEnemiesInFormation = levelSet[this.levelIndex].minEnemiesInFormation + Math.floor(Math.random() * (levelSet[this.levelIndex].maxEnemiesInFormation - levelSet[this.levelIndex].minEnemiesInFormation));

	// get the maximum types of enemies for this formation
	var enemyTypesInFormation = levelSet[this.levelIndex].enemyTypes;

	// randomly pick one or more of the enemy types
	var actualEnemyTypes = enemyTypesInFormation.slice(0, Math.ceil(Math.random() * enemyTypesInFormation.length));

	// keep filling enemy types till we're full
	while (formationPattern.length < numEnemiesInFormation) {
		// fill one of each type
		for (var i = 0; i < actualEnemyTypes.length; ++i) {
			formationPattern.push(actualEnemyTypes[i]);
		}
	}

	// trim excess
	formationPattern = formationPattern.slice(0, numEnemiesInFormation);

	return formationPattern;
};