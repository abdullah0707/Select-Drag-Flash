var canvas, stage, exportRoot, anim_container, dom_overlay_container, fnStartAnimation;

var soundsArr;
var video, video_div;
var clickSd, goodSd, errorSd, infoSd, timeOutSd,
	rightFbSd, wrongFbSd, tryFbSd, tryTimeFbSd, intro, intro2;

var numOfPlaces = 8,
	numOfAns = 8,
	counter = 0;
	counAns = 1;

var score = 0;

var attempts = 0,
	maxAttempts = 3;

var timerInterval = null,
	timerFrame = 0,
	timeCounter = 60;

var overOut = [];
var retryV = false;
var l = console.log;
var closeInfo = false;

var bounds;

function init() {
	canvas = document.getElementById("canvas");
	anim_container = document.getElementById("animation_container");
	dom_overlay_container = document.getElementById("dom_overlay_container");
	var comp=AdobeAn.getComposition("4449402ED19F8D46843797652F7EAE88");
	var lib=comp.getLibrary();
	var loader = new createjs.LoadQueue(false);
	loader.addEventListener("fileload", function(evt){handleFileLoad(evt,comp)});
	loader.addEventListener("complete", function(evt){handleComplete(evt,comp)});
	var lib=comp.getLibrary();
	loader.loadManifest(lib.properties.manifest);
}
function handleFileLoad(evt, comp) {
	var images=comp.getImages();	
	if (evt && (evt.item.type == "image")) { images[evt.item.id] = evt.result; }	
}
function handleComplete(evt, comp) {
	//This function is always called, irrespective of the content. You can use the variable "stage" after it is created in token create_stage.
	var lib = comp.getLibrary();
	var ss = comp.getSpriteSheet();
	var queue = evt.currentTarget;
	var ssMetadata = lib.ssMetadata;
	for (i = 0; i < ssMetadata.length; i++) {
		ss[ssMetadata[i].name] = new createjs.SpriteSheet({
			"images": [queue.getResult(ssMetadata[i].name)],
			"frames": ssMetadata[i].frames
		})
	}
 exportRoot = new lib._604L1AC10();

	stage = new lib.Stage(canvas);
	//Registers the "tick" event listener.
	fnStartAnimation = function () {
		stage.addChild(exportRoot);
		stage.enableMouseOver(10);
		createjs.Touch.enable(stage);
		/* document.ontouchmove = function (e) {
		     e.preventDefault();
		 }*/
		stage.mouseMoveOutside = true;
		stage.update();
		createjs.Ticker.setFPS(lib.properties.fps);
		createjs.Ticker.addEventListener("tick", stage);
		prepareTheStage();
	}
	//Code to support hidpi screens and responsive scaling.
	function makeResponsive(isResp, respDim, isScale, scaleType) {
		var lastW, lastH, lastS = 1;
		window.addEventListener('resize', resizeCanvas);
		resizeCanvas();

		function resizeCanvas() {
			var w = lib.properties.width,
				h = lib.properties.height;
			var iw = window.innerWidth,
				ih = window.innerHeight;
			var pRatio = window.devicePixelRatio || 1,
				xRatio = iw / w,
				yRatio = ih / h,
				sRatio = 1;
			if (isResp) {
				if ((respDim == 'width' && lastW == iw) || (respDim == 'height' && lastH == ih)) {
					sRatio = lastS;
				} else if (!isScale) {
					if (iw < w || ih < h)
						sRatio = Math.min(xRatio, yRatio);
				} else if (scaleType == 1) {
					sRatio = Math.min(xRatio, yRatio);
				} else if (scaleType == 2) {
					sRatio = Math.max(xRatio, yRatio);
				}
			}
			canvas.width = w * pRatio * sRatio;
			canvas.height = h * pRatio * sRatio;
			canvas.style.width = dom_overlay_container.style.width = anim_container.style.width = w * sRatio + 'px';
			canvas.style.height = anim_container.style.height = dom_overlay_container.style.height = h * sRatio + 'px';
			stage.scaleX = pRatio * sRatio;
			stage.scaleY = pRatio * sRatio;
			lastW = iw;
			lastH = ih;
			lastS = sRatio;
			stage.tickOnUpdate = false;
			stage.update();
			stage.tickOnUpdate = true;
			canvas.style.display = "block";
			anim_container.style.display = "block";
		}
	}
    makeResponsive(true, 'both', true, 1);
    AdobeAn.compositionLoaded(lib.properties.id);
    fnStartAnimation();
    exportRoot["playBtn"].cursor = "pointer";
    exportRoot["playBtn"].addEventListener("click", playVideo);
}

