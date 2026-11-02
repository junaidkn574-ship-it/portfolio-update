/* Portfolio page: filter tabs (with reorder animation), staggered reveal, lightbox */
document.addEventListener('DOMContentLoaded',()=>{
  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const grid=document.getElementById('pgrid'),cards=[...grid.querySelectorAll('.pcard')];
  const tabs=[...document.querySelectorAll('.tab')],pill=document.querySelector('.tab-pill');

  /* sliding highlight behind the active tab */
  function movePill(){
    const t=tabs.find(x=>x.getAttribute('aria-selected')==='true');
    pill.style.width=t.offsetWidth+'px';pill.style.transform='translateX('+t.offsetLeft+'px)';
  }
  window.addEventListener('resize',movePill);
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(movePill);
  movePill();

  /* staggered scroll reveal for cards; after revealing they switch to quick hover transitions */
  cards.forEach((c,i)=>c.style.setProperty('--d',((i%3)*0.12)+'s'));
  const rio=new IntersectionObserver(es=>es.forEach(e=>{
    if(e.isIntersecting){const c=e.target;c.classList.add('in');rio.unobserve(c);setTimeout(()=>c.classList.add('settled'),1300)}
  }),{threshold:.12,rootMargin:'0px 0px -5% 0px'});
  cards.forEach(c=>rio.observe(c));

  /* filtering: fade out, then glide remaining cards into place (FLIP) and fade new ones in */
  let current='all',busy=false;
  function visibleCards(){return cards.filter(c=>!c.hidden)}
  function filter(cat){
    if(cat===current||busy)return;
    current=cat;busy=true;
    tabs.forEach(t=>t.setAttribute('aria-selected',t.dataset.filter===cat));movePill();
    const before=new Map(visibleCards().map(c=>[c,c.getBoundingClientRect()]));
    const leaving=cards.filter(c=>!c.hidden&&cat!=='all'&&c.dataset.cat!==cat);
    const apply=()=>{
      cards.forEach(c=>{c.hidden=!(cat==='all'||c.dataset.cat===cat)});
      cards.forEach(c=>{if(!c.hidden){c.classList.add('in','settled');rio.unobserve(c)}});
      if(!reduce){
        let n=0;
        visibleCards().forEach(c=>{
          const a=before.get(c),b=c.getBoundingClientRect();
          if(a){
            const dx=a.left-b.left,dy=a.top-b.top;
            if(dx||dy)c.animate([{transform:`translate(${dx}px,${dy}px)`},{transform:'none'}],{duration:650,easing:'cubic-bezier(.22,.8,.24,1)'});
          }else{
            c.animate([{opacity:0,transform:'translateY(26px) scale(.97)'},{opacity:1,transform:'none'}],{duration:700,delay:n*90,easing:'cubic-bezier(.22,.8,.24,1)',fill:'backwards'});n++;
          }
        });
      }
      setTimeout(()=>{busy=false},reduce?0:700);
    };
    if(reduce||!leaving.length){apply();return}
    leaving.forEach(c=>c.animate([{opacity:1,transform:'none'},{opacity:0,transform:'scale(.95)'}],{duration:260,easing:'ease-out',fill:'forwards'}));
    setTimeout(()=>{leaving.forEach(c=>c.getAnimations().forEach(a=>a.cancel()));apply()},270);
  }
  tabs.forEach(t=>t.addEventListener('click',()=>filter(t.dataset.filter)));

  /* lightbox */
  const lb=document.getElementById('lb'),lbImg=lb.querySelector('.lb-img'),
        lbCat=lb.querySelector('.cat'),lbTitle=lb.querySelector('h3'),lbDesc=lb.querySelector('.lb-desc'),lbDo=lb.querySelector('.lb-do'),lbCount=lb.querySelector('.lb-count');
  let idx=0,opener=null;
  function fill(c){
    lbImg.style.setProperty('--a',c.dataset.a);lbImg.style.setProperty('--b',c.dataset.b);
    lbCat.textContent=c.dataset.catname;lbTitle.textContent=c.dataset.title;
    lbDesc.textContent=c.dataset.long;lbDo.textContent='What I did: '+c.dataset.do;
    const list=visibleCards();lbCount.textContent=(list.indexOf(c)+1)+' of '+list.length;
  }
  function open(c){
    opener=c;idx=visibleCards().indexOf(c);fill(c);
    lb.classList.add('open');lb.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';
    lb.querySelector('.lb-close').focus();
  }
  function close(){
    lb.classList.remove('open');lb.setAttribute('aria-hidden','true');document.body.style.overflow='';
    if(opener)opener.focus();
  }
  function step(d){const list=visibleCards();idx=(idx+d+list.length)%list.length;opener=list[idx];fill(opener)}
  cards.forEach(c=>c.addEventListener('click',()=>open(c)));
  lb.addEventListener('click',e=>{if(e.target===lb)close()});
  lb.querySelector('.lb-close').addEventListener('click',close);
  lb.querySelector('.lb-prev').addEventListener('click',()=>step(-1));
  lb.querySelector('.lb-next').addEventListener('click',()=>step(1));
  document.addEventListener('keydown',e=>{
    if(!lb.classList.contains('open'))return;
    if(e.key==='Escape')close();
    else if(e.key==='ArrowLeft')step(-1);
    else if(e.key==='ArrowRight')step(1);
    else if(e.key==='Tab'){ /* keep focus inside the lightbox */
      const f=[...lb.querySelectorAll('button')];const first=f[0],last=f[f.length-1];
      if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}
      else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
    }
  });
});
