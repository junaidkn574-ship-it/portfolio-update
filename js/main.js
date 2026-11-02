/* Ahmed Portfolio — shared behaviour */
document.documentElement.classList.add('js');
document.addEventListener('DOMContentLoaded',()=>{
  /* page-load sequence */
  requestAnimationFrame(()=>document.body.classList.add('loaded'));

  /* nav: solid on scroll + mobile menu */
  const nav=document.querySelector('.nav'),burger=document.querySelector('.burger'),menu=document.querySelector('.menu');
  const onScroll=()=>nav.classList.toggle('scrolled',window.scrollY>30);
  onScroll();window.addEventListener('scroll',onScroll,{passive:true});
  burger.addEventListener('click',()=>{
    const open=menu.classList.toggle('open');
    burger.setAttribute('aria-expanded',open);
  });
  menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{menu.classList.remove('open');burger.setAttribute('aria-expanded','false')}));

  /* scroll reveals — items inside a .stagger group appear one after another */
  document.querySelectorAll('.stagger').forEach(g=>{
    g.querySelectorAll(':scope > .reveal').forEach((el,i)=>el.style.setProperty('--d',(i*0.12)+'s'));
  });
  const io=new IntersectionObserver((entries)=>{
    entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}});
  },{threshold:.15,rootMargin:'0px 0px -6% 0px'});
  document.querySelectorAll('.reveal').forEach(el=>io.observe(el));

  /* animated counters */
  const count=el=>{
    const target=parseFloat(el.dataset.target),dec=+el.dataset.decimals||0,suffix=el.dataset.suffix||'',dur=2000,t0=performance.now();
    const step=t=>{
      const p=Math.min((t-t0)/dur,1),eased=1-Math.pow(1-p,4);
      el.textContent=(target*eased).toFixed(dec)+suffix;
      if(p<1)requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const cio=new IntersectionObserver((entries)=>{
    entries.forEach(e=>{if(e.isIntersecting){count(e.target);cio.unobserve(e.target)}});
  },{threshold:.6});
  document.querySelectorAll('[data-target]').forEach(el=>cio.observe(el));

  /* testimonials slider */
  const track=document.querySelector('.t-track');
  if(track){
    const cards=track.children.length,dotsBox=document.querySelector('.dots');
    let i=0,timer;
    for(let n=0;n<cards;n++){
      const d=document.createElement('button');d.className='dot';d.setAttribute('aria-label','Show testimonial '+(n+1));
      d.addEventListener('click',()=>{go(n);restart()});dotsBox.appendChild(d);
    }
    const dots=[...dotsBox.children];
    function go(n){i=(n+cards)%cards;track.style.transform='translateX(-'+i*100+'%)';dots.forEach((d,k)=>d.classList.toggle('on',k===i))}
    function restart(){clearInterval(timer);timer=setInterval(()=>go(i+1),6000)}
    document.querySelector('.t-prev').addEventListener('click',()=>{go(i-1);restart()});
    document.querySelector('.t-next').addEventListener('click',()=>{go(i+1);restart()});
    go(0);restart();
  }

  /* brand marquee: duplicate the row so the loop is seamless */
  const mt=document.querySelector('.m-track');
  if(mt)mt.innerHTML+=mt.innerHTML;

  const y=document.getElementById('year');if(y)y.textContent=new Date().getFullYear();
});