// function playFn() {
//     stopAllSounds();
//     clickSd.play();
//     exportRoot.play();
// }

function playVideo(){
    

    exportRoot["playBtn"].alpha=0;
    exportRoot["playBtn"].removeEventListener("click", playVideo);
    video_div = document.getElementById("videoPlay").style.display = "inline-block";
    
    video = document.getElementById('videoPlay').play();
    setTimeout(function(){
        exportRoot.gotoAndStop(2);
    }, 300);
    document.getElementById("videoPlay").onended = function() {videoEnd()};

    // exportRoot.play();
}

function videoEnd() {
    exportRoot.play();
    document.getElementById("videoPlay").style.display = "none";
    // intro.play();
    console.log("Play");
};

function prepareTheStage() {
    overOut = [exportRoot["showAnsBtn"], exportRoot["confirmBtn"],exportRoot["nextQus"],
               exportRoot["retryBtn"], exportRoot["startBtn"],exportRoot["backQus"],];
	for (var i = 0; i < overOut.length; i++) {
		l(i)
		overOut[i].cursor = "pointer";
		overOut[i].on("mouseover", over);
		overOut[i].on("mouseout", out);
	}


    exportRoot["startBtn"].on("mouseover", over);
    // exportRoot["startBtn2"].on("mouseover", over);

    clickSd = new Howl({
        src: ['sounds/click.mp3']
    });
    goodSd = new Howl({
        src: ['sounds/good.mp3']
    });
    errorSd = new Howl({
        src: ['sounds/error.mp3']
    });
    timeOutSd = new Howl({
        src: ['sounds/timeOutSd.mp3']
    });
    rightFbSd = new Howl({
        src: ['sounds/rightFbSd.mp3']
    });
    wrongFbSd = new Howl({
        src: ['sounds/wrongFbSd.mp3']
    });
    tryFbSd = new Howl({
        src: ['sounds/tryFbSd.mp3']
    });
    timeFbSd = new Howl({
        src: ['sounds/timeFbSd.mp3']
    });
    intro = new Howl({
        src: ['sounds/intro.mp3']
    });
	    intro2 = new Howl({
        src: ['sounds/intro2.mp3']
    });
    quizSd = new Howl({
        src: ['sounds/quizSd.mp3']
    });
    infoSd = new Howl({
        src: ['sounds/infoSd.mp3']
    });
    nashat = new Howl({
        src: ['sounds/nashat.mp3']
    });

    soundsArr = [clickSd, goodSd, errorSd, timeOutSd, infoSd, nashat,
                 rightFbSd, wrongFbSd, tryFbSd, timeFbSd, intro, intro2, quizSd];
    stopAllSounds();

/*	for (var i = 1; i <= numOfAns; i++) {
		exportRoot["a" + i].id = i;
		exportRoot["a" + i].xPos = exportRoot["a" + i].x;
		exportRoot["a" + i].yPos = exportRoot["a" + i].y;
		exportRoot["a" + i].placeNum = null;
        
      //  if(i < 5){
            
		exportRoot["p" + i].ansNum = null;
     //   }
	}*/
    
    exportRoot["nextQus"].cursor = "auto";
	exportRoot["backQus"].cursor = "auto";
    exportRoot["nextQus"].removeEventListener("click", nextQus);
	exportRoot["backQus"].removeEventListener("click", backQus);

    
        
    for (var i = 1; i <= numOfAns; i++) {
        
		exportRoot["a" + i].id = i;
		exportRoot["a" + i].xPos = exportRoot["a" + i].x;
		exportRoot["a" + i].yPos = exportRoot["a" + i].y;
		exportRoot["a" + i].placeNum = null;
        
        /* if(i>numOfPlaces)
            {
                 exportRoot["a" + i].num = 0;
            }*/
        
        
        
          if( i <= 4){
            
        exportRoot["a" + i].ansGroup=1;
        }
        

        else{
             exportRoot["a"+i].ansGroup=2;
        }
        
    }
	hideAns();
	exportRoot["a" + counAns].alpha = 1;
     for (var i = 1; i <= numOfPlaces; i++) {
         
            exportRoot["p" + i].id = i;
            exportRoot["p" + i].num = 1;
            
         
            exportRoot["p"+i].amIChecked = false;
           
          	exportRoot["p" + i].ansNum = null;
         
      if(i <= 4){
            exportRoot["p" +i].placeGroup=1;
        }

         else{
              exportRoot["p" +i].placeGroup=2;
        }
         
         }
         
         
    //   exportRoot["startBtn2"].addEventListener("click", function () {
	// 	stopAllSounds();
	// 	clickSd.play();
	// 	exportRoot.play();
	// });   

	exportRoot["startBtn"].addEventListener("click", function () {
		stopAllSounds();
		clickSd.play();
		exportRoot.play();
	});

	//exportRoot["infoBtn"].addEventListener("click", showInfoFn);
	//exportRoot["infoWin"]["colseInfoBtn"].addEventListener("click", closeInfoFn);
	//exportRoot["colseInfoBtn"].addEventListener("click", closeInfoFn);
	//exportRoot["infoWin"].id = "at the start";
	

	exportRoot["retryBtn"].addEventListener("click", retryFN);
	exportRoot["showAnsBtn"].addEventListener("click", function () {
		//hideFB();
		//stopAllSounds();
		//clickSd.play();
		exportRoot["showAnsBtn"].alpha = 0;
		exportRoot["answers"].alpha = 1;
		exportRoot["answers"].gotoAndPlay(0);
	});

	hideFB();
}

function hideFB() {
    exportRoot["wrongFB"].alpha = 0;
    exportRoot["wrongFB"].playV = false;
    exportRoot["rightFB"].alpha = 0;
    exportRoot["rightFB"].playV = false;
    exportRoot["tryFB"].alpha = 0;
    exportRoot["tryFB"].playV = false;
    exportRoot["timeOutFB"].alpha = 0;
    exportRoot["timeOutFB"].playV = false;

    // exportRoot["fullScore"].alpha = 0;
    // exportRoot["fullScore"].playV = false;
    // exportRoot["score_3"].alpha = 0;
    // exportRoot["score_3"].playV = false;
    // exportRoot["score_2"].alpha = 0;
    // exportRoot["score_2"].playV = false;
    // exportRoot["score_1"].alpha = 0;
    // exportRoot["score_1"].playV = false;
    // exportRoot["score_0"].alpha = 0;
    // exportRoot["score_0"].playV = false;
    exportRoot["answers"].alpha = 0;

    exportRoot["retryBtn"].alpha = 0;
    exportRoot["retryBtn"].gotoAndStop(0);
    exportRoot["showAnsBtn"].alpha = 0;
    exportRoot["showAnsBtn"].gotoAndStop(0);
    exportRoot["confirmBtn"].alpha = 0;
    exportRoot["confirmBtn"].gotoAndStop(0);
}

function stopAllSounds() {
	for (var s = 0; s < soundsArr.length; s++) {
		soundsArr[s].stop();
	}
}

function activateButtons() {
	//exportRoot["hideSymb"].alpha = 0;
	for (var i = 1; i <= numOfAns; i++) {
		if (retryV) {
			exportRoot["a" + i].gotoAndStop(0);
			exportRoot["a" + i].placeNum = null;
			exportRoot["a" + i].x = exportRoot["a" + i].xPos;
			exportRoot["a" + i].y = exportRoot["a" + i].yPos;
			
   //   if(i < 5){
            
		exportRoot["p" + i].ansNum = null;
   //     }
		}
		exportRoot["a" + i].alpha = 1;
		exportRoot["a" + i].cursor = "pointer";
		exportRoot["a" + i].addEventListener("pressmove", moveFn);
		exportRoot["a" + i].addEventListener("pressup", pressupFn);
		exportRoot["a" + i].addEventListener("mouseover", over);
		exportRoot["a" + i].addEventListener("mouseout", out);

		//exportRoot["p" + i].amIChecked = false;

	}
	exportRoot["nextQus"].cursor = "pointer";
	exportRoot["backQus"].cursor = "pointer";
	exportRoot["nextQus"].addEventListener("click", nextQus);
	exportRoot["backQus"].addEventListener("click", backQus);
	hideAns();
	exportRoot["a" + counAns].alpha = 1;
	exportRoot["confirmBtn"].cursor = "pointer";
	exportRoot["confirmBtn"].addEventListener("click", confirmFN);
	
}

function deactivateButtons() {
	for (var i = 1; i <= numOfAns; i++) {
		//exportRoot["a" + i].alpha = 0;
		exportRoot["a" + i].cursor = "auto";
		exportRoot["a" + i].removeEventListener("pressmove", moveFn);
		exportRoot["a" + i].removeEventListener("pressup", pressupFn);
		exportRoot["a" + i].removeEventListener("mouseover", over);
		exportRoot["a" + i].removeEventListener("mouseout", out);
	}

	exportRoot["confirmBtn"].cursor = "auto";
	exportRoot["confirmBtn"].removeEventListener("click", confirmFN);

}

