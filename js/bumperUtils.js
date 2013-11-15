(function() {
	//http://www.box2d.org/manual.html
    var b2World = Box2D.Dynamics.b2World;
    var b2Vec2 = Box2D.Common.Math.b2Vec2;
    var b2AABB = Box2D.Collision.b2AABB;
    var b2BodyDef = Box2D.Dynamics.b2BodyDef;
    var b2Body = Box2D.Dynamics.b2Body;
    var b2FixtureDef = Box2D.Dynamics.b2FixtureDef;
    var b2Fixture = Box2D.Dynamics.b2Fixture;
    var b2MassData = Box2D.Collision.Shapes.b2MassData;
    var b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape;
    var b2CircleShape = Box2D.Collision.Shapes.b2CircleShape;
    var b2DebugDraw = Box2D.Dynamics.b2DebugDraw;
    var b2MouseJointDef =  Box2D.Dynamics.Joints.b2MouseJointDef;

    BumperGame = function() {
        this.world      = null;
        this.rendering  = null;
	    this.pid        = null;

	    /**@type [BumperCar] */
        this.bumperCars = [];
    };

    BumperGame.prototype = {
	    fixedFrameRate  : 1/60,
	    velocityIterationPerUpdate  : 10,
	    positionIterationPerUpdate  : 10,

        /**Construit l'aire de jeu et associe le Canvas au jeu.
         * @param {CanvasRenderingContext2D} canvasContext
         */
        initializeWorld : function(canvasContext) {
            this.rendering = canvasContext;
            this.world = new b2World(
                new b2Vec2(0,0),    // Gravité nulle
                true                // doSleep, autorise les objet physique à être au repos (meilleur perfs)
            );

            // On utilise la seule methode d'affichage disponible
            var debugDraw = new b2DebugDraw();
            debugDraw.SetSprite(this.rendering);      // contexte
            debugDraw.SetFillAlpha(0.3);       // transparence
            debugDraw.SetLineThickness(1.0);   // épaisseur du trait
            // Affecter la méthode de d'affichage du débug au monde 2dbox
            debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
            this.world.SetDebugDraw(debugDraw);
        },

	    /**Ajoute une auto-tamponneuse à l'univers de jeu
	     * @param {BumperCar} bumperCar
	     */
	    addBumperCar    : function(bumperCar) {
		    this.bumperCars.push(bumperCar);
		    bumperCar.body      = this.world.CreateBody(bumperCar.bodyDef);
		    bumperCar.fixture   = bumperCar.body.CreateFixture(bumperCar.fixtureDef);

		    // On ne peut pas appliquer de force de rotation sur un objet
		    // sans "inertie de rotation". Elle est censé être paramétré
		    // automatique à l'ajout d'une fixture si la densité est correctement parametre
		    // mais ce n'est pas le cas.
		    var massData = new b2MassData();
		    bumperCar.body.GetMassData(massData);
			massData.I  = 10;
		    bumperCar.body.SetMassData(massData);
	    },

	    start           : function() {
		    // Si on donne à setInterval la fonction onUpdate alors le this sera window!
		    // Donc on encaspule le scope
		    var _scope = this;
		    var capsuledUpdate = function() {_scope.onUpdate()};
		    this.pid = window.setInterval(capsuledUpdate, this.fixedFrameRate*1000)
	    },

	    pause           : function() {
		    window.clearInterval(this.pid);
		    this.pid = null;
	    },

	    onUpdate        : function() {
		    for (var itCar=0; itCar < this.bumperCars.length; itCar++) this.bumperCars[itCar].onUpdate();

		    this.world.Step(this.fixedFrameRate,
			    this.velocityIterationPerUpdate,
			    this.positionIterationPerUpdate);
		    this.world.DrawDebugData();
		    this.world.ClearForces();
	    }
    };


    BumperCar = function(){
	    this._flyweigthForceEngineVector = b2Vec2.Make();
	    this._flyweigthForceResistanceVector = b2Vec2.Make();
        this.fixture    = null;
	    this.body       = null;
	    var dims = this.dims;
	    this.enginePosition = b2Vec2.Make(3, dims.height/2);

	    this.fixtureDef = (function(){
	        var result      = new b2FixtureDef();
		    result.shape    = new b2PolygonShape();
	        result.shape.SetAsBox(dims.width, dims.height);
	        return result;
        })();
        this.bodyDef    = (function(){
	        var result          = new b2BodyDef();
	        result.allowSleep   = false;

	        // Position dans le monde
	        result.position.x   = 30;
	        result.position.y   = 30;

	        // Paramètre physique
	        result.type         = b2Body.b2_dynamicBody; // Objet mouvant
	        result.density      = 10.0;  // Densité utilisé dans le calcul de la masse
	        result.restitution  = 0.2;  // Force restituée lors d'une collision
	        //result.linearDamping= 3;   // Puissance du frein moteur
	        result.angularDamping= 3;  // Adherence des pneus (resistance au tete à queue)
	        return result;
        })();
    };

    BumperCar.prototype = {
	    velocityCap     : 300,
	    engineStrength  : 50,
	    maxSteering     : Math.PI/4, // 45°
	    currentSteering : 0,
	    dims            : {width:10, height:20},
	    enginePosition  : b2Vec2.Make(),

	    turnRight   : function() {
		    this.currentSteering    = this.maxSteering;
	    },

	    turnLeft    : function() {
		    this.currentSteering    = - this.maxSteering;
	    },

	    accelerate  : function() {
		    /**Cette méthode applique une force colineairement à la direction
		     * voulue par le joueur. Cette force s'additionne à celles déjà
		     * existantes ce qui provoque l'acceleration
		     */
		    this.body.ApplyForce(this.buildForceEngine(), this.body.GetWorldPoint(this.enginePosition));
	    },

	    getCurrentDirection         : function(optVec2) {
		    /**Cette méthode retourne le vecteur normalisé de la direction
		     * suivie par la voiture.
		     * @param {b2Vec2} optVec2 Vous pouvez fournir un vecteur à surcharger
		     * pour éviter une couteuse instanciation.
		     * @return Le vecteur éventuellement fourni ou un nouveau
		     */
		    var result = (optVec2)?optVec2:b2Vec2.Make();
		    result.Set( - Math.sin(this.currentSteering),
			            Math.cos(this.currentSteering));
		    return result;
	    },

	    _flyweigthForceEngineVector : null, // https://en.wikipedia.org/wiki/Flyweight_pattern
	    buildForceEngine   : function() {
		    /**Cette méthode construit le vecteur de la force produite par
		     * le moteur s'il était sollicité.
		     * @return {b2Vec2}
		     */
		    this.getCurrentDirection(this._flyweigthForceEngineVector);
		    this._flyweigthForceEngineVector.Multiply(this.engineStrength); // Ajout de la force moteur
		    return this._flyweigthForceEngineVector;
	    },

	    _flyweigthForceResistanceVector :   null,
	    getCurrentForceResistance: function() {
		    /**Cette méthode fournit le vecteur de la force de resistance
		     * qui s'applique actuellement à la voiture
		     * @return {b2Vec2}
		     */
		    var resistanceIntensity = this.body.GetLinearVelocity().Length();
		    this.getCurrentDirection(this._flyweigthForceResistanceVector);
		    this._flyweigthForceResistanceVector.Multiply( - resistanceIntensity);
		    return this._flyweigthForceResistanceVector;
	    },

	    boost       : function() {
		    this.body.ApplyImpulse(new b2Vec2(0,3), this.body.GetWorldPoint(this.enginePosition));
	    },
		debugCounter    : 500,
	    onUpdate    : function() {
		    /**Cette méthode est appelée à chaque cycle de calcul physique par BumperGame
		     * On réalise dans cette méthode toutes les opérations physique systématiquement
		     * subit par la voiture. Par exemple, la force de résistance
		     */
		    this.body.ApplyForce(this.getCurrentForceResistance(), this.body.GetWorldPoint(this.enginePosition));
		    if (this.debugCounter-- > 0) this.accelerate();
	    }
    };
})();