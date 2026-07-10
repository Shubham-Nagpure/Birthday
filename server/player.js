/* Renders a buyer's personalized surprise site as a single self-contained HTML
   page from their stored plan + content. Data-driven version of the demo site. */

function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, c =>
        ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
function multiline(s) {
    return esc(s).replace(/\n/g, "<br>");
}

/* Theme presets — must mirror the TEMPLATES list in sell/script.js */
const TEMPLATES = {
    romantic:    { accent: "#D6246E", accent2: "#E62D87", g1: "#FFF6D6", g2: "#FFDCE8" },
    birthday:    { accent: "#E6462D", accent2: "#FF7A45", g1: "#FFF4D6", g2: "#FFE0C2" },
    anniversary: { accent: "#B8873C", accent2: "#D4A24E", g1: "#FFF6E9", g2: "#F7E4D0" },
    friendship:  { accent: "#E67E22", accent2: "#F39C12", g1: "#FFF6D6", g2: "#FFEFC2" },
    congrats:    { accent: "#159A5B", accent2: "#27C06F", g1: "#EAFBF0", g2: "#D6F5E3" },
    valentine:   { accent: "#E23E6B", accent2: "#FF5A87", g1: "#FFE3EC", g2: "#FFC9DA" },
    sorry:       { accent: "#6C7BE0", accent2: "#8A97F0", g1: "#EEF1FF", g2: "#E0E7FF" }
};