function hideAns() {
	for (var i = 1; i <= numOfAns; i++) {
		exportRoot["a" + i].alpha = 0;
	}
}
function hideAns2() {
	for (var i = 1; i <= numOfAns; i++) {
		if (exportRoot["a" + counAns].placeNum === null) {
			exportRoot["a" + i].alpha = 0;
		}
	}
}

function nextQus() {
	console.log(" nextQus");
	// if (counAns < 8 )
	// {

		if (exportRoot["a" + counAns].placeNum === null && counAns < 8) {
			
			exportRoot["a" + counAns].alpha = 0;
			counAns++;
			exportRoot["a" + counAns].alpha = 1;
			console.log(" counAns IF = " + counAns);

		} else if (exportRoot["a" + counAns].placeNum !== null) {
			
			for (let i = 1; i <= numOfAns; i++)
			{
					// counAns++;
					if (exportRoot["a" + i].placeNum === null)
					{
						exportRoot["a" + i].alpha = 1;
						break;
					}
			}
			console.log(" counAns ELSE IF = " + counAns);
		}else {
		
			// if (exportRoot["a" + counAns].placeNum === null) {
			// exportRoot["a" + counAns].alpha = 0;
				for (let i = 1; i <= numOfAns; i++) {
					// counAns++;
					if (exportRoot["a" + i].placeNum === null)
					{
						exportRoot["a" + i].alpha = 0;
						break;
					}
			}
		// }
		counAns = 1;
		exportRoot["a" + counAns].alpha = 1
		console.log(" counAns ELSE = " + counAns);
	}

	// } 
	
}
function backQus()
{
	console.log(" backQus");
	
	// if ( counAns > 1 ) {
		if (exportRoot["a" + counAns].placeNum === null && counAns >= 1) {
			// exportRoot["a" + counAns].alpha = 0;
			hideAns2();
			if (counAns === 1)
			{
				counAns = 8;
			}
			counAns--;
			exportRoot["a" + counAns].alpha = 1;
			console.log(" counAns IF = " + counAns);
		} else if (exportRoot["a" + counAns].placeNum !== null) {
			for (let i = 8; i >= numOfAns; i--) {
					if (exportRoot["a" + i].placeNum === null)
					{
						exportRoot["a" + i].alpha = 1;
						break;
					}
			}
			console.log(" counAns ELSE IF = " + counAns);
			
		}else {
			if (exportRoot["a" + counAns].placeNum === null) {
				exportRoot["a" + counAns].alpha = 0;
			}
			counAns = 8;
			exportRoot["a" + counAns].alpha = 1;
			console.log(" counAns ELSE = " + counAns);
			}

	// } 
	
}

function moveFn(e) {
     bounds = exportRoot.getBounds();
	e.currentTarget.disX = stage.mouseX - e.currentTarget.x;
	e.currentTarget.disY = stage.mouseY - e.currentTarget.y;
	e.currentTarget.x = e.stageX / (stage.scaleX);
	e.currentTarget.y = e.stageY / (stage.scaleY);
   // e.currentTarget.x = Math.max(bounds.x+e.currentTarget.nominalBounds.width/2.1, Math.min(bounds.x+bounds.width-e.currentTarget.nominalBounds.width/1.65, e.stageX / (stage.scaleX)));
   // e.currentTarget.y = Math.max(bounds.y+e.currentTarget.nominalBounds.height/1.7, Math.min(bounds.y+bounds.height-e.currentTarget.nominalBounds.height/1.9, e.stageY / (stage.scaleY)));
	e.currentTarget.removeEventListener("mouseover", over);
	e.currentTarget.removeEventListener("mouseout", out);
	e.currentTarget.gotoAndStop(2);
	exportRoot.addChild(e.currentTarget);
}

