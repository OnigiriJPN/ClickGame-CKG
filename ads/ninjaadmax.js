// ninjaadmax.js
export function loadAd(containerId){
  const adContainer = document.getElementById(containerId);
  if(!adContainer) return;

  // デバイス判定
  const isMobile = window.innerWidth < 768;
  const adIframe = document.createElement('iframe');

  adIframe.style.border = 'none';
  adIframe.style.width = isMobile ? '320px' : '728px';
  adIframe.style.height = isMobile ? '50px' : '90px';
  adIframe.src = isMobile 
    ? 'https://safe-ninjaadmax.com/banner-mobile' 
    : 'https://safe-ninjaadmax.com/banner-desktop';

  adContainer.innerHTML = '';
  adContainer.appendChild(adIframe);
}

// ウィンドウリサイズ時も広告更新
window.addEventListener('resize', ()=>{
  loadAd('ad');
});
