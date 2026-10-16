var playerFace = 0;
var faceOffset = 0;

/* ==========================================================================\n   TSG 照片共享工具  ——  TSG真人照片统一接入层\n   --------------------------------------------------------------------------\n   所有游戏页面（assets/games/<名字>/index.html）和大厅首页都只需要：\n\n     <script src="../../photos/../js/photos.js"></script>   ← 大厅用 assets/js/\n     <script src="../../js/photos.js"></script>             ← 游戏页用这个\n\n   然后用 window.TSG 这一套 API，不用再各自写相对路径（写错就 404）。\n   路径由本文件自己的 URL 推导，无论从哪里打开页面都不会错。\n   ========================================================================== */
(function(){
"use strict";
var COUNT = 14;
var base = '../../photos/';
try{
  var s = (document.currentScript && document.currentScript.src) || '';
  if(s){ base = s.replace(/js\/tsg-photos\.js(\?[^#]*)?(#.*)?$/, 'photos/'); }
}catch(e){}
if(base === s || !/photos\/$/.test(base)){ base = '../../photos/'; }
var URLS = [];
for(var i=0;i<COUNT;i++){
  var n = (i<9 ? '0' : '') + (i+1);
  URLS.push(base + 'tsg-' + n + (i < 11 ? '.png' : '.jpg'));
}
var cache = new Array(COUNT);
function img(i){
  i = ((i % COUNT) + COUNT) % COUNT;
  var im = cache[i];
  if(!im){
    im = new Image();
    im.onload  = function(){ ready[i] = true;  if(onReady) onReady(i); };
    im.onerror = function(){ failed[i] = true; };
    im.decoding = 'async';
    im.src = URLS[i];
    cache[i] = im;
  }
  return im;
}
var ready = new Array(COUNT), failed = new Array(COUNT);
var onReady = null;
function ok(i){
  var im = img(i);
  return !!(im.complete && im.naturalWidth && !failed[i]);
}
function preload(cb){
  onReady = cb || null;
  for(var i=0;i<COUNT;i++) img(i);
}
function url(i){
  i = ((i % COUNT) + COUNT) % COUNT;
  return URLS[i];
}
function cssBg(i){
  return "url('" + url(i) + "')";
}
function drawFace(ctx, cx, cy, r, i, opts){
  /* 五子棋原页面把头像半径设为棋子半径的 0.52；在共享层只对该页面放大到约 0.70，
     保留外层黑/白棋壳的同时让 TSG 照片成为棋子主体。 */
  try{
    if(typeof location !== 'undefined' && /\/games\/wuziqi(?:\/|$)/.test(location.pathname || '')) r *= 1.35;
  }catch(e){}
  if(r <= 0) return false;
  if(!ok(i)) { img(i); return false; }
  opts = opts || {};
  var im = img(i);
  var side = Math.min(im.naturalWidth, im.naturalHeight);
  var sx = (im.naturalWidth  - side) / 2;
  var bias = opts.topBias == null ? 0.12 : opts.topBias;
  var sy = (im.naturalHeight - side) * bias;
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI*2);
  ctx.clip();
  ctx.drawImage(im, sx, sy, side, side, cx-r, cy-r, r*2, r*2);
  ctx.restore();
  if(opts.ring !== 'none'){
    var lw = Math.max(1, r * (opts.ringWidth == null ? 0.09 : opts.ringWidth));
    var rr = r - lw/2;
    if(rr > 0){
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, rr, 0, Math.PI*2);
      ctx.lineWidth = lw;
      ctx.strokeStyle = opts.ring || 'rgba(255,255,255,.92)';
      ctx.stroke();
      ctx.restore();
    }
  }
  return true;
}
function drawFaceRound(ctx, x, y, w, h, i, radius, opts){
  if(w <= 0 || h <= 0) return false;
  if(!ok(i)) { img(i); return false; }
  opts = opts || {};
  var r = Math.min(radius == null ? 8 : radius, w/2, h/2);
  ctx.save();
  roundPath(ctx, x, y, w, h, r);
  ctx.clip();
  var im = img(i);
  var side = Math.min(im.naturalWidth, im.naturalHeight);
  var sx = (im.naturalWidth  - side) / 2;
  var bias = opts.topBias == null ? 0.12 : opts.topBias;
  var sy = (im.naturalHeight - side) * bias;
  var scale = Math.max(w/side, h/side);
  var dw = side*scale, dh = side*scale;
  ctx.drawImage(im, sx, sy, side, side, x+(w-dw)/2, y+(h-dh)/2, dw, dh);
  ctx.restore();
  return true;
}
function roundPath(ctx, x, y, w, h, r){
  ctx.beginPath();
  ctx.moveTo(x+r, y);
  ctx.lineTo(x+w-r, y); ctx.quadraticCurveTo(x+w, y,   x+w, y+r);
  ctx.lineTo(x+w, y+h-r); ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
  ctx.lineTo(x+r, y+h);  ctx.quadraticCurveTo(x,   y+h, x,   y+h-r);
  ctx.lineTo(x, y+r);    ctx.quadraticCurveTo(x,   y,   x+r, y);
  ctx.closePath();
}
function setFace(el, i){
  if(!el) return;
  el.classList.add('tsg-face');
  el.style.backgroundImage = cssBg(i);
}
var css = [
  '.tsg-face{',
  '  background-size:cover;',
  '  background-position:center 15%;',
  '  background-repeat:no-repeat;',
  '}',
  '.tsg-face-round{ border-radius:22%; }',
  '.tsg-face-circle{ border-radius:50%; }',
  '.tsg-color-hotfix .avatar{width:60px!important;height:60px!important;border-width:3px!important;box-shadow:0 3px 12px rgba(44,116,150,.22)!important;}',
  '.tsg-color-hotfix #tsg-panel{display:flex;align-items:center;gap:14px;margin:0 0 14px;padding:10px 14px;border-radius:18px;background:rgba(255,255,255,.78);border:2px solid rgba(54,179,227,.24);box-shadow:0 5px 16px rgba(44,116,150,.12);}',
  '.tsg-color-hotfix #challenge-face{width:76px;height:76px;border-radius:50%;flex:0 0 76px;background:#cdeaf7;box-shadow:0 0 0 3px #fff,0 0 0 6px rgba(54,179,227,.28),0 5px 14px rgba(44,116,150,.18);}',
  '.tsg-color-hotfix #challenge-face.tsg-pop{animation:tsgSharedPop .28s ease;}',
  '.tsg-color-hotfix #challenge-copy{min-width:0;}',
  '.tsg-color-hotfix #challenge-copy b{display:block;color:#238ab3;font-size:16px;margin-bottom:3px;}',
  '.tsg-color-hotfix #challenge-msg{font-size:13px;line-height:1.55;color:#5b8296;}',
  '@keyframes tsgSharedPop{0%{transform:scale(.82)}60%{transform:scale(1.08)}100%{transform:scale(1)}}'
].join('');
function injectStyle(){
  if(!document.head) return;
  var st = document.createElement('style');
  st.textContent = css;
  document.head.appendChild(st);
}
if(document.head) injectStyle();
else document.addEventListener('DOMContentLoaded', injectStyle);
window.TSG = {
  COUNT: COUNT,
  base: base,
  urls: URLS,
  url: url,
  cssBg: cssBg,
  img: img,
  ok: ok,
  preload: preload,
  drawFace: drawFace,
  drawFaceRound: drawFaceRound,
  setFace: setFace,
  roundPath: roundPath
};
function installPageEnhancements(){
  var path = '';
  try{ path = location.pathname || ''; }catch(e){}
  if(/\/games\/yitiao(?:\/|$)/.test(path)){
    var hint = document.getElementById('hint');
    if(hint) hint.textContent = '按住屏幕，或按住 ↑ / W / 空格蓄力；松开起跳。连续中心命中会连击加分！';
    var held = false;
    function jumpKey(e){
      var k = String(e.key || '').toLowerCase();
      return k === 'arrowup' || k === 'w' || k === ' ';
    }
    window.addEventListener('keydown', function(e){
      if(e.target && /^(INPUT|SELECT|TEXTAREA)$/.test(e.target.tagName)) return;
      if(!jumpKey(e) || e.repeat || held) return;
      held = true;
      var cv = document.getElementById('cv');
      if(cv) cv.dispatchEvent(new Event('pointerdown', {bubbles:true, cancelable:true}));
      e.preventDefault();
    });
    window.addEventListener('keyup', function(e){
      if(!jumpKey(e)) return;
      held = false;
      window.dispatchEvent(new Event('pointerup', {bubbles:true, cancelable:true}));
      e.preventDefault();
    });
  }
  if(/\/games\/yanse(?:\/|$)/.test(path)){
    if(document.body) document.body.classList.add('tsg-color-hotfix');
    var target = document.getElementById('target');
    var panel = document.getElementById('tsg-panel');
    if(target && !panel){
      panel = document.createElement('div');
      panel.id = 'tsg-panel';
      panel.setAttribute('aria-label','TSG 挑战者');
      panel.innerHTML = '<div id="challenge-face"></div><div id="challenge-copy"><b>TSG 挑战者</b><div id="challenge-msg">盯紧色块，找出唯一不同的颜色！</div></div>';
      target.parentNode.insertBefore(panel,target);
    }
    var challengeFace = document.getElementById('challenge-face');
    var challengeMsg = document.getElementById('challenge-msg');
    var avatar = document.getElementById('avatar');
    var feedbackIndex = 0;
    function feedback(i,msg){
      setFace(avatar,i); setFace(challengeFace,i);
      if(challengeMsg && msg) challengeMsg.textContent = msg;
      if(challengeFace){
        challengeFace.classList.remove('tsg-pop');
        void challengeFace.offsetWidth;
        challengeFace.classList.add('tsg-pop');
      }
    }
    feedback(0,'盯紧色块，找出唯一不同的颜色！');
    document.addEventListener('click', function(e){
      var opt = e.target && e.target.closest ? e.target.closest('.opt') : null;
      if(!opt) return;
      if(opt.classList.contains('wrong')) feedback(10,'这块不是答案，再来一局挑战！');
      else { feedbackIndex++; feedback(feedbackIndex,'答对了！继续找下一块不同颜色。'); }
    });
    ['ovBtn','restart'].forEach(function(id){
      var b = document.getElementById(id);
      if(b) b.addEventListener('click', function(){ feedback(0,'盯紧色块，找出唯一不同的颜色！'); });
    });
  }
}
if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', installPageEnhancements);
else installPageEnhancements();
})();