function pressupFn(e2) {
	found = false;

	// exportRoot["a" + counAns].alpha = 1;
	if (timeCounter > 0) {
		for (var i = 1; i <= numOfPlaces; i++) {

			if (Math.abs(e2.currentTarget.x - exportRoot["p" + i].x) < 198 &&
				Math.abs(e2.currentTarget.y - exportRoot["p" + i].y) < 57) {
				stopAllSounds();
				clickSd.play();
				found = true;
				if (exportRoot["p" + i].ansNum == null &&
					e2.currentTarget.placeNum == null) {
					counter++;
					l("if++ counter = " + counter)
				}

				if (exportRoot["p" + i].ansNum !== null) {
					var prevAnsNum = exportRoot["p" + i].ansNum;
					if (e2.currentTarget.placeNum !== null) {
						var prevPlaceNum = e2.currentTarget.placeNum;
						createjs.Tween.get(exportRoot["a" + prevAnsNum], {
							override: true
						}).to({
							x: exportRoot["p" + prevPlaceNum].x,
							y: exportRoot["p" + prevPlaceNum].y
						}, 150, createjs.Ease.easeOut);
						exportRoot["a" + prevAnsNum].placeNum = prevPlaceNum;
						exportRoot["p" + prevPlaceNum].ansNum = prevAnsNum;
					} else {
						createjs.Tween.get(exportRoot["a" + prevAnsNum], {
							override: true
						}).to({
							x: exportRoot["a" + prevAnsNum].xPos,
							y: exportRoot["a" + prevAnsNum].yPos
						}, 200, createjs.Ease.easeOut);
                        
						exportRoot["a" + prevAnsNum].placeNum = null;
						exportRoot["a" + prevAnsNum].alpha = 0;
                        exportRoot["a" + prevAnsNum].addEventListener("mouseover",  over);
                        exportRoot["a" + prevAnsNum].addEventListener("mouseout", out);
                        exportRoot["a" + prevAnsNum].gotoAndStop(0);
					}
				} else {
					if (e2.currentTarget.placeNum !== null) {
						var prevPlaceNum = e2.currentTarget.placeNum;
						exportRoot["p" + prevPlaceNum].ansNum = null;

					}
				}
				

				e2.currentTarget.x = exportRoot["p" + i].x;
				e2.currentTarget.y = exportRoot["p" + i].y;
				e2.currentTarget.addEventListener("pressmove", moveFn);
				e2.currentTarget.addEventListener("pressup", pressupFn);
				e2.currentTarget.gotoAndStop(2);
				e2.currentTarget.placeNum = i;
				
				exportRoot["p" + i].ansNum = e2.currentTarget.id;

				if (counter == numOfPlaces) {
					exportRoot.confirmBtn.alpha = 1;
				} else {
					exportRoot.confirmBtn.alpha = 0;
				}
				break;
			}
		}

		if (found == false) {
			if (e2.currentTarget.placeNum !== null) {
				var prevPlaceNum = e2.currentTarget.placeNum;
				exportRoot["p" + prevPlaceNum].ansNum = null;
				e2.currentTarget.placeNum = null;
				// exportRoot["a" + prevPlaceNum].alpha = 0;

				counter--;
				l("if-- counter = " + counter)
				exportRoot.confirmBtn.alpha = 0;
			}
			e2.currentTarget.addEventListener("mouseover", over);
			e2.currentTarget.addEventListener("mouseout", out);
			e2.currentTarget.gotoAndStop(0);

			createjs.Tween.get(e2.currentTarget, {
				override: true
			}).to({
				x: e2.currentTarget.xPos,
				y: e2.currentTarget.yPos
			}, 50, createjs.Ease.easeOut);
		}
		for (let i = 1; i <= numOfAns; i++) {
			// counAns++;
			if (exportRoot["a" + i].placeNum === null)
			{
				exportRoot["a" + i].alpha = 1;
				break;
			}
		}
		
		}

	/*l("counter = " + counter)
	l("exportRoot.ans1.placeNum " + exportRoot.ans1.placeNum)
	l("exportRoot.ans2.placeNum " + exportRoot.ans2.placeNum)
	l("exportRoot.ans3.placeNum " + exportRoot.ans3.placeNum)
	l("exportRoot.place1.ansNum " + exportRoot.place1.ansNum)
	l("exportRoot.place2.ansNum " + exportRoot.place2.ansNum)
	l("exportRoot.place3.ansNum " + exportRoot.place3.ansNum)*/
}

