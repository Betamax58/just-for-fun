(() => {
  'use strict';
  if (window.justForFun) { window.justForFun.destroy(); return; }
  const host = document.createElement('div');
  host.style.cssText = 'position:fixed;inset:0;z-index:2147483647;pointer-events:none';
  document.documentElement.append(host);
  const shadow = host.attachShadow({mode:'open'});
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'width:100%;height:100%;display:block';
  shadow.append(canvas);
  const ctx = canvas.getContext('2d');
  let mode = 'spider', fragments = [], restorations = [];
  const panel = document.createElement('div');
  panel.style.cssText='position:absolute;top:16px;right:16px;pointer-events:auto;background:#10232f;color:white;padding:12px;border-radius:14px;font:14px system-ui;box-shadow:0 6px 30px #0006';
  panel.innerHTML='<b>Just for Fun</b> <select aria-label="Effet"><option value="spider">Araignée</option><option value="ant">Fourmi</option><option value="butterfly">Papillon</option><option value="sniper">Sniper</option></select> <button aria-label="Fermer">✕</button><div style="margin-top:6px">P : pause · D : appuis · Échap : fermer</div>';
  shadow.append(panel);
  panel.querySelector('select').onchange=e=>{mode=e.target.value;canvas.style.cursor=mode==='sniper'?'crosshair':'default';};
  panel.querySelector('button').onclick=()=>destroy();
  function shoot(e) {
    if(mode!=='sniper'||paused||e.composedPath().includes(host))return;
    let range;
    if(document.caretRangeFromPoint)range=document.caretRangeFromPoint(e.clientX,e.clientY);
    else if(document.caretPositionFromPoint){const p=document.caretPositionFromPoint(e.clientX,e.clientY);if(p){range=document.createRange();range.setStart(p.offsetNode,p.offset);}}
    if(!range||range.startContainer.nodeType!==3)return;
    const node=range.startContainer,parent=node.parentElement;
    if(!parent||parent.closest('input,textarea,select,[contenteditable],script,style'))return;
    const text=node.textContent,pos=range.startOffset;let start=pos,end=pos;
    while(start>0&&!/\s/.test(text[start-1]))start--;
    while(end<text.length&&!/\s/.test(text[end]))end++;
    if(start===end)return;
    range.setStart(node,start);range.setEnd(node,end);
    const r=range.getBoundingClientRect();
    if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)return;
    e.preventDefault();e.stopPropagation();
    const word=text.slice(start,end),style=getComputedStyle(parent),span=document.createElement('span');
    span.style.cssText='visibility:hidden';range.surroundContents(span);restorations.push(span);
    for(let i=0;i<word.length;i++)fragments.push({text:word[i],x:r.left+(i+.5)*r.width/word.length,y:r.bottom-3,vx:(Math.random()-.5)*260,vy:-80-Math.random()*150,a:0,spin:(Math.random()-.5)*8,life:3,font:style.font,color:style.color});
    lastScan=0;
  }
  document.addEventListener('click',shoot,true);
  let width, height, anchors = [], lastScan = 0, frame, stopped = false, paused = false, debug = false;
  let mouse = {x:innerWidth/2,y:innerHeight/2}, body = {...mouse}, angle = -Math.PI/2, previous = 0;
  const legs = Array.from({length:8}, (_,i) => ({side:i<4?-1:1,index:i%4,foot:null,step:null}));
  const listeners = [];
  const on = (type, fn) => { window.addEventListener(type,fn); listeners.push([type,fn]); };
  function resize() { width=innerWidth; height=innerHeight; const d=Math.min(devicePixelRatio||1,2); canvas.width=width*d; canvas.height=height*d; ctx.setTransform(d,0,0,d,0,0); lastScan=0; }
  function scan() {
    anchors=[];
    const walker=document.createTreeWalker(document.body||document.documentElement,NodeFilter.SHOW_TEXT);
    let n, count=0;
    while ((n=walker.nextNode()) && count<4000) {
      if (!n.textContent.trim() || /^(SCRIPT|STYLE|NOSCRIPT|TEXTAREA)$/.test(n.parentElement?.tagName)) continue;
      count++;
      const el=n.parentElement, box=el.getBoundingClientRect();
      if(box.bottom<0||box.top>height||box.right<0||box.left>width) continue;
      const style=getComputedStyle(el);
      if(style.visibility==='hidden'||style.display==='none') continue;
      const range=document.createRange(); range.selectNodeContents(n);
      for(const r of range.getClientRects()) {
        if(r.bottom<0||r.top>height||r.width<2) continue;
        for(let x=Math.max(0,r.left);x<Math.min(width,r.right);x+=22) anchors.push({x,y:r.bottom-2});
      }
    }
    for(const el of document.querySelectorAll('a,button,img,input,h1,h2,h3')) {
      const r=el.getBoundingClientRect();
      if(r.width&&r.height&&r.bottom>0&&r.top<height) for(const x of [r.left,r.right]) for(const y of [r.top,r.bottom]) anchors.push({x,y});
    }
  }
  function local(x,y) {return {x:body.x+Math.cos(angle)*x-Math.sin(angle)*y,y:body.y+Math.sin(angle)*x+Math.cos(angle)*y};}
  function target(leg) {
    const ideal=local(48-leg.index*29,leg.side*(64+Math.sin(leg.index*Math.PI/3)*18));
    let best=ideal, score=42*42;
    for(const a of anchors) { const d=(a.x-ideal.x)**2+(a.y-ideal.y)**2; if(d<score){score=d;best=a;} }
    return {x:Math.max(4,Math.min(width-4,best.x)),y:Math.max(4,Math.min(height-4,best.y))};
  }
  function tick(t) {
    if(stopped)return;
    const dt=Math.min((t-(previous||t))/1000,.05);previous=t;
    if(t-lastScan>700){scan();lastScan=t;}
    if(!paused) {
      const dx=mouse.x-body.x,dy=mouse.y-body.y,d=Math.hypot(dx,dy);
      if(d>8){const desired=Math.atan2(dy,dx);angle+=Math.atan2(Math.sin(desired-angle),Math.cos(desired-angle))*Math.min(1,dt*6); const move=Math.min(d-8,115*dt);body.x+=dx/d*move;body.y+=dy/d*move;}
      let moving=legs.filter(l=>l.step).length;
      for(const l of legs) {
        const goal=target(l);
        if(!l.foot)l.foot=goal;
        if(!l.step&&moving<3&&Math.hypot(goal.x-l.foot.x,goal.y-l.foot.y)>30){l.step={from:{...l.foot},to:goal,start:t};moving++;}
        if(l.step){const p=Math.min(1,(t-l.step.start)/190),s=p*p*(3-2*p);l.foot={x:l.step.from.x+(l.step.to.x-l.step.from.x)*s,y:l.step.from.y+(l.step.to.y-l.step.from.y)*s-Math.sin(p*Math.PI)*12};if(p===1)l.step=null;}
      }
    }
    ctx.clearRect(0,0,width,height);
    if(debug){ctx.fillStyle='#ff3fe4';for(const a of anchors){ctx.beginPath();ctx.arc(a.x,a.y,2,0,7);ctx.fill();}}
    if(mode==='spider'||mode==='ant') for(const l of legs){if(mode==='ant'&&l.index===3)continue;if(!l.foot)continue;const hip=local(16-l.index*10,l.side*8), knee=local(44-l.index*23,l.side*40);ctx.beginPath();ctx.moveTo(hip.x,hip.y);ctx.lineTo(knee.x,knee.y);ctx.lineTo(l.foot.x,l.foot.y);ctx.strokeStyle='#08131d';ctx.lineWidth=5;ctx.lineCap='round';ctx.stroke();ctx.strokeStyle='#6ee7e0';ctx.lineWidth=2;ctx.stroke();ctx.fillStyle='#ff65cb';ctx.beginPath();ctx.arc(l.foot.x,l.foot.y,3,0,7);ctx.fill();}
    if(mode==='spider'||mode==='ant'){ctx.save();ctx.translate(body.x,body.y);ctx.rotate(angle);ctx.fillStyle='#0e2732';ctx.strokeStyle='#6ee7e0';ctx.lineWidth=2;
    ctx.beginPath();ctx.ellipse(-12,0,19,13,0,0,7);ctx.fill();ctx.stroke();ctx.beginPath();ctx.ellipse(8,0,12,10,0,0,7);ctx.fill();ctx.stroke();ctx.fillStyle='#fff';for(const y of [-4,4]){ctx.beginPath();ctx.arc(14,y,2.5,0,7);ctx.fill();}ctx.restore();}
    if(mode==='butterfly'){ctx.save();ctx.translate(body.x,body.y);ctx.rotate(angle);const flap=.35+.65*Math.abs(Math.sin(t/110));for(const side of [-1,1]){ctx.fillStyle=side<0?'#c084fc':'#f472b6';ctx.beginPath();ctx.ellipse(-3,side*22*flap,24,20*flap,side*.4,0,7);ctx.fill();}ctx.fillStyle='#152533';ctx.fillRect(-15,-3,30,6);ctx.restore();}
    if(mode==='sniper'){ctx.strokeStyle='#ff5454';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(mouse.x,mouse.y,19,0,7);ctx.moveTo(mouse.x-30,mouse.y);ctx.lineTo(mouse.x+30,mouse.y);ctx.moveTo(mouse.x,mouse.y-30);ctx.lineTo(mouse.x,mouse.y+30);ctx.stroke();}
    for(const f of fragments){if(!paused){f.life-=dt;f.x+=f.vx*dt;f.y+=f.vy*dt;f.vy+=420*dt;f.a+=f.spin*dt;}ctx.save();ctx.globalAlpha=Math.min(1,Math.max(0,f.life));ctx.translate(f.x,f.y);ctx.rotate(f.a);ctx.font=f.font;ctx.fillStyle=f.color;ctx.fillText(f.text,0,0);ctx.restore();}fragments=fragments.filter(f=>f.life>0);
    frame=requestAnimationFrame(tick);
  }
  function destroy(){stopped=true;cancelAnimationFrame(frame);for(const [type,fn] of listeners)window.removeEventListener(type,fn);document.removeEventListener('click',shoot,true);for(const span of restorations){if(span.isConnected)span.replaceWith(...span.childNodes);}host.remove();delete window.justForFun;}
  on('pointermove',e=>{mouse={x:e.clientX,y:e.clientY};});
  on('pointerdown',e=>{mouse={x:e.clientX,y:e.clientY};});
  on('resize',resize);on('scroll',()=>{lastScan=0;});
  on('keydown',e=>{if(e.target instanceof Element&&e.target.closest('input,textarea,select,[contenteditable]'))return;if(e.key==='Escape')destroy();if(e.key.toLowerCase()==='p')paused=!paused;if(e.key.toLowerCase()==='d')debug=!debug;});
  window.justForFun={destroy,pause:()=>{paused=!paused;},debug:()=>{debug=!debug;}};
  resize();frame=requestAnimationFrame(tick);
})();
