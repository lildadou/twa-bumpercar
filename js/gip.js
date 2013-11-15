(function(){

	var box2dUtils;		// classe utilitaire
	var world; 			// "monde" 2dbox
	var canvas;			// notre canvas
	var canvasWidth;	// largeur du canvas
	var canvasHeight;	// hauteur du canvas
	var context;		// contexte 2d

	// Initialisation
	$(document).ready(function() {
		init();
	});

	// Lancer à l'initialisation de la page
	this.init = function() {
		box2dUtils = new Box2dUtils();	// instancier la classe utilitaire

		// Récupérer la canvas, ses propriétés et le contexte 2d
		canvas = $('#gipCanvas').get(0);
		canvasWidth = parseInt(canvas.width);
		canvasHeight = parseInt(canvas.height);
		context = canvas.getContext('2d');

		world = box2dUtils.createWorld(context); // box2DWorld

		// Créer le "sol" de notre environnement physique
		ground= box2dUtils.createBox(world, canvasWidth / 2, canvasHeight - 10, canvasWidth / 2, 10, true, 'ground');

		// Créer 2 box statiques
		staticBox = box2dUtils.createBox(world, 600, 450, 50, 50, true, 'staticBox');
		staticBox2 = box2dUtils.createBox(world, 200, 250, 80, 30, true, 'staticBox2');

		// Créer 2 ball statiques
		staticBall = box2dUtils.createBall(world, 50, 400, 50, true, 'staticBall');
		staticBall2 = box2dUtils.createBall(world, 500, 150, 60, true, 'staticBall2');

		// Créer 30 éléments ball dynamiques de différentes tailles
		for (var i=0; i<30; i++) {
			var radius = 45;
			if (i < 10) {
				radius = 15;
			} else if (i < 20) {
				radius = 30;
			}
			// Placer aléatoirement les objets dans le canvas
			box2dUtils.createBall(world,
					Math.random() * canvasWidth,
					Math.random() * canvasHeight - 400,
					radius, false, 'ball'+i);
		}

		// Créer 30 éléments box dynamiques de différentes tailles
		for (var i=0; i<30; i++) {
			var length = 45;
			if (i < 10) {
				length = 15;
			} else if (i < 20) {
				length = 30;
			}
			// Placer aléatoirement les objets dans le canvas
			box2dUtils.createBox(world,
					Math.random() * canvasWidth,
					Math.random() * canvasHeight - 400,
					length, length, false, 'ball'+i);
		}

		// Exécuter le rendu de l'environnement 2d
		window.setInterval(update, 1000 / 60);
	}

	// Mettre à jour le rendu de l'environnement 2d
	this.update = function() {
        // effectuer les simulations physiques et mettre à jour le canvas
		world.Step(1 / 60,  10, 10);
		world.DrawDebugData();
		world.ClearForces();
	}

}());