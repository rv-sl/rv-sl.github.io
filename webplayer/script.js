vh=document.querySelector('.v-h');
fullsi = document.getElementById("fullscreenBtn");
video = document.querySelector('video');
title = document.querySelector(".info h2");
des = document.querySelector('.info h4');

let subtitles = [];
let subtitleDisplay = document.querySelector('.subT');

const En = {
            // Generate a random 128-bit key for AES encryption
            generateKey: function() {
                return CryptoJS.enc.Base64.stringify(CryptoJS.lib.WordArray.random(16)); // 128-bit random key
            },

            // Encryption function
            encry: function(text) {
                // Generate a random key for encryption
                let key = this.generateKey();
                
                // Encrypt the text using AES and the generated key
                let encrypted = CryptoJS.AES.encrypt(text, key).toString();
                
                // Return the encrypted text along with the key
                return { text: encrypted, key: key };
            },

            // Decryption function
            decry: function(encryptedText, key) {
                // Decrypt the text using AES with the provided key
                let bytes = CryptoJS.AES.decrypt(encryptedText, key);
                return bytes.toString(CryptoJS.enc.Utf8); // Return the decrypted text
            }
        };    
        
function playM3u8(videoSrc,poster) {
   video.poster=poster;
   if (Hls.isSupported()) {
      var hls = new Hls();
      hls.loadSource(videoSrc);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, function () {
          //video.play();
          updatePlayPauseIcon();
          togglePlayer();
      });
   } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = videoSrc;
      video.addEventListener('loadedmetadata', function () {
          //video.play()
          updatePlayPauseIcon();
          togglePlayer();
      });
   }else{
      log("cant play!")
   }
}

       
function parseSRT(srtText) {
    const blocks = srtText.trim().split(/\r?\n\r?\n/);
    const subtitleData = [];

    for (const block of blocks) {
        const lines = block.trim().split(/\r?\n/);
        if (lines.length >= 3) {
            const id = parseInt(lines[0]);
            const time = lines[1];
            const text = lines.slice(2).join(" ").trim();
            subtitleData.push({ id, time, text });
        } else if (lines.length === 2) {
            const id = parseInt(lines[0]);
            const time = lines[1];
            subtitleData.push({ id, time, text: "" });
        }
    }

    return subtitleData;
}



function convertToSeconds(timeString) {
    let parts = timeString.split(':');
    let seconds = parseFloat(parts[2].replace(',', '.'));
    return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + seconds;
}


function highlightSubtitle() {
    let currentTime = video.currentTime;
     
    subtitles.forEach((sub, i) => {
        let times = sub.time.split(' --> ');
        let start = convertToSeconds(times[0]);
        let end = convertToSeconds(times[1]);
        if (currentTime >= start && currentTime <= end) {
            if(sub.text){
              // subtitleDisplay.textContent = sub.text;
                subtitleDisplay.innerHTML = sub.text;
            }else{
               subtitleDisplay.textContent = ""
            }
            console.log(start,end,"-",sub.text);
            //subtitleDisplay.ondblclick 
        }else if(currentTime >=end && currentTime >=start){
            subtitleDisplay.textContent = ""
        }
    });
}

async function setSub(subt) {
    if (!subt) {
        subtitleDisplay.style.display="none";
        return;
    }else{
        subtitleDisplay.textContent ="";
        subtitleDisplay.style.display="block";
    }
    x=await fetch(subt).then(x=>x.text());
    subtitles = parseSRT(x);
}

async function setSource(data) {
    if (data.src.includes("m3u8")==true) {
        playM3u8(data.src,data.poster);
    }else{
        video.poster = data.poster;
        video.src=data.src;
        
    }
    await setSub(data.subfile);
        title.textContent = data.title;
        des.innerHTML=data.description;
}

video.addEventListener('timeupdate', highlightSubtitle);

video_id = "2848264001";

async function fetch_data(id) {
    url=`https://raw.githubusercontent.com/Ravindu2355/RxVJson/main/files/${id}.txt`;
    x= await fetch(url).then(x=>x.text());
    console.log(x);
    sp = x.split("RvX");
    data = En.decry(sp[0],sp[1]);
    console.log(data);
    j=JSON.parse(data);
    setSource(j);
}

function exitApp() {
    Swal.fire({
        title: 'Exit App',
        text: 'Do you want to exit the app?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes',
        cancelButtonText: 'No'
    }).then((result) => {
        if (result.isConfirmed) {
            Android ? Android.exitApp():log("AppExit");
        } else {
            Android ? Android.showToast("Back action canceled!"):log("App Exit canceled!");
        }
    });
}

function handleBackButton() {
    if (!vh.classList.contains('absolute-fulls')) {
        exitApp();
    }else{
        fulls()
    }
}

function nso(ee){
    el=document.querySelector(".overlay-nos");
    btn=document.getElementById("fullscreenBtn");
    if(ee==1){
        el.style.display="none";
        btn.style.display="block";
    }else if(ee==0){
        el.style.display="flex";
        btn.style.display="none";
    }
}
//fetch_data(video_id);
function runn(){
params = new URLSearchParams(window.location.search);
//swal.fire("Info",window.location.search,"info");
// Get a specific parameter
if (params) {
    if (!params.get("id")) {
        if (!params.get("url")) {
            swal.fire("Error!","No source found!","error");
            nso(0);
        }else{
            nso(1);
            video.src=params.get("url");
        }
    }else{
        video_id = params.get("id");
        fetch_data(video_id)
        nso(1);
    }
}
}
