(function() {
	//http://www.box2d.org/manual.html
    var b2World         = Box2D.Dynamics.b2World;
    var b2Vec2          = Box2D.Common.Math.b2Vec2;
    var b2AABB          = Box2D.Collision.b2AABB;
    var b2BodyDef       = Box2D.Dynamics.b2BodyDef;
    var b2Body          = Box2D.Dynamics.b2Body;
    var b2FixtureDef    = Box2D.Dynamics.b2FixtureDef;
    var b2Fixture       = Box2D.Dynamics.b2Fixture;
    var b2MassData      = Box2D.Collision.Shapes.b2MassData;
    var b2PolygonShape  = Box2D.Collision.Shapes.b2PolygonShape;
    var b2CircleShape   = Box2D.Collision.Shapes.b2CircleShape;
    var b2DebugDraw     = Box2D.Dynamics.b2DebugDraw;
    var b2MouseJointDef = Box2D.Dynamics.Joints.b2MouseJointDef;
	// Fonction du produit scalaire
	Box2D.Common.Math.b2Dot = function(a, b) { return (a.x * b.x) + (a.y * b.y); };
	var b2Dot           = Box2D.Common.Math.b2Dot;



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

	    getViewSize     : function() {
		    return b2Vec2.Make(this.rendering.canvas.width, this.rendering.canvas.height);
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

		    // On positionne la voiture
		    var worldSize   = this.getViewSize();
		    console.log(b2Vec2.Make(Math.random()*worldSize.y));
		    bumperCar.body.SetPositionAndAngle(b2Vec2.Make(
			    Math.random()*worldSize.x,
				Math.random()*worldSize.y),
		    Math.random()*Math.PI*2);
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
	    this.enginePosition = b2Vec2.Make(0, dims.height/2);

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
	    engineStrength  : 50,
	    steeringStrength: 15,
	    dims            : {width:10, height:20},

	    turnRight   : function() {
			this.body.ApplyTorque(this.steeringStrength);
	    },

	    turnLeft    : function() {
		    this.body.ApplyTorque( - this.steeringStrength);
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

	    getForwardVelocity          : function() {
		    var currentForwardNormal = this.body.GetWorldVector( b2Vec2.Make(0,1) );
		    currentForwardNormal.Multiply(b2Dot( currentForwardNormal, this.body.GetLinearVelocity() ));
		    return currentForwardNormal;
	    },

	    getLateralVelocity          : function() {
		    var currentRightNormal = this.body.GetWorldVector( b2Vec2.Make(1,0) ); // Vecteur normal au vecteur de déplacement latéral
		    currentRightNormal.Multiply(b2Dot( currentRightNormal, this.body.GetLinearVelocity() ));
		    return currentRightNormal;
		},

	    accelerate  : function() {
		    /**Applique une force d'intensité egale à la constante engineStrength et
		     * vers l'avant du vehicule. La force s'ajoute aux force deja
		     * en presence. La vitesse limite est t'atteinte lorsque la force
		     * d'acceleration devient au moins egale au frein moteur
		     */
		    var currentForwardNormal = this.body.GetWorldVector( b2Vec2.Make(0,1) ); // Le vec de  ou va la voiture
		    currentForwardNormal.Multiply(this.engineStrength); // Ajout de la force motrice
		    this.body.ApplyForce(currentForwardNormal, this.body.GetWorldCenter() );
	    },

	    updateFriction                  : function() {
		    /**Applique la force de friction latéral engendrée par les pneux. En
		     * effet, d'avant en arriere les roues roullent sans resistance mais
		     * sur le côté les pneux resistent via les frottements.
		     */
			var frictionForce = this.getLateralVelocity();
		    frictionForce.Multiply( - this.body.GetMass());
		    this.body.ApplyImpulse(frictionForce, this.body.GetWorldCenter() );
		},

	    updateEngineBracking            : function() {
		    /**Applique la force du frein moteur. Cette force doit toujours être
		     * proportionnel à la vitesse avant-arriere du vehicule. (Les forces
		     * latérales sont gérées par la friction des pneus)
		     */
		    var resistanceIntensity = this.getForwardVelocity().Length();
		    var currentForwardNormal = this.body.GetWorldVector( b2Vec2.Make(0,1) );
		    currentForwardNormal.Multiply( - resistanceIntensity);
		    this.body.ApplyForce(currentForwardNormal, this.body.GetWorldCenter());
	    },

	    boost       : function() {
		    this.body.ApplyImpulse(new b2Vec2(0,3), this.body.GetWorldPoint(this.enginePosition));
	    },

	    debugRunning    : function(qt) {
		    /**Genere une acceleration prolongée
		     */
		    var pid = -1;
		    var _scope = this;
		    var _qt = qt;
		    pid = setInterval(function() {
			    _scope.accelerate();
			    _scope.turnLeft();
			    if (_qt-- <= 0) clearInterval(pid);
		    }, 1/60);
	    },

	    onUpdate    : function() {
		    /**Cette méthode est appelée à chaque cycle de calcul physique par BumperGame
		     * On réalise dans cette méthode toutes les opérations physique systématiquement
		     * subit par la voiture. Par exemple, la force de résistance
		     */
		    this.updateFriction();
		    this.updateEngineBracking();
	    }
    };

	/**Cette classe permet de controler localement un BumperCar
	 * @constructor
	 */

	PlayerCarControler = function() {
		this.status = {
			isAccelerate    : false,
			isBraking       : false,
			isRightSteer    : false,
			isLeftSteer     : false
		};

		// Les listeners sont initialisés mais pas attaché (cf. attachEventListeners)
		var _scope = this;
		this.onKeyDownListener = function(downEvent) {
			switch (downEvent.keyCode) {
				case _scope.keyMap.accelerateKey:   _scope.status.isAccelerate  = true; break;
				case _scope.keyMap.brakingKey:      _scope.status.isBraking     = true; break;
				case _scope.keyMap.rightSteer:      _scope.status.isRightSteer  = true; break;
				case _scope.keyMap.leftSteer:       _scope.status.isLeftSteer   = true; break;
			}
		};
		this.onKeyUpListener = function(downEvent) {
			switch (downEvent.keyCode) {
				case _scope.keyMap.accelerateKey:   _scope.status.isAccelerate  = false; break;
				case _scope.keyMap.brakingKey:      _scope.status.isBraking     = false; break;
				case _scope.keyMap.rightSteer:      _scope.status.isRightSteer  = false; break;
				case _scope.keyMap.leftSteer:       _scope.status.isLeftSteer   = false; break;
			}
		};
	};

	PlayerCarControler.prototype = {
		status          : null,// Controles activés
		bumperCar       : null,
		bumperOnUpdate  : null, // La fonction onUpdate de la BumperCar

		keyMap          : {
			accelerateKey   : 38,  // Accelerateur
			brakingKey      : 40,  // Frein
			rightSteer      : 39,
			leftSteer       : 37
		},
		onKeyDownListener   : null,
		onKeyUpListener     : null,

		/**Binde les evenements clavier au controleur.
		 * @param hDoc {HTMLDocument} La page où écouter les événements
		 */
		attachEventListeners    : function(hDoc) {
			hDoc.addEventListener('keydown', this.onKeyDownListener);
			hDoc.addEventListener('keyup', this.onKeyUpListener);
		},

		detachEventListeners    : function(hDoc) {
			hDoc.removeEventListener('keydown', this.onKeyDownListener);
			hDoc.removeEventListener('keyup', this.onKeyUpListener);
		},

		/**Associe une voiture au controleur
		 * @param {BumperCar} car
		 */
		setBumperCar        : function(car) {
			// On va 'hooker' ou 'surcharger' le onUpdate de la BumperCar
			// pour appliquer les operations demandes par le joueur

			this.bumperCar  = car;
			this.bumperOnUpdate = car.onUpdate;
			var _ctrl = this;
			car.onUpdate = function() { // on change le onUpdate de la BumperCar
				_ctrl.onUpdate();       // quand BumperCar.onUpdate est appellé, on lance onUpdate du controlleur
				_ctrl.bumperOnUpdate.apply(car); // et ensuite on appelle le onUpdate de la voiture
			};
		},

		onUpdate            : function() {
			if (this.status.isAccelerate) this.bumperCar.accelerate();
			if (this.status.isRightSteer) this.bumperCar.turnRight();
			if (this.status.isLeftSteer) this.bumperCar.turnLeft();
		}
	};
})();