function fulls() {
    if (!vh.classList.contains("absolute-fulls")) {
        try{
           vh.requestFullscreen();
        }catch(eer){alert(`${eer}`)}
        vh.classList.remove("relative-normal");
        vh.classList.add("absolute-fulls");
        fullsi.textContent="fullscreen_exit";
        video.classList.add('fullv');
        Android.enterFullscreen();
    }else{
        try{
          document.exitFullscreen();
        }catch(eer){alert(`${eer}`);}
        vh.classList.add("relative-normal");
        vh.classList.remove("absolute-fulls");
        video.classList.remove('fullv');
        fullsi.textContent="fullscreen";
        Android.exitFullscreen();
    }
    
}

lfile=document.getElementById("localF");
lfile.addEventListener("change",function(e){
   file=e.target.files[0];
    if (file) {
    const fileURL = URL.createObjectURL(file); // create temporary URL
    video.src = fileURL;
    video.load();
    video.play();
       nso(1)
  }
})

async function checkFOUOId(){
   url=document.getElementById("inU");
   if(url.value){
      if(url.value.includes("http")){
         video.src=url.value;
         nso(1);
      }else{
         await fetch_data(url.value);
         nso(1);
      }
   }
}
