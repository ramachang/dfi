var app = angular.module("dfimdbApp", ['ui.bootstrap', 'bootstrapLightbox', 'pascalprecht.translate', 'updateMeta']);


app.controller("dfimdbCtrl", function($scope, $http, Lightbox, $location, preloader, $translate) {
	
	var all_movies;
	
	//set current movie to index 0 or get it from query (movie)
	var movie_index = 0;
	movie_index = $location.search().movie ? $location.search().movie : 0; 
	
	//get current url for metatag og:url
	$scope.url = $location.absUrl();
	
	//set default language
	$scope.language = 'da';
	
	//set first poster to be shown 
	$scope.active_posters = 0;
  
	
	
	//load all movies from json
	$http.get('data/movies.min.json').
    success(function(data, status, headers, config) {
      all_movies = data;
            
      loadMovieData();
    }).
    error(function(data, status, headers, config) {
      
    });
  
  //function for scrolling to anchor  
  $scope.scrollTo = function(id) {
  	$location.hash(id);
    $anchorScroll();
  }
  
  //change language function
  $scope.changeLanguage = function (key) {
    $translate.use(key);
    $scope.language = key;
    //update movie texts based on selected language	
    setMovieTexts();
  };
  $scope.openLightboxModal = function (index) {
    Lightbox.openModal($scope.movie.images, index);
  };
  
  function loadMovieData(){
  	$scope.movie = all_movies[movie_index];
  	//update movie texts based on (default) language	
  	setMovieTexts();
  	
  	//split apperance elements into multidimentional array for displaying columns in view
  	if($scope.movie.credits.hasOwnProperty('appearance')){
  		var actors = $scope.movie.credits.appearance.map(function(element){
	  		return element.first_name.String+' '+element.last_name;
	  	});
	  	$scope.actors_spliced = arrayToGroups(actors, 3);
  	}
  	else{
  		$scope.actors_spliced = new Array();
  	}
  	
  	//get photo data (posters and stills)
		$http.get($scope.movie.photos).
    success(function(image_data, status, headers, config) {
	    //add posters and stills to view (urls in array)
	    $scope.movie.posters = image_data.posters.length > 0 ? image_data.posters.map(function(element){return element.url}) : ['images/noposter.gif'];
      $scope.movie.images = image_data.images.length > 0 ? image_data.images.map(function(element){return element.url}) : [];
      
      //preload posters
      preloader.preloadImages( $scope.movie.posters )
			.then(function() {
				//set flag that posters is preloaded (display in view)
				$scope.posters_preloaded = true;
				//when all posters is loaded - load stills
				load_stills();
			},
			function() {
				// Loading failed on at least one image.
			});
    }).
    error(function(data, status, headers, config) {
    	//error loading image data  
    });
  } 
  
  //preload still images
  function load_stills(){
		preloader.preloadImages( $scope.movie.images )
		.then(function() {
			//set flag that stills is preloaded (display in view)
			$scope.images_preloaded = true;
			//delay 300 milis for view to update
			//then init lemmon slider 
			setTimeout(function(){$('#stills-slider').lemmonSlider();}, 300);	
		},
		function() {
			// Loading failed on at least one image.
		});
  }
  
  // function for getting movie text based on language
  function setMovieTexts(){
  	if($scope.language == 'da'){
  		$scope.movie.text = {
  			'title': $scope.movie.title_dk,
  			'commentary': $scope.movie.commentary_dk, 
  			'genres' : $scope.movie.genres.map(function(element){return element.name_dk;}),
  			'summary': $scope.movie.summary_dk,
  			'premiere_dates': $scope.movie.premiere_dates.map(function(element){return {'date': element.date, 'type': element.type_dk};})
  		};
  	}
  	else if($scope.language == 'en'){
  		$scope.movie.text = {
  			'title': $scope.movie.title,
  			'commentary': $scope.movie.commentary, 
  			'genres' : $scope.movie.genres.map(function(element){return element.name;}),
  			'summary': $scope.movie.summary,
  			'premiere_dates': $scope.movie.premiere_dates.map(function(element){return {'date': element.date, 'type': element.type};})
  		};
  	}
  }
  
  //helper function to split array into N subarrays contained in multidimentional array
  function arrayToGroups(source, groups) {  
		var grouped = [];
		groupSize = Math.ceil(source.length/groups);
		var queue = source;
		
		for (var r=0;r<groups;r++) {
		 grouped.push(queue.splice(0, groupSize));            
		}       
		return grouped;
	}
	
    
}).config(function($locationProvider, LightboxProvider, $translateProvider) {
	//enable location
  $locationProvider.html5Mode({
  	enabled: true,
	  requireBase: false
	});
	
	//set template for lightbox
	LightboxProvider.templateUrl = 'templates/lightbox.html';
	
	//set translations
	$translateProvider.translations('da', {
    BUTTON_LANG_EN: 'Engelsk',
    BUTTON_LANG_DA: 'Dansk',
    DIRECTION: 'Instruktion',
    APPERANCE: 'Medvirkende',
    PRODUCTION: 'Produktion',
    SEE_ALL: 'Se alle',
    YEAR: 'Årstal',
    RUNTIME: 'Spilletid',
    SEARCH: 'Søg',
    GETTING_POSTER: 'Henter plakat',
    GETTING_STILLS: 'Henter billeder'
  });
  $translateProvider.translations('en', {
    BUTTON_LANG_EN: 'english',
    BUTTON_LANG_DA: 'danish',
    DIRECTION: 'Direction',
    APPERANCE: 'Apperance',
    PRODUCTION: 'Production',
    SEE_ALL: 'See all',
    YEAR: 'Year',
    RUNTIME: 'Runtime',
    SEARCH: 'Search',
    GETTING_POSTER: 'Getting poster',
    GETTING_STILLS: 'Getting images'
  });
  $translateProvider.preferredLanguage('da');
  $translateProvider.useSanitizeValueStrategy('escape');
});

