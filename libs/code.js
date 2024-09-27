var canvas,
    stage,
    exportRoot,
    anim_container,
    dom_overlay_container,
    fnStartAnimation;

var soundsArr;
var video, video_div;
var clickSd, rightFbSd, wrongFbSd, quizSd, rightAnswer, wrongAnswer;

// var timeCounter = 40;
var ansTrue = 4;
var ansTrueBoolen = true;
var ansNumber = 6;
var numOfAns = 6;
var contAns = 1;
var correctAns = false;

var score = 0,
    prevAns = null,
    newAns = null;

var attempts = 0,
    maxAttempts = 3;

var counter = 0;

var overOut = [];
var l = console.log;

var isFirefox = typeof InstallTrigger !== "undefined";
/*========Start=======*/

var correctAnswersCountV = 0;

/*========End=======*/

function init()
{
    canvas = document.getElementById("canvas");
    anim_container = document.getElementById("animation_container");
    dom_overlay_container = document.getElementById("dom_overlay_container");
    var comp = AdobeAn.getComposition("2ECE35B8F0EAB545AEB7652990DC814A");
    var libs = comp.getLibrary();
    var loader = new createjs.LoadQueue(false);
    loader.addEventListener("fileload", function (evt)
    {
        handleFileLoad(evt, comp);
    });
    loader.addEventListener("complete", function (evt)
    {
        handleComplete(evt, comp);
    });
    var libs = comp.getLibrary();
    loader.loadManifest(libs.properties.manifest);
}
function handleFileLoad(evt, comp)
{
    var images = comp.getImages();
    if (evt && evt.item.type == "image")
    {
        images[evt.item.id] = evt.result;
    }
}

function handleComplete(evt, comp)
{
    //This function is always called, irrespective of the content. You can use the variable "stage" after it is created in token create_stage.
    var lib = comp.getLibrary();
    var ss = comp.getSpriteSheet();
    exportRoot = new lib.Activity01();
    stage = new lib.Stage(canvas);
    //Registers the "tick" event listener.
    var lib = comp.getLibrary();
    var ss = comp.getSpriteSheet();
    var queue = evt.currentTarget;
    var ssMetadata = lib.ssMetadata;
    for (i = 0; i < ssMetadata.length; i++)
    {
        ss[ssMetadata[i].name] = new createjs.SpriteSheet({
            images: [queue.getResult(ssMetadata[i].name)],
            frames: ssMetadata[i].frames,
        });
    }
    fnStartAnimation = function ()
    {
        stage.addChild(exportRoot);
        stage.enableMouseOver(10);
        createjs.Touch.enable(stage);
        document.ontouchmove = function (e)
        {
            e.preventDefault();
        };
        stage.mouseMoveOutside = true;
        stage.update();
        createjs.Ticker.setFPS(lib.properties.fps);
        createjs.Ticker.addEventListener("tick", stage);
        prepareTheStage();
    };
    //Code to support hidpi screens and responsive scaling.
    function makeResponsive(isResp, respDim, isScale, scaleType)
    {
        var lastW,
            lastH,
            lastS = 1;
        window.addEventListener("resize", resizeCanvas);
        resizeCanvas();

        function resizeCanvas()
        {
            var w = lib.properties.width,
                h = lib.properties.height;
            var iw = window.innerWidth,
                ih = window.innerHeight;
            var pRatio = window.devicePixelRatio || 1,
                xRatio = iw / w,
                yRatio = ih / h,
                sRatio = 1;
            if (isResp)
            {
                if (
                    (respDim == "width" && lastW == iw) ||
                    (respDim == "height" && lastH == ih)
                )
                {
                    sRatio = lastS;
                } else if (!isScale)
                {
                    if (iw < w || ih < h) sRatio = Math.min(xRatio, yRatio);
                } else if (scaleType == 1)
                {
                    sRatio = Math.min(xRatio, yRatio);
                } else if (scaleType == 2)
                {
                    sRatio = Math.max(xRatio, yRatio);
                }
            }
            canvas.width = w * pRatio * sRatio;
            canvas.height = h * pRatio * sRatio;
            canvas.style.width =
                dom_overlay_container.style.width =
                anim_container.style.width =
                w * sRatio + "px";
            canvas.style.height =
                anim_container.style.height =
                dom_overlay_container.style.height =
                h * sRatio + "px";
            stage.scaleX = pRatio * sRatio;
            stage.scaleY = pRatio * sRatio;
            lastW = iw;
            lastH = ih;
            lastS = sRatio;
            stage.tickOnUpdate = false;
            stage.update();
            stage.tickOnUpdate = true;
        }
    }
    makeResponsive(true, "both", true, 1);
    AdobeAn.compositionLoaded(lib.properties.id);
    fnStartAnimation();
    exportRoot["playBtn"].cursor = "pointer";
    exportRoot["playBtn"].addEventListener("click", playVideo);
}

function playVideo()
{
    exportRoot["playBtn"].alpha = 0;
    exportRoot["playBtn"].removeEventListener("click", playVideo);
    video_div = document.getElementById("videoPlay").style.display = "inline-block";

    exportRoot.gotoAndStop('playAnimate');
    video = document.getElementById("videoPlay").play();
    // setTimeout(function ()
    // {
    // }, 300);
    document.getElementById("videoPlay").onended = function ()
    {
        videoEnd();
    };

    // exportRoot.play();
}

function videoEnd()
{
    exportRoot.play();
    document.getElementById("videoPlay").style.display = "none";
    console.log("Play");
}

function prepareTheStage()
{
    overOut = [
        // exportRoot["showAnsBtn"],
        // exportRoot["confirmBtn"],
        exportRoot["backBtn"],
    ];
    for (var i = 0; i < overOut.length; i++)
    {
        console.log(i);
        overOut[i].cursor = "pointer";
        overOut[i].on("mouseover", over);
        overOut[i].on("mouseout", out);
    }

    // exportRoot["startBtn"].on("mouseover", over2);

    clickSd = new Howl({
        src: ["sounds/click.mp3"],
    });
    rightFbSd = new Howl({
        src: ["sounds/rightFbSd.mp3"],
    });
    wrongFbSd = new Howl({
        src: ["sounds/wrongFbSd.mp3"],
    });
    quizSd = new Howl({
        src: ["sounds/quizSd.mp3"],
    });
    rightAnswer = new Howl({
        src: ["sounds/rightAnswer.mp3"],
    });
    wrongAnswer = new Howl({
        src: ["sounds/wrongAnswer.mp3"],
    });

    soundsArr = [clickSd, rightFbSd, wrongFbSd, quizSd, rightAnswer, wrongAnswer];
    stopAllSounds();

    for (var i = 1; i <= numOfAns; i++)
    {
        exportRoot["a" + i].id = i;
        exportRoot["a" + i].placeNum = null;
        exportRoot["a" + i].clicked = true;
        if (i >= 4)
        {
            exportRoot["a" + i].alpha = 0.7;
        }
    }

    // exportRoot["confirmBtn"].addEventListener("click", confirmFN);

    exportRoot["backBtn"].addEventListener("click", backBtnFn);
    // exportRoot["showAnsBtn"].addEventListener("click", function () {
    //     hideFB();
    //     stopAllSounds();
    //     // exportRoot["showAnsBtn"].alpha = 0;
    //     exportRoot["backBtn"].alpha = 1;
    //     exportRoot["answers"].gotoAndPlay(0);
    // });

    hideFB();
}

function hideFB()
{
    exportRoot["wrongFB"].alpha = 0;
    exportRoot["wrongFB"].playV = false;
    exportRoot["rightFB"].alpha = 0;
    exportRoot["rightFB"].playV = false;
    exportRoot["ScreenEnd"].alpha = 0;
    exportRoot["ScreenEnd"].playV = false;

    // exportRoot["fb1"].gotoAndStop(0);
    // exportRoot["fb2"].gotoAndStop(0);
    // exportRoot["fb3"].gotoAndStop(0);

    // exportRoot["answers"].alpha = 0;
    // exportRoot["answers"].playV = false;
    // exportRoot["retryBtn"].alpha = 0;
    // exportRoot["retryBtn"].gotoAndStop(0);
    // exportRoot["showAnsBtn"].alpha = 0;
    // exportRoot["showAnsBtn"].gotoAndStop(0);
    // exportRoot["confirmBtn"].alpha = 0;
    // exportRoot["confirmBtn"].gotoAndStop(0);
    exportRoot["backBtn"].alpha = 0;
    exportRoot["backBtn"].gotoAndStop(0);
}

function stopAllSounds()
{
    for (var s = 0; s < soundsArr.length; s++)
    {
        soundsArr[s].stop();
    }
}

function deactivateButtons()
{
    for (var i = 1; i <= ansNumber; i++)
    {
        if (exportRoot["a" + i].placeNum == null)
        {
            exportRoot["a" + i].cursor = "auto";
            exportRoot["a" + i].removeEventListener("click", chooseAnsFn);
            exportRoot["a" + i].removeEventListener("mouseover", over2);
            exportRoot["a" + i].removeEventListener("mouseout", out);
        }
    }
}
function closeButtons()
{
    for (var i = 1; i <= ansNumber; i++)
    {
        exportRoot["a" + i].cursor = "auto";
        exportRoot["a" + i].removeEventListener("click", chooseAnsFn);
        exportRoot["a" + i].removeEventListener("mouseover", over2);
        exportRoot["a" + i].removeEventListener("mouseout", out);
    }
}

function activateAns2()
{
    if (ansTrueBoolen)
    {
        contAns = 1;
        numOfAns = 3;
    } else
    {
        contAns = 4;
        numOfAns = 6;
    }
    for (var i = contAns; i <= numOfAns; i++)
    {
        if (exportRoot["a" + i].placeNum == null)
        {
            exportRoot["a" + i].cursor = "pointer";
            exportRoot["a" + i].alpha = 1;
            exportRoot["a" + i].addEventListener("click", chooseAnsFn);
            exportRoot["a" + i].addEventListener("mouseover", over2);
            exportRoot["a" + i].addEventListener("mouseout", out);
        }
    }
}

function deactivateAns2()
{
    if (!ansTrueBoolen)
    {
        contAns = 1;
        numOfAns = 3;
    } else
    {
        contAns = 4;
        numOfAns = 6;
    }
    for (var i = contAns; i <= numOfAns; i++)
    {
        if (exportRoot["a" + i].placeNum == null)
        {
            exportRoot["a" + i].cursor = "auto";
            exportRoot["a" + i].alpha = 0.7;
            exportRoot["a" + i].removeEventListener("click", chooseAnsFn);
            exportRoot["a" + i].removeEventListener("mouseover", over2);
            exportRoot["a" + i].removeEventListener("mouseout", out);
        }
    }
    setTimeout(() =>
    {
        activateAns2();
    }, 150);
}

function chooseAnsFn(e2)
{
    stopAllSounds();

    if (e2.currentTarget.id <= 3)
    {
        if (e2.currentTarget.clicked)
        {
            clickSd.play(); // Sounds Click
            e2.currentTarget.gotoAndStop(4); // Active Button click After Select
            e2.currentTarget.cursor = "default";
            e2.currentTarget.removeEventListener("mouseover", over2);
            e2.currentTarget.removeEventListener("mouseout", out);
            e2.currentTarget.placeNum = e2.currentTarget.id;
            e2.currentTarget.clicked = false;
            prevAns = e2.currentTarget.id;
            ansTrueBoolen = false;
            console.log("IF " + ansTrueBoolen);
            deactivateButtons();
            deactivateAns2();
        }
        // else
        // {
        //     exportRoot["a" + prevAns].gotoAndStop(4);
        //     exportRoot["a" + prevAns].placeNum = null;
        //     exportRoot["a" + prevAns].clicked = true;
        //     ansTrueBoolen = true;
        //     console.log(ansTrueBoolen);
        //     setTimeout(() =>
        //     {
        //         activateAns2();
        //         deactivateAns2();
        //     }, 1000);
        // }
    } else if (e2.currentTarget.id >= 4)
    {
        if (e2.currentTarget.clicked)
        {
            clickSd.play(); // Sounds Click
            e2.currentTarget.gotoAndStop(4); // Active Button click After Select
            e2.currentTarget.cursor = "default";
            e2.currentTarget.removeEventListener("mouseover", over2);
            e2.currentTarget.removeEventListener("mouseout", out);
            e2.currentTarget.placeNum = e2.currentTarget.id;
            e2.currentTarget.clicked = false;
            newAns = e2.currentTarget.id;
            ansTrueBoolen = true;
            deactivateButtons();
            // exportRoot["confirmBtn"].alpha = 1;
            // exportRoot["confirmBtn"].addEventListener("click", confirmFN);
            confirmFN();
        }
        // else
        // {
        //     exportRoot["a" + newAns].gotoAndStop(4);
        //     exportRoot["a" + newAns].placeNum = null;
        //     exportRoot["a" + newAns].clicked = true;
        //     ansTrueBoolen = false;
        //     setTimeout(() =>
        //     {
        //         deactivateAns2();
        //     }, 1000);

        // exportRoot["confirmBtn"].alpha = 0;
        // exportRoot["confirmBtn"].removeEventListener("click", confirmFN);
        // }
        // exportRoot["a" + prevAns].removeEventListener("click", chooseAnsFn);
    }
}

function confirmFN()
{
    closeButtons();
    // exportRoot["confirmBtn"].alpha = 0;
    stopAllSounds();
    clickSd.play();
    // if (prevAns + 3 == newAns)
    // {
    //     score++;
    // console.log("score " + score);
    // exportRoot["rightFB"].playV = true;
    // exportRoot["rightFB"].alpha = 1;
    // exportRoot["rightFB"].gotoAndPlay(0);
    // console.log('newAns:- ' + newAns);
    // } else
    // {
    //     exportRoot["wrongFB"].playV = true;
    //     exportRoot["wrongFB"].alpha = 1;
    //     exportRoot["wrongFB"].gotoAndPlay(0);
    // }
    retryFN();
}

function retryFN()
{
    if (prevAns + 3 == newAns)
    {
        score++;
        exportRoot["a" + prevAns].gotoAndStop(5);
        exportRoot["a" + prevAns].clicked = true;
        exportRoot["a" + newAns].gotoAndStop(5);
        exportRoot["a" + newAns].clicked = true;
        exportRoot["a" + newAns].alpha = 1;
        exportRoot["fb" + prevAns].gotoAndPlay(2);
        rightAnswer.play();
    } else
    {
        attempts++;
        exportRoot["a" + prevAns].gotoAndStop(6);
        exportRoot["a" + prevAns].placeNum = null;
        exportRoot["a" + prevAns].clicked = true;
        exportRoot["a" + newAns].gotoAndStop(6);
        exportRoot["a" + newAns].placeNum = null;
        exportRoot["a" + newAns].alpha = 1;
        exportRoot["a" + newAns].clicked = true;
        wrongAnswer.play();
    }
    stopAllSounds();
    hideFB();
    setTimeout(() =>
    {
        if (score == 3 && attempts < 3)
        {
            for (let i = 0; i <= 3; i++)
            {
                exportRoot["fb" + i].alpha = 0;
            }
            exportRoot["ScreenEnd"].alpha = 1;
            exportRoot["ScreenEnd"].playV = true;
            exportRoot["ScreenEnd"].gotoAndPlay(0);
        } else if (attempts == 3)
        {
            exportRoot["wrongFB"].playV = true;
            exportRoot["wrongFB"].alpha = 1;
            exportRoot["wrongFB"].gotoAndPlay(0);
        }
    }, 1000);
    setTimeout(() =>
    {
        deactivateAns2();
    }, 1900);
}

function over(e)
{
    e.currentTarget.gotoAndStop(1);
}
function over2(e)
{
    e.currentTarget.gotoAndStop(2);
}

function out(e)
{
    e.currentTarget.gotoAndStop(0);
}

function backBtnFn()
{
    attempts = 0;
    score = 0;
    ansTrueBoolen = true;
    deactivateButtons();
    deactivateAns2();
    hideFB();
    exportRoot.gotoAndPlay('firstAn');
    for (let i = 0; i <= 3; i++)
    {
        exportRoot["fb" + i].alpha = 1;
    }
    for (var i = 1; i <= numOfAns; i++)
    {
        exportRoot["a" + i].id = i;
        exportRoot["a" + i].placeNum = null;
        exportRoot["a" + i].clicked = true;
        if (i >= 4)
        {
            exportRoot["a" + i].alpha = 0.7;
        }
    }
}
function activated()
{
    setTimeout(() =>
    {
        activateAns2();
    }, 1000);
}