function confirmFN() {
	stopAllSounds();
	clickSd.play();
	clearInterval(timerInterval);
	hideFB();
	deactivateButtons();
	hideAns();
	//exportRoot["hideSymb"].alpha = 1;
	/*for (var i = 1; i <= numOfAns; i++) {
		if (exportRoot["a" + i].id == exportRoot["a" + i].placeNum) {
			score++;
		}
	}*/
             for(var i=1;i<=numOfAns;i++)
        {
          //  var targetPlace = exportRoot["p" + i];
                var targetPlace = exportRoot["a" + i].placeNum;
            console.log("targetPlace"+targetPlace);
            if(exportRoot["a"+i].ansGroup == exportRoot["p"+targetPlace].placeGroup){
                score++;
                
                
            }
    
        }
	if (score == numOfPlaces) {
		exportRoot["rightFB"].playV = true;
		exportRoot["rightFB"].alpha = 1;
		exportRoot["rightFB"].gotoAndPlay(0);
       // setTimeout(function(){exportRoot.showAnsBtn.alpha=1;},5500);
	} else {
		attempts++;
		if (attempts == maxAttempts) {
			exportRoot["wrongFB"].playV = true;
			exportRoot["wrongFB"].alpha = 1;
			exportRoot["wrongFB"].gotoAndPlay(0);
         //  setTimeout(function(){exportRoot.showAnsBtn.alpha=1;},6500);      

		} else {
			exportRoot["tryFB"].playV = true;
			exportRoot["tryFB"].alpha = 1;
			exportRoot["tryFB"].gotoAndPlay(0);
          // setTimeout(function(){exportRoot.retryBtn.alpha=1;},5500);
		}
	}
}

function retryFN() {
	stopAllSounds();
	clickSd.play();
	counter = 0;
	counAns = 1;
	score = 0;
	hideFB();
	retryV = true;
	activateButtons();
	retryV = false;
	Timer();
}


function over(e) {
    e.currentTarget.gotoAndStop(1);
}

function over2(e) {
    e.currentTarget.gotoAndStop(2);
}

function out(e) {
    e.currentTarget.gotoAndStop(0);
}

function Timer() {
	timeCounter = 60;
	timerFrame = 0;
	exportRoot["timerSymb"].gotoAndStop(timerFrame);
	timerInterval = setInterval(timerFn, 1000);
}

function timerFn() {
	timerFrame++;
	timeCounter--;
	exportRoot["timerSymb"].gotoAndStop(timerFrame);
	if (timeCounter == 0) {
		timeOut();
	}
}

function timeOut() {
	deactivateButtons();
	clearInterval(timerInterval);
	stopAllSounds();
	timeOutSd.play();
	setTimeout(function () {
		hideAns();
	//	exportRoot["hideSymb"].alpha = 1;
		attempts++;
		if (attempts == maxAttempts) {
			exportRoot["wrongFB"].playV = true;
			exportRoot["wrongFB"].alpha = 1;
			exportRoot["wrongFB"].gotoAndPlay(0);
		} else {
			exportRoot["timeOutFB"].playV = true;
			exportRoot["timeOutFB"].alpha = 1;
			exportRoot["timeOutFB"].gotoAndPlay(0);
		}
	}, 800);
}

function showBtns() {
    if (score == numOfPlaces || attempts == maxAttempts) {
        exportRoot["showAnsBtn"].alpha = 1;
    } else {
        exportRoot["retryBtn"].alpha = 1;
    }
}

/*function showScore() {
    if (score == numOfPlaces) {
        exportRoot["fullScore"].playV = true;
        exportRoot["fullScore"].alpha = 1;
        exportRoot["fullScore"].gotoAndPlay(0);
    } else{
        exportRoot["score_" + score].playV = true;
        exportRoot["score_" + score].alpha = 1;
        exportRoot["score_" + score].gotoAndPlay(0);
    }
}
// */
// function showScore() {
//     if (score == numOfPlaces) {
//         exportRoot["fullScore"].playV = true;
//         exportRoot["fullScore"].alpha = 1;
//         exportRoot["fullScore"].gotoAndPlay(0);
//     } else {
// 		if(score >= 0 && score <= 1){
			
//         exportRoot["score_0"].playV = true;
//         exportRoot["score_0"].alpha = 1;
//         exportRoot["score_0"].gotoAndPlay(0);
		
//     } else if(score > 2 && score <= 3){
// 		  exportRoot["score_1"].playV = true;
//         exportRoot["score_1"].alpha = 1;
//         exportRoot["score_1"].gotoAndPlay(0);
		
// 	}else if(score > 3 && score <= 5){
		
// 		  exportRoot["score_2"].playV = true;
//         exportRoot["score_2"].alpha = 1;
//         exportRoot["score_2"].gotoAndPlay(0);
			 
// 			 }else if(score > 5 && score <=7){
// 				 exportRoot["score_3"].playV =true;
// 				 exportRoot["score_3"].alpha=1;
// 				 exportRoot["score_3"].gotoAndPlay(0);
					  
// 					  } 
// }
// }