export function renderSite({ slug, pages, plan, template, content: d, preview }) {
    const has = id => pages.includes(id);
    const t = TEMPLATES[template] || TEMPLATES.romantic;
    const isFree = plan === "free";
    const name = d.intro_name || "My Love";
    const sections = [];

    // Build the step nav + sections only for chosen pages
    const stepMeta = [];

    if (has("intro")) {
        stepMeta.push({ id: "intro", ico: "🌟", label: "Welcome" });
        sections.push(`
        <section class="pg" data-pg="intro">
            <p class="greet">${esc(d.intro_greeting || "Hey")}</p>
            <h1 class="big-name">${esc(name)}</h1>
            <button class="btn nextbtn">Begin ✨</button>
        </section>`);
    }
    if (has("ask")) {
        stepMeta.push({ id: "ask", ico: "💘", label: "A Question" });
        const questions = (d.ask || []).filter(a => a && a.q).map(a => a.q);
        const isLast = !pages.slice(pages.indexOf("ask") + 1).length;
        sections.push(`
        <section class="pg" data-pg="ask"
            data-questions='${esc(JSON.stringify(questions.length ? questions : ["Will you?"]))}'
            data-yes="${esc(d.ask_yes || "Yes 💛")}"
            data-no="${esc(d.ask_no || "No")}"
            data-msg="${esc(d.ask_message || "Yayy! 🥰")}"
            data-last="${isLast ? 1 : 0}">
            <h2 class="title">${esc(d.ask_title || "I have something to ask…")}</h2>
            <div class="ask-stage">
                <h3 class="ask-q"></h3>
                <div class="ask-btns">
                    <button class="btn ask-yes"></button>
                    <button class="ask-no"></button>
                </div>
            </div>
            <div class="ask-done hide"></div>
            <button class="btn nextbtn hide">Continue →</button>
        </section>`);
    }
    if (has("story")) {
        stepMeta.push({ id: "story", ico: "📖", label: "Our Story" });
        sections.push(`
        <section class="pg" data-pg="story">
            <div class="card">
                <h2 class="title">Do You Know ❤️</h2>
                <p class="story">${multiline(d.story_text || "")}</p>
                <button class="btn nextbtn">Ready for more →</button>
            </div>
        </section>`);
    }
    if (has("gallery")) {
        stepMeta.push({ id: "gallery", ico: "📸", label: "Gallery" });
        const photos = (d.gallery || []).filter(g => g && (g.photo || g.caption));
        const slides = photos.length ? photos.map((g, i) => `
            <div class="slide ${i === 0 ? "on" : ""}">
                ${g.photo && /^https?:\/\//.test(g.photo)
                    ? `<img class="slide-img" src="${esc(g.photo)}" alt="${esc(g.caption || "")}">`
                    : `<div class="slide-img ph">📷<span>${esc(g.photo || "Photo")}</span></div>`}
                <div class="slide-info"><h3>${esc(g.caption || "")}</h3><p>${esc(g.desc || "")}</p></div>
            </div>`).join("") : `<div class="slide on"><div class="slide-info"><p>No photos added.</p></div></div>`;
        sections.push(`
        <section class="pg" data-pg="gallery">
            <h2 class="title">Our Memory Gallery 📸</h2>
            <div class="gallery">
                <div class="slides">${slides}</div>
                <div class="gal-ctl"><button class="gbtn" data-dir="-1">‹</button><button class="gbtn" data-dir="1">›</button></div>
            </div>
            <button class="btn nextbtn">Continue →</button>
        </section>`);
    }
    if (has("puzzle")) {
        stepMeta.push({ id: "puzzle", ico: "🧩", label: "Puzzle" });
        const img = /^https?:\/\//.test(d.puzzle_photo || "") ? d.puzzle_photo : "";
        sections.push(`
        <section class="pg" data-pg="puzzle">
            <h2 class="title">Piece Us Together 🧩</h2>
            <p class="sub">${esc(d.puzzle_sub || "Slide the tiles to fix our photo 💕")}</p>
            <div class="puzzle" data-img="${esc(img)}"></div>
            <p class="moves">Moves: <span class="mv">0</span></p>
            <button class="btn nextbtn">Continue →</button>
        </section>`);
    }
    if (has("letter")) {
        stepMeta.push({ id: "letter", ico: "✉️", label: "Letter" });
        sections.push(`
        <section class="pg" data-pg="letter">
            <h2 class="title">A Letter for You ✉️</h2>
            <div class="envelope">
                <div class="paper">
                    <p class="salu">${esc(d.letter_salutation || "My Love,")}</p>
                    <div class="body">${multiline(d.letter_body || "")}</div>
                    <p class="valed">${multiline(d.letter_signoff || "")}</p>
                </div>
            </div>
            <p class="tip">Tap the envelope to open it ✨</p>
            <button class="btn nextbtn hide">Continue →</button>
        </section>`);
    }
    if (has("quiz")) {
        stepMeta.push({ id: "quiz", ico: "💭", label: "Quiz" });
        const quiz = (d.quiz || []).filter(x => x && x.q);
        sections.push(`
        <section class="pg" data-pg="quiz">
            <div class="card">
                <h2 class="title">How Well Do You Know Us? 💭</h2>
                <div class="quizbox" data-quiz='${esc(JSON.stringify(quiz))}'></div>
            </div>
        </section>`);
    }
    if (has("reasons")) {
        stepMeta.push({ id: "reasons", ico: "💖", label: "Reasons" });
        const reasons = (d.reasons || []).filter(r => r && r.reason);
        const cards = reasons.map((r, i) => `<div class="rcard" style="--i:${i}">${esc(r.reason)}</div>`).join("");
        sections.push(`
        <section class="pg" data-pg="reasons">
            <h2 class="title">Reasons I Love You 💖</h2>
            <div class="reasons">${cards || "<p>No reasons added.</p>"}</div>
            <button class="btn nextbtn">Reveal the surprise →</button>
        </section>`);
    }
    if (has("finale")) {
        stepMeta.push({ id: "finale", ico: "🎁", label: "Surprise" });
        sections.push(`
        <section class="pg" data-pg="finale">
            <h1 class="finale-msg">${esc(d.finale_msg || "Happy Birthday! 🎉")}</h1>
            <p class="finale-from">${d.from_name ? "With all my love, " + esc(d.from_name) : ""}</p>
        </section>`);
    }

    const music = /^https?:\/\//.test(d.finale_music || "") ? d.finale_music : "";

    return `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(d.finale_msg || "A Surprise For " + name)} 💖</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@300..700&family=Poppins:wght@400;500;600&family=Caveat:wght@600;700&display=swap" rel="stylesheet">
<style>:root{--accent:${t.accent};--accent2:${t.accent2};--g1:${t.g1};--g2:${t.g2}}</style>
<style>${PLAYER_CSS}</style>
</head><body>
${music ? `<audio id="bgm" loop src="${esc(music)}"></audio><button id="music" class="music">🎵</button>` : ""}
<canvas id="confetti"></canvas>
${preview ? `<div class="preview-ribbon">👀 Preview — not published yet</div>` : ""}
<main id="app">${sections.join("")}</main>
${isFree && !preview ? `<a class="wishtoria-badge" href="/" target="_blank">Made with 🎁 wishtoria</a>` : ""}
<script>window.__PAGES__=${JSON.stringify(pages)};</script>
<script>${PLAYER_JS}</script>
</body></html>`;
}

