const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const outputDir = path.resolve(__dirname, "..", "demo");
const slidesDir = path.join(outputDir, "announcement-slides");
const slideListFile = path.join(outputDir, "announcement-slides.txt");

const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    html,body{margin:0;background:#05070d}
    canvas{display:block}
  </style>
</head>
<body>
<canvas id="c" width="1280" height="720"></canvas>
<script>
const canvas = document.getElementById("c");
const ctx = canvas.getContext("2d");
const W = canvas.width;
const H = canvas.height;
const duration = 85000;
const scenes = [
  {
    title: "Assalaamu Alaikum",
    subtitle: "Dear members, this is a short demo of the upcoming draw.",
    bullets: ["Seettu Kulukkal App", "Computerized draw method"],
    mode: "welcome"
  },
  {
    title: "Why digital this time?",
    subtitle: "The usual paper chit method takes more time.",
    bullets: ["No folding or mixing chits", "No manual picking", "Faster and clearer process"],
    mode: "paper"
  },
  {
    title: "Computerized draw",
    subtitle: "This time, the draw will be done using the app.",
    bullets: ["Member list is visible", "Rules are shown before the draw", "The app selects automatically"],
    mode: "setup"
  },
  {
    title: "Transparency",
    subtitle: "The draw is conducted by the system, not by hand.",
    bullets: ["No one chooses the winner manually", "Winner is recorded immediately", "Draw history remains visible"],
    mode: "wheel"
  },
  {
    title: "Live online meeting",
    subtitle: "The draw will also be shared live through an online meeting.",
    bullets: ["Members can attend physically", "Members away from the venue can join online", "Everyone can watch the same draw"],
    mode: "meeting"
  },
  {
    title: "Member feedback",
    subtitle: "We hope this digital method is acceptable to all, Insha Allah.",
    bullets: ["Any member with an objection", "Please get in touch with us", "Before the draw is conducted"],
    mode: "feedback"
  },
  {
    title: "Final result",
    subtitle: "The result can be saved and shared with all members.",
    bullets: ["PDF", "Image", "CSV"],
    mode: "result"
  },
  {
    title: "Jazaakallaah Khair",
    subtitle: "Thank you to all members for your cooperation.",
    bullets: ["May Allah put barakah in this effort", "We look forward to your support"],
    mode: "thanks"
  }
];

function ease(x){return x<.5?2*x*x:1-Math.pow(-2*x+2,2)/2}
function rr(x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.quadraticCurveTo(x+w,y,x+w,y+r);ctx.lineTo(x+w,y+h-r);ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);ctx.lineTo(x+r,y+h);ctx.quadraticCurveTo(x,y+h,x,y+h-r);ctx.lineTo(x,y+r);ctx.quadraticCurveTo(x,y,x+r,y);ctx.closePath()}
function fillRound(x,y,w,h,r,fill,shadow=false){ctx.save();if(shadow){ctx.shadowColor="#0008";ctx.shadowBlur=28;ctx.shadowOffsetY=16}rr(x,y,w,h,r);ctx.fillStyle=fill;ctx.fill();ctx.restore()}
function text(value,x,y,size,color="#101828",weight=800,align="left"){ctx.fillStyle=color;ctx.font=weight+" "+size+"px Calibri, Arial";ctx.textAlign=align;ctx.textBaseline="alphabetic";ctx.fillText(value,x,y)}
function wrap(value,x,y,maxWidth,size,color="#344054",weight=700,lineHeight=1.24,maxLines=3){ctx.fillStyle=color;ctx.font=weight+" "+size+"px Calibri, Arial";ctx.textAlign="left";const words=String(value).split(" ");const lines=[];let current="";for(const word of words){const next=current?current+" "+word:word;if(ctx.measureText(next).width<=maxWidth)current=next;else{if(current)lines.push(current);current=word}}if(current)lines.push(current);lines.slice(0,maxLines).forEach((line,i)=>ctx.fillText(line,x,y+i*size*lineHeight))}
function badge(value,x,y,w,color="#0a84ff"){fillRound(x,y,w,44,22,color);text(value,x+w/2,y+29,18,"#fff",900,"center")}
function drawWheel(cx,cy,r,spin){ctx.save();ctx.translate(cx,cy);ctx.rotate(spin*10);const colors=["#0a84ff","#16a765","#f4c95d","#e03a4e","#8b5cf6","#06b6d4"];for(let i=0;i<16;i++){ctx.beginPath();ctx.moveTo(0,0);ctx.arc(0,0,r,i*Math.PI/8,(i+1)*Math.PI/8);ctx.closePath();ctx.fillStyle=colors[i%colors.length];ctx.fill()}ctx.restore();ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.lineWidth=14;ctx.strokeStyle="#ffffff";ctx.stroke();ctx.beginPath();ctx.arc(cx,cy,54,0,Math.PI*2);ctx.fillStyle="#ffffff";ctx.fill();text("AUTO",cx,cy-3,19,"#073b8e",1000,"center");text("DRAW",cx,cy+22,19,"#073b8e",1000,"center");ctx.beginPath();ctx.moveTo(cx+r+28,cy);ctx.lineTo(cx+r-20,cy-25);ctx.lineTo(cx+r-20,cy+25);ctx.closePath();ctx.fillStyle="#f4c95d";ctx.fill()}
function drawIcon(mode,t){const cx=930, cy=376;if(mode==="welcome"){fillRound(776,238,308,230,28,"#eef7ff");text("Seettu",930,326,46,"#073b8e",1000,"center");text("Kulukkal",930,383,46,"#067647",1000,"center");text("App",930,438,38,"#101828",1000,"center");return}if(mode==="paper"){for(let i=0;i<5;i++){ctx.save();ctx.translate(820+i*48,315+i%2*34);ctx.rotate((-10+i*5)*Math.PI/180);fillRound(0,0,94,122,12,"#ffffff",true);ctx.fillStyle="#d8e1ee";for(let y=26;y<100;y+=22)ctx.fillRect(16,y,60,6);ctx.restore()}badge("Paper chits take time",790,520,280,"#e03a4e");return}if(mode==="wheel"||mode==="setup"){drawWheel(cx,cy,150,t);badge(mode==="setup"?"Setup is visible":"System selects",830,552,200,mode==="setup"?"#073b8e":"#067647");return}if(mode==="meeting"){fillRound(760,232,340,230,26,"#ffffff",true);fillRound(790,262,128,84,18,"#eef7ff");fillRound(942,262,128,84,18,"#eef7ff");fillRound(790,368,128,84,18,"#eef7ff");fillRound(942,368,128,84,18,"#eef7ff");["Venue","Online","Family","Live"].forEach((v,i)=>text(v,i%2?1006:854,i<2?313:419,23,"#073b8e",1000,"center"));badge("Live meeting",840,510,180,"#067647");return}if(mode==="feedback"){fillRound(800,246,260,210,28,"#ffffff",true);text("Any objection?",930,326,34,"#073b8e",1000,"center");text("Please contact us",930,390,29,"#344054",900,"center");badge("Before the draw",840,510,180,"#e03a4e");return}if(mode==="result"){["PDF","Image","CSV"].forEach((v,i)=>{fillRound(780+i*112,294,92,92,18,i===0?"#0a84ff":"#ffffff",true);text(v,826+i*112,350,24,i===0?"#fff":"#073b8e",1000,"center")});badge("Share result",836,478,188,"#067647");return}fillRound(785,270,290,180,30,"#ffffff",true);text("Jazaakallaah",930,348,38,"#073b8e",1000,"center");text("Khair",930,405,38,"#067647",1000,"center")}
function drawScene(scene,progress,t){const bg=ctx.createLinearGradient(0,0,W,H);bg.addColorStop(0,"#05070d");bg.addColorStop(.5,"#123b8e");bg.addColorStop(1,"#07111f");ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);text("Seettu Kulukkal App",56,70,34,"#ffffff",1000);fillRound(60,104,1160,548,34,"#f8fbfff4",true);fillRound(96,144,600,428,28,"#ffffff");fillRound(730,144,438,428,28,"#eef7ff");wrap(scene.title,126,216,520,48,"#073b8e",1000,1.05,2);wrap(scene.subtitle,128,302,500,25,"#344054",800,1.25,3);scene.bullets.forEach((b,i)=>{const y=400+i*58;ctx.beginPath();ctx.arc(145,y-7,8,0,Math.PI*2);ctx.fillStyle=i===0?"#0a84ff":i===1?"#067647":"#f4c95d";ctx.fill();wrap(b,170,y,470,24,"#101828",900,1.15,1)});drawIcon(scene.mode,t);fillRound(112,626,1056,26,13,"#d8e1ee");fillRound(112,626,1056*progress,26,13,"#0a84ff")}
function draw(ms){const sceneLength=duration/scenes.length;const index=Math.min(scenes.length-1,Math.floor(ms/sceneLength));const local=(ms-index*sceneLength)/sceneLength;drawScene(scenes[index],(index+ease(local))/scenes.length,ms/1000)}
window.renderDemoPreview = ms => { draw(ms); return canvas.toDataURL("image/png") };
</script>
</body>
</html>`;

(async () => {
  fs.mkdirSync(outputDir, { recursive: true });
  fs.rmSync(slidesDir, { recursive: true, force: true });
  fs.mkdirSync(slidesDir, { recursive: true });
  const browser = await chromium.launch({
    headless: true,
    executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
    args: ["--autoplay-policy=no-user-gesture-required"]
  });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
  await page.setContent(html, { waitUntil: "domcontentloaded" });
  const slideDuration = 9.875;
  const list = [];
  for (let i = 0; i < 8; i++) {
    const ms = (i + 0.5) * duration / 8;
    const dataUrl = await page.evaluate(time => window.renderDemoPreview(time), ms);
    const file = path.join(slidesDir, `slide-${String(i + 1).padStart(2, "0")}.png`);
    fs.writeFileSync(file, Buffer.from(dataUrl.split(",")[1], "base64"));
    list.push(`file '${file.replace(/\\/g, "/")}'`);
    list.push(`duration ${slideDuration}`);
  }
  const finalSlide = path.join(slidesDir, "slide-08.png").replace(/\\/g, "/");
  list.push(`file '${finalSlide}'`);
  fs.writeFileSync(slideListFile, list.join("\n"));
  fs.copyFileSync(path.join(slidesDir, "slide-03.png"), path.join(outputDir, "seettu-kulukkal-draw-announcement-preview.png"));
  await browser.close();
  console.log(slideListFile);
})();