/* ---------------- Player CSS (matches the romantic aesthetic) ---------------- */
const PLAYER_CSS = `
*{margin:0;padding:0;box-sizing:border-box}
:root{--ink:#2D1A24;--line:#2C1123}
body{font-family:'Fredoka',sans-serif;color:var(--ink);min-height:100vh;
 background:linear-gradient(135deg,var(--g1) 0%,var(--g2) 100%);background-attachment:fixed;overflow-x:hidden}
#app{max-width:760px;margin:0 auto;padding:2rem 1.2rem 5rem;min-height:100vh}
.pg{display:none;animation:fade .6s ease;text-align:center;min-height:80vh;
 flex-direction:column;align-items:center;justify-content:center;gap:1.2rem}
.pg.on{display:flex}
@keyframes fade{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
.title{font-size:clamp(1.6rem,5vw,2.4rem);font-weight:700}
.sub{font-family:'Poppins';color:#6B5860}
.greet{font-family:'Caveat';font-size:2rem;color:var(--accent)}
.big-name{font-size:clamp(2.8rem,12vw,6rem);font-weight:700;
 background:linear-gradient(180deg,var(--accent2),var(--accent));-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent}
.card{background:#fff;border:2.5px solid var(--line);box-shadow:8px 8px 0 var(--line);
 border-radius:24px;padding:2rem;max-width:640px;width:100%}
.story{font-family:'Poppins';line-height:1.8;color:var(--ink);margin:1.2rem 0;text-align:left}
.btn{font-family:'Fredoka';font-weight:600;font-size:1.05rem;color:#fff;background:var(--accent);
 border:2.5px solid var(--line);border-radius:40px;padding:.8rem 1.6rem;cursor:pointer;
 box-shadow:5px 5px 0 var(--line);transition:transform .15s,box-shadow .15s}
.btn:hover{transform:translate(-2px,-2px);box-shadow:7px 7px 0 var(--line)}
.btn:active{transform:translate(2px,2px);box-shadow:2px 2px 0 var(--line)}
.hide{display:none}
/* gallery */
.gallery{width:100%;max-width:560px;position:relative}
.slides{position:relative;height:auto}
.slide{display:none}.slide.on{display:block;animation:fade .5s}
.slide-img{width:100%;height:340px;object-fit:cover;border:2.5px solid var(--line);border-radius:20px;box-shadow:6px 6px 0 var(--line)}
.slide-img.ph{display:flex;flex-direction:column;align-items:center;justify-content:center;font-size:3rem;background:#FFF0F5;gap:.5rem}
.slide-img.ph span{font-size:1rem;font-family:'Poppins';color:#6B5860}
.slide-info h3{margin-top:1rem;font-size:1.3rem}
.slide-info p{font-family:'Poppins';color:#6B5860}
.gal-ctl{display:flex;justify-content:space-between;position:absolute;top:150px;width:100%}
.gbtn{width:46px;height:46px;border-radius:50%;border:2.5px solid var(--line);background:#fff;
 font-size:1.5rem;cursor:pointer;box-shadow:3px 3px 0 var(--line)}
/* puzzle */
.puzzle{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;width:300px;height:300px;
 background:#fff;border:2.5px solid var(--line);box-shadow:6px 6px 0 var(--line);border-radius:16px;padding:6px}
.tile{background:#FFDCE8;border:2px solid var(--line);border-radius:10px;display:flex;align-items:center;
 justify-content:center;font-weight:700;font-size:1.4rem;cursor:pointer;background-size:300px 300px}
.tile.empty{visibility:hidden}
.moves{font-family:'Poppins';color:#6B5860}
/* letter */
.envelope{background:#fff;border:2.5px solid var(--line);box-shadow:8px 8px 0 var(--line);
 border-radius:16px;max-width:560px;width:100%;padding:0;overflow:hidden;cursor:pointer;transition:transform .2s}
.envelope.open{cursor:default}
.envelope .paper{max-height:0;opacity:0;padding:0 2rem;transition:max-height .6s ease,opacity .5s,padding .4s;text-align:left}
.envelope.open .paper{max-height:1200px;opacity:1;padding:2rem}
.salu{font-family:'Caveat';font-size:1.8rem;color:var(--accent);margin-bottom:1rem}
.body{font-family:'Poppins';line-height:1.9}
.valed{font-family:'Caveat';font-size:1.5rem;margin-top:1.2rem;text-align:right}
.tip{font-family:'Poppins';color:#6B5860;margin-top:.5rem}
/* quiz */
.q-opt{display:block;width:100%;text-align:left;margin:.5rem 0;padding:.8rem 1rem;font-family:'Poppins';
 background:#FFF7FA;border:2.5px solid var(--line);border-radius:14px;cursor:pointer;font-size:1rem}
.q-opt:hover{background:#FFEAEF}
.q-opt.right{background:#D6F5E3;border-color:#159a5b}
.q-opt.wrong{background:#FFD9E0}
.q-num{font-family:'Poppins';color:#6B5860;margin-bottom:.6rem}
.q-text{font-size:1.3rem;margin-bottom:1rem}
/* reasons */
.reasons{display:flex;flex-wrap:wrap;gap:1rem;justify-content:center;max-width:640px}
.rcard{background:#fff;border:2.5px solid var(--line);box-shadow:5px 5px 0 var(--line);border-radius:16px;
 padding:1.2rem;font-family:'Poppins';max-width:280px;animation:pop .4s both;animation-delay:calc(var(--i)*.1s)}
@keyframes pop{from{opacity:0;transform:scale(.8)}to{opacity:1;transform:none}}
/* ask (No runs away) */
.ask-stage{position:relative;width:100%;max-width:520px;min-height:240px;display:flex;flex-direction:column;
 align-items:center;justify-content:center;gap:1.6rem;padding:1rem}
.ask-q{font-size:clamp(1.4rem,5vw,2.1rem);font-weight:700}
.ask-btns{display:flex;gap:1.2rem;align-items:center;flex-wrap:wrap;justify-content:center}
.ask-yes{transition:transform .15s ease}
.ask-no{font-family:'Fredoka';font-weight:600;font-size:1.05rem;color:var(--ink);background:#fff;
 border:2.5px solid var(--line);border-radius:40px;padding:.8rem 1.6rem;cursor:pointer;box-shadow:5px 5px 0 var(--line);
 transition:transform .12s ease, top .12s ease, left .12s ease}
.ask-done{text-align:center}
/* finale */
.finale-msg{font-size:clamp(2rem,8vw,4rem);font-weight:700;
 background:linear-gradient(180deg,var(--accent2),var(--accent));-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent}
.preview-ribbon{position:fixed;top:0;left:0;right:0;z-index:60;text-align:center;
 font-family:'Poppins',sans-serif;font-weight:600;font-size:.85rem;color:#fff;
 background:var(--accent);padding:.5rem 1rem;box-shadow:0 2px 8px rgba(0,0,0,.15)}
.wishtoria-badge{position:fixed;bottom:.8rem;left:50%;transform:translateX(-50%);z-index:50;
 font-family:'Poppins',sans-serif;font-size:.8rem;text-decoration:none;color:var(--ink);
 background:#fff;border:2px solid var(--line);box-shadow:2px 2px 0 var(--line);border-radius:20px;padding:.35rem .9rem}
.finale-from{font-family:'Caveat';font-size:1.8rem;color:var(--ink);margin-top:1rem}
.music{position:fixed;top:1rem;right:1rem;z-index:30;width:48px;height:48px;border-radius:50%;
 border:2.5px solid var(--line);background:#fff;font-size:1.3rem;cursor:pointer;box-shadow:3px 3px 0 var(--line)}
#confetti{position:fixed;inset:0;pointer-events:none;z-index:40;display:none}
`;

/* ---------------- Player JS ---------------- */
const PLAYER_JS = `
(function(){
 var pgs=[].slice.call(document.querySelectorAll('.pg'));
 var i=0;
 function show(n){pgs.forEach(function(p,k){p.classList.toggle('on',k===n)});i=n;window.scrollTo(0,0);
   var pg=pgs[n];if(pg&&pg.dataset.pg==='finale')celebrate();}
 if(pgs.length)show(0);
 document.querySelectorAll('.nextbtn').forEach(function(b){b.addEventListener('click',function(){if(i<pgs.length-1)show(i+1)})});

 // gallery
 var gi=0,slides=[].slice.call(document.querySelectorAll('.slide'));
 document.querySelectorAll('.gbtn').forEach(function(b){b.addEventListener('click',function(){
   if(!slides.length)return;slides[gi].classList.remove('on');
   gi=(gi+ +b.dataset.dir+slides.length)%slides.length;slides[gi].classList.add('on');})});

 // letter
 var env=document.querySelector('.envelope');
 if(env)env.addEventListener('click',function(){env.classList.add('open');
   var nb=env.parentElement.querySelector('.nextbtn');if(nb)nb.classList.remove('hide');
   var tip=env.parentElement.querySelector('.tip');if(tip)tip.style.display='none';});

 // ask (No runs away)
 var askPg=document.querySelector('.pg[data-pg="ask"]');
 if(askPg){
   var qs;try{qs=JSON.parse(askPg.dataset.questions||'[]');}catch(e){qs=[];}
   if(!qs.length)qs=['Will you?'];
   var ai=0,scale=1;
   var stage=askPg.querySelector('.ask-stage'),done=askPg.querySelector('.ask-done');
   var qEl=askPg.querySelector('.ask-q'),yes=askPg.querySelector('.ask-yes'),no=askPg.querySelector('.ask-no');
   yes.textContent=askPg.dataset.yes;no.textContent=askPg.dataset.no;
   function renderQ(){qEl.textContent=qs[ai];}
   renderQ();
   function dodge(){
     var s=stage.getBoundingClientRect(),nb=no.getBoundingClientRect();
     var maxX=Math.max(0,s.width-nb.width),maxY=Math.max(0,s.height-nb.height);
     no.style.position='absolute';
     no.style.left=Math.round((0.05+0.9*((ai*7+scale*13)%1||Math.abs(Math.sin(ai+scale*9))))*maxX)+'px';
     no.style.top=Math.round((0.05+0.9*(Math.abs(Math.cos(ai*3+scale*5))))*maxY)+'px';
     scale=Math.max(0.45,scale-0.07);
     no.style.transform='scale('+scale+')';
     yes.style.transform='scale('+(1+(1-scale)*0.9)+')';
   }
   no.addEventListener('mouseover',dodge);
   no.addEventListener('mousedown',function(e){e.preventDefault();dodge();});
   no.addEventListener('click',function(e){e.preventDefault();dodge();});
   no.addEventListener('touchstart',function(e){e.preventDefault();dodge();},{passive:false});
   yes.addEventListener('click',function(){
     ai++;scale=1;
     no.style.position='';no.style.left='';no.style.top='';no.style.transform='';yes.style.transform='';
     if(ai<qs.length){renderQ();}
     else{
       stage.classList.add('hide');done.classList.remove('hide');
       done.innerHTML='<h1 class="finale-msg">'+askPg.dataset.msg+'</h1>';
       celebrate();
       if(askPg.dataset.last!=='1'){var nb=askPg.querySelector('.nextbtn');if(nb)nb.classList.remove('hide');}
     }
   });
 }

 // puzzle (3x3 sliding)
 var pz=document.querySelector('.puzzle');
 if(pz){var img=pz.dataset.img,order=[0,1,2,3,4,5,6,7,8];
  function draw(){pz.innerHTML='';order.forEach(function(v,idx){var t=document.createElement('div');
    t.className='tile'+(v===8?' empty':'');
    if(v!==8){if(img){t.style.backgroundImage='url('+img+')';t.style.backgroundPosition=(-(v%3)*97)+'px '+(-(Math.floor(v/3))*97)+'px';}else{t.textContent=v+1;}}
    t.addEventListener('click',function(){move(idx)});pz.appendChild(t);});}
  function move(idx){var e=order.indexOf(8);var r=Math.floor(idx/3),c=idx%3,er=Math.floor(e/3),ec=e%3;
    if(Math.abs(r-er)+Math.abs(c-ec)===1){order[e]=order[idx];order[idx]=8;mv++;document.querySelector('.mv').textContent=mv;draw();}}
  var mv=0;
  // shuffle solvable-ish
  for(var s=0;s<60;s++){var e=order.indexOf(8),opts=[e-1,e+1,e-3,e+3].filter(function(x){return x>=0&&x<9&&!(x===e-1&&e%3===0)&&!(x===e+1&&e%3===2)});
   var pick=opts[s%opts.length];order[e]=order[pick];order[pick]=8;}
  draw();}

 // quiz
 var qb=document.querySelector('.quizbox');
 if(qb){var quiz=JSON.parse(qb.dataset.quiz||'[]');var qi=0;
  function render(){if(qi>=quiz.length){qb.innerHTML='<h3 class="q-text">Yayyy! 🎉</h3><button class="btn" id="qnext">Continue →</button>';
    document.getElementById('qnext').addEventListener('click',function(){if(i<pgs.length-1)show(i+1)});return;}
   var q=quiz[qi];var opts=[0,1,2,3].map(function(n){return q['opt'+n];}).filter(function(x){return x;});
   qb.innerHTML='<p class="q-num">Question '+(qi+1)+' of '+quiz.length+'</p><h3 class="q-text">'+q.q+'</h3>'+
     opts.map(function(o,n){return '<button class="q-opt" data-n="'+n+'">'+o+'</button>';}).join('');
   qb.querySelectorAll('.q-opt').forEach(function(b){b.addEventListener('click',function(){
     var correct=+q.correct;if(+b.dataset.n===correct){b.classList.add('right');}else{b.classList.add('wrong');
      var cb=qb.querySelector('.q-opt[data-n="'+correct+'"]');if(cb)cb.classList.add('right');}
     setTimeout(function(){qi++;render();},900);});});}
  render();}

 // music
 var bgm=document.getElementById('bgm'),mbtn=document.getElementById('music');
 if(mbtn)mbtn.addEventListener('click',function(){if(bgm.paused){bgm.play();mbtn.textContent='🔊';}else{bgm.pause();mbtn.textContent='🎵';}});

 // confetti
 function celebrate(){var cv=document.getElementById('confetti');if(!cv)return;cv.style.display='block';
  var ctx=cv.getContext('2d');cv.width=innerWidth;cv.height=innerHeight;var ps=[];
  for(var k=0;k<140;k++)ps.push({x:Math.random()*cv.width,y:Math.random()*-cv.height,r:4+Math.random()*6,
    c:['#E62D87','#FFC93C','#6C5CE7','#00B894','#FF7675'][k%5],vy:2+Math.random()*3,vx:-1+Math.random()*2,a:Math.random()*6});
  var t=0;(function loop(){ctx.clearRect(0,0,cv.width,cv.height);ps.forEach(function(p){p.y+=p.vy;p.x+=p.vx;p.a+=.1;
    if(p.y>cv.height){p.y=-10;p.x=Math.random()*cv.width;}ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.a);
    ctx.fillStyle=p.c;ctx.fillRect(-p.r/2,-p.r/2,p.r,p.r);ctx.restore();});t++;if(t<600)requestAnimationFrame(loop);else cv.style.display='none';})();}
})();
`;
