
function playSID(sidurl,subtune) { 
 if (typeof SIDplayer === 'undefined') SIDplayer = new jsSID(16384,0.0005); 
 SIDplayer.loadstart(sidurl,subtune);
}

function jsSID (bufln, bgnoi)
{
 this.author='Hermit'; this.sourcecode='http://hermit.sidrip.com'; this.version='0.9'; this.year='2016';
 
 if ( typeof AudioContext !== 'undefined') { var aCtx = new AudioContext(); }
 else { var aCtx = new webkitAudioContext(); }
 var smpr = aCtx.sampleRate; 
 if (typeof aCtx.createJavaScriptNode === 'function') 
 { var scrNod = aCtx.createJavaScriptNode(bufln,0,1); }
 else { var scrNod = aCtx.createScriptProcessor(bufln,0,1); }
 
 scrNod.onaudioprocess = function(e) { 
  var oBuf = e.outputBuffer; var oDat = oBuf.getChannelData(0); 
  for (var sample = 0; sample < oBuf.length; sample++) { oDat[sample]=play(); } 
 }
 
 
 this.loadstart = function(sidurl,subt) { this.loadinit(sidurl,subt); if (startcallback!==null) startcallback(); this.playcont(); this.playcont(); }
 this.loadinit = function(sidurl,subt) { ldd=0; this.pause(); initSID(); subtune=subt; 
  var req = new XMLHttpRequest(); req.open('GET',sidurl,true); req.responseType = 'arraybuffer';
  req.onload = function() { var fdat = new Uint8Array(req.response); 
   var i,strend, offs=fdat[7]; ldad=fdat[8]+fdat[9]? fdat[8]*256+fdat[9] : fdat[offs]+fdat[offs+1]*256;
   for (i=0; i<32; i++) tmod[31-i] = fdat[0x12+(i>>3)] & Math.pow(2,7-i%8); for(i=0;i<M.length;i++) M[i]=0;
   for (i=offs+2; i<fdat.byteLength; i++) { if (ldad+i-(offs+2)<M.length) M[ldad+i-(offs+2)]=fdat[i]; } 
   strend=1; for(i=0; i<32; i++) { if(strend!=0) strend=tit[i]=fdat[0x16+i]; else strend=tit[i]=0; } 
   strend=1; for(i=0; i<32; i++) { if(strend!=0) strend=auth[i]=fdat[0x36+i]; else strend=auth[i]=0; } 
   strend=1; for(i=0; i<32; i++) { if(strend!=0) strend=inf[i]=fdat[0x56+i]; else strend=inf[i]=0; } 
   ina=fdat[0xA]+fdat[0xB]? fdat[0xA]*256+fdat[0xB] : ldad; pla=plf=fdat[0xC]*256+fdat[0xD]; 
   subtune_amount=fdat[0xF]; prSIDm = ((fdat[0x77]&0x30)>=0x20)? 8580 : 6581; 
   ldd=1;  if (loadcallback!==null) loadcallback();  init(subtune); };   
  req.send(null); 
 } 
 this.start = function(subt) { init(subt); if (startcallback!==null) startcallback(); this.playcont(); }
 this.playcont = function() { scrNod.connect(aCtx.destination); }
 this.pause = function() { scrNod.disconnect(aCtx.destination); }
 this.stop = function() { this.pause(); init(subtune); }
 this.gettitle = function() { return String.fromCharCode.apply(null,tit); }
 this.getauthor = function() { return String.fromCharCode.apply(null,auth); }
 this.getinfo = function() { return String.fromCharCode.apply(null,inf); }
 this.getsubtunes = function () { return subtune_amount; }
 this.getprefmodel = function() { return prSIDm; }
 this.getmodel = function() { return SIDm; }
 this.getoutput = function() { return (output/SCALE)*(M[0xD418]&0xF); }
 this.getplaytime = function() { return parseInt(playtime); } 
 this.setmodel = function(model) { SIDm = model; }
 this.setvolume = function(vol) { volume = vol; }
 this.setloadcallback = function(fname) { loadcallback=fname; }
 this.setstartcallback = function(fname) { startcallback=fname; }
 this.setendcallback = function(fname,seconds) { endcallback=fname; playlength=seconds; }
 
 var 
 CLK = 985248, 
 FR = 50, 
 CHA = 3,
 SCALE = 0x10000 * CHA * 16;
 
 var tit = new Uint8Array(0x20); var auth = new Uint8Array(0x20); var inf = new Uint8Array(0x20); var tmod = new Uint8Array(0x20);
 var ldad=0x1000, ina=0x1000, plf=0x1003, pla=0x1003, subtune = 0, subtune_amount=1, playlength=0; 
 var prSIDm=8580; var SIDm=8580.0; 
 var M = new Uint8Array(65536); 
 var ldd=0, ind=0, fin=0, loadcallback=null, startcallback=null; endcallback=null, playtime=0, ended=0;
 var ckr = CLK/smpr;
 var fspd = smpr/FR; 
 var fcnt=1, volume=1.0, CPUtime=0, pPC;
 
 function init(subt) { 
  if (ldd) { ind=0; subtune = subt; initCPU(ina); initSID(); A=subtune; M[1]=0x37; M[0xDC05]=0;
   for(var tout=100000;tout>=0;tout--) { if (CPU()) break; } 
   if (tmod[subtune] || M[0xDC05]) { 
    if (!M[0xDC05]) {M[0xDC04]=0x24; M[0xDC05]=0x40;} fspd = (M[0xDC04]+M[0xDC05]*256)/ckr; }
   else fspd = smpr/FR; 
   if(plf==0) pla = ((M[1]&3)<2)? M[0xFFFE]+M[0xFFFF]*256 : M[0x314]+M[0x315]*256; 
   else { pla=plf; if (pla>=0xE000 && M[1]==0x37) M[1]=0x35; } 
   initCPU(pla); fcnt=1; fin=0; CPUtime=0; playtime=0; ended=0; ind=1;  }
 }
 
 function play() { 
  if (ldd && ind) { fcnt--; playtime+=1/smpr;
   if (fcnt<=0) { fcnt=fspd; fin=0; PC=pla; SP=0xFF; }
   if (fin==0) {
    while(CPUtime<=ckr) { pPC=PC;
     if (CPU()>=0xFE) { fin=1; break; }  else CPUtime+=cyc;
     if ( (M[1]&3)>1 && pPC<0xE000 && (PC==0xEA31 || PC==0xEA81)) { fin=1; break; } 
     if ( (addr==0xDC05 || addr==0xDC04) && (M[1]&3) && tmod[subtune] ) fspd = (M[0xDC04] + M[0xDC05]*256) / ckr; 
     if(sta>=0xD420 && sta<0xD800 && (M[1]&3)) M[sta&0xD41F]=M[sta]; 
     if(addr==0xD404 && !(M[0xD404]&1)) Ast[0]&=0x3E; if(addr==0xD40B && !(M[0xD40B]&1)) Ast[1]&=0x3E; if(addr==0xD412 && !(M[0xD412]&1)) Ast[2]&=0x3E; 
    }  CPUtime-=ckr;
  }} 
  if (playlength>0 && parseInt(playtime)==parseInt(playlength) && endcallback!==null && ended==0) {ended=1; endcallback();}
  return SID(); 
 }
 
 
 var 
 flagsw=[0x01,0x21,0x04,0x24,0x00,0x40,0x08,0x28], brf=[0x80,0x40,0x01,0x02];
 var PC=0, A=0, T=0, X=0, Y=0, SP=0xFF, IR=0, addr=0, ST=0x00, cyc=0, sta=0; 
 function initCPU (mempos) { PC=mempos; A=0; X=0; Y=0; ST=0; SP=0xFF; } 
 
 function CPU () 
 {
  IR=M[PC]; cyc=2; sta=0; 
  if(IR&1) {  
   switch (IR&0x1F) { 
    case 1: case 3: addr = M[M[++PC]+X] + M[M[PC]+X+1]*256; cyc=6; break; 
    case 0x11: case 0x13: addr = M[M[++PC]] + M[M[PC]+1]*256 + Y; cyc=6; break; 
    case 0x19: case 0x1F: addr = M[++PC] + M[++PC]*256 + Y; cyc=5; break; 
    case 0x1D: addr = M[++PC] + M[++PC]*256 + X; cyc=5; break; 
    case 0xD: case 0xF: addr = M[++PC] + M[++PC]*256; cyc=4; break; 
    case 0x15: addr = M[++PC] + X; cyc=4; break; 
    case 5: case 7: addr = M[++PC]; cyc=3; break; 
    case 0x17: addr = M[++PC] + Y; cyc=4; break; 
    case 9: case 0xB: addr = ++PC; cyc=2;  }  addr&=0xFFFF;  
   switch (IR&0xE0) {
    case 0x60: T=A; A+=M[addr]+(ST&1); ST&=20; ST|=(A&128)|(A>255); A&=0xFF; ST|=(!A)<<1 | (!((T^M[addr])&0x80) && ((T^A)&0x80))>>1; break; 
    case 0xE0: T=A; A-=M[addr]+!(ST&1); ST&=20; ST|=(A&128)|(A>=0); A&=0xFF; ST|=(!A)<<1 | (((T^M[addr])&0x80) && ((T^A)&0x80))>>1; break; 
    case 0xC0: T=A-M[addr]; ST&=124;ST|=(!(T&0xFF))<<1|(T&128)|(T>=0); break; 
    case 0x00: A|=M[addr]; ST&=125;ST|=(!A)<<1|(A&128); break; 
    case 0x20: A&=M[addr]; ST&=125;ST|=(!A)<<1|(A&128); break; 
    case 0x40: A^=M[addr]; ST&=125;ST|=(!A)<<1|(A&128); break; 
    case 0xA0: A=M[addr]; ST&=125;ST|=(!A)<<1|(A&128); if((IR&3)==3) X=A; break; 
    case 0x80: M[addr]=A & (((IR&3)==3)?X:0xFF); sta=addr;  } }  
  else if(IR&2) {  
   switch (IR&0x1F) { 
    case 0x1E: addr = M[++PC] + M[++PC]*256 + ( ((IR&0xC0)!=0x80) ? X:Y ); cyc=5; break; 
    case 0xE: addr = M[++PC] + M[++PC]*256; cyc=4; break; 
    case 0x16: addr = M[++PC] + ( ((IR&0xC0)!=0x80) ? X:Y ); cyc=4; break; 
    case 6: addr = M[++PC]; cyc=3; break; 
    case 2: addr = ++PC; cyc=2;  }  addr&=0xFFFF;  
   switch (IR&0xE0) {
    case 0x00: ST&=0xFE; case 0x20: if((IR&0xF)==0xA) { A=(A<<1)+(ST&1); ST&=60;ST|=(A&128)|(A>255); A&=0xFF; ST|=(!A)<<1; } 
      else { T=(M[addr]<<1)+(ST&1); ST&=60;ST|=(T&128)|(T>255); T&=0xFF; ST|=(!T)<<1; M[addr]=T; cyc+=2; }  break; 
    case 0x40: ST&=0xFE; case 0x60: if((IR&0xF)==0xA) { T=A; A=(A>>1)+(ST&1)*128; ST&=60;ST|=(A&128)|(T&1); A&=0xFF; ST|=(!A)<<1; } 
      else { T=(M[addr]>>1)+(ST&1)*128; ST&=60;ST|=(T&128)|(M[addr]&1); T&=0xFF; ST|=(!T)<<1; M[addr]=T; cyc+=2; }  break; 
    case 0xC0: if(IR&4) { M[addr]--; M[addr]&=0xFF; ST&=125;ST|=(!M[addr])<<1|(M[addr]&128); cyc+=2; } 
      else {X--; X&=0xFF; ST&=125;ST|=(!X)<<1|(X&128);}  break; 
    case 0xA0: if((IR&0xF)!=0xA) X=M[addr];  else if(IR&0x10) {X=SP;break;}  else X=A;  ST&=125;ST|=(!X)<<1|(X&128);  break; 
    case 0x80: if(IR&4) {M[addr]=X;sta=addr;}  else if(IR&0x10) SP=X;  else {A=X; ST&=125;ST|=(!A)<<1|(A&128);}  break; 
    case 0xE0: if(IR&4) { M[addr]++; M[addr]&=0xFF; ST&=125;ST|=(!M[addr])<<1|(M[addr]&128); cyc+=2; }  } } 
  else if((IR&0xC)==8) {  
   switch (IR&0xF0) {
    case 0x60: SP++; SP&=0xFF; A=M[0x100+SP]; ST&=125;ST|=(!A)<<1|(A&128); cyc=4; break; 
    case 0xC0: Y++; Y&=0xFF; ST&=125;ST|=(!Y)<<1|(Y&128); break; 
    case 0xE0: X++; X&=0xFF; ST&=125;ST|=(!X)<<1|(X&128); break; 
    case 0x80: Y--; Y&=0xFF; ST&=125;ST|=(!Y)<<1|(Y&128); break; 
    case 0x00: M[0x100+SP]=ST; SP--; SP&=0xFF; cyc=3; break; 
    case 0x20: SP++; SP&=0xFF; ST=M[0x100+SP]; cyc=4; break; 
    case 0x40: M[0x100+SP]=A; SP--; SP&=0xFF; cyc=3; break; 
    case 0x90: A=Y; ST&=125;ST|=(!A)<<1|(A&128); break; 
    case 0xA0: Y=A; ST&=125;ST|=(!Y)<<1|(Y&128); break; 
    default: if(flagsw[IR>>5]&0x20) ST|=(flagsw[IR>>5]&0xDF); else ST&=255-(flagsw[IR>>5]&0xDF);  } } 
  else {  
   if ((IR&0x1F)==0x10) { PC++; T=M[PC]; if(T&0x80) T-=0x100; 
    if(IR&0x20) {if (ST&brf[IR>>6]) {PC+=T;cyc=3;}} else {if (!(ST&brf[IR>>6])) {PC+=T;cyc=3;}}  } 
   else {  
    switch (IR&0x1F) { 
     case 0: addr = ++PC; cyc=2; break; 
     case 0x1C: addr = M[++PC] + M[++PC]*256 + X; cyc=5; break; 
     case 0xC: addr = M[++PC] + M[++PC]*256; cyc=4; break; 
     case 0x14: addr = M[++PC] + X; cyc=4; break; 
     case 4: addr = M[++PC]; cyc=3;  }  addr&=0xFFFF;  
    switch (IR&0xE0) {
     case 0x00: M[0x100+SP]=PC%256; SP--;SP&=0xFF; M[0x100+SP]=PC/256;  SP--;SP&=0xFF; M[0x100+SP]=ST; SP--;SP&=0xFF; 
       PC = M[0xFFFE]+M[0xFFFF]*256-1; cyc=7; break; 
     case 0x20: if(IR&0xF) { ST &= 0x3D; ST |= (M[addr]&0xC0) | ( !(A&M[addr]) )<<1; } 
      else { M[0x100+SP]=(PC+2)%256; SP--;SP&=0xFF; M[0x100+SP]=(PC+2)/256;  SP--;SP&=0xFF; PC=M[addr]+M[addr+1]*256-1; cyc=6; }  break; 
     case 0x40: if(IR&0xF) { PC = addr-1; cyc=3; } 
      else { if(SP>=0xFF) return 0xFE; SP++;SP&=0xFF; ST=M[0x100+SP]; SP++;SP&=0xFF; T=M[0x100+SP]; SP++;SP&=0xFF; PC=M[0x100+SP]+T*256-1; cyc=6; }  break; 
     case 0x60: if(IR&0xF) { PC = M[addr]+M[addr+1]*256-1; cyc=5; } 
      else { if(SP>=0xFF) return 0xFF; SP++;SP&=0xFF; T=M[0x100+SP]; SP++;SP&=0xFF; PC=M[0x100+SP]+T*256-1; cyc=6; }  break; 
     case 0xC0: T=Y-M[addr]; ST&=124;ST|=(!(T&0xFF))<<1|(T&128)|(T>=0); break; 
     case 0xE0: T=X-M[addr]; ST&=124;ST|=(!(T&0xFF))<<1|(T&128)|(T>=0); break; 
     case 0xA0: Y=M[addr]; ST&=125;ST|=(!Y)<<1|(Y&128); break; 
     case 0x80: M[addr]=Y; sta=addr;  }  }  }  
  PC++; PC&=0xFFFF; return 0; 
 } 
 
  
 var 
 GAT=0x01, SYN=0x02, RNG=0x04, TST=0x08, TRI=0x10, SAW=0x20, PUL=0x40, NOI=0x80,
 HZ=0x10, DECSUS=0x40, ATK=0x80, 
 FSW = [1,2,4], LP=0x10, BP=0x20, HP=0x40, OFF3=0x80;
 var Ast = [0,0,0], rcnt = [0,0,0], envcnt = [0,0,0], expcnt = [0,0,0], pSR = [0,0,0];
 var pacc = [0,0,0], pracc = [0,0,0], sMSBrise=0, sMSB=0; 
 var nLFSR = [0x7FFFF8,0x7FFFF8,0x7FFFF8], prevwfout = [0,0,0], pwv = [0,0,0], combiwf;
 var plp=0, pbp=0, ctfr = -2*3.14*(12500/256)/smpr, ctf_ratio_6581 = -2*3.14*(20000/256)/smpr;
 var pgt, chnadd, ctrl, wf, test, prd, step, SR, aAdd, MSB, tmp, pw, lim, wfout, ctf, reso, flin, output;
 function initSID() { for(var i=0xD400;i<=0xD41F;i++) M[i]=0; for(var i=0;i<3;i++) {Ast[i]=HZ; rcnt[i]=envcnt[i]=expcnt[i]=pSR[i]=0;} }
 
 function SID () 
 {  
  flin=0; output=0;
  for (var chn=0; chn<CHA; chn++) 
  {
   pgt=(Ast[chn]&GAT); chnadd=0xD400+chn*7, ctrl=M[chnadd+4]; wf=ctrl&0xF0; test=ctrl&TST; SR=M[chnadd+6]; tmp=0;
   if ( pgt != (ctrl&GAT) ) { 
    if (pgt) { Ast[chn] &= 0xFF-(GAT|ATK|DECSUS); } 
    else { Ast[chn] = (GAT|ATK|DECSUS); 
     if ( (SR&0xF) > (pSR[chn]&0xF) ) tmp=1; } }  pSR[chn]=SR; 
   rcnt[chn] += ckr; if (rcnt[chn] >= 0x8000) rcnt[chn] -= 0x8000; 
   if (Ast[chn]&ATK) { step = M[chnadd+5]>>4; prd = Aprd[step]; }
   else if (Ast[chn]&DECSUS) { step = M[chnadd+5]&0xF; prd = Aprd[step]; }
   else { step = SR&0xF; prd = Aprd[step]; }     step=Astp[step]; 
   if (rcnt[chn] >= prd && rcnt[chn] < prd+ckr && tmp==0) { 
    rcnt[chn] -= prd;  
    if ( (Ast[chn]&ATK)  ||  ++expcnt[chn] == Aexp[ envcnt[chn] ] ) {
     if ( !(Ast[chn]&HZ) ) {
      if (Ast[chn]&ATK) { envcnt[chn]+=step; if (envcnt[chn]>=0xFF) { envcnt[chn]=0xFF; Ast[chn] &= 0xFF-ATK; } }
      else if ( !(Ast[chn]&DECSUS)  ||  envcnt[chn] > (SR>>4)+(SR&0xF0) )
      { envcnt[chn]-=step; if (envcnt[chn]<=0 && envcnt[chn]+step!=0) { envcnt[chn]=0; Ast[chn] |= HZ; } }  }
     expcnt[chn] = 0;  }  }
   envcnt[chn]&=0xFF; 
   aAdd=(M[chnadd]+M[chnadd+1]*256)*ckr; 
   if (  test  ||  ( (ctrl&SYN) && sMSBrise )  ) { pacc[chn]=0; }
   else { pacc[chn] += aAdd; if (pacc[chn]>0xFFFFFF) pacc[chn] -= 0x1000000; } 
   MSB = pacc[chn]&0x800000; sMSBrise = ( MSB > (pracc[chn]&0x800000))?1:0; 
   if (wf&NOI) { tmp=nLFSR[chn];
    if (((pacc[chn]&0x100000) != (pracc[chn]&0x100000)) || aAdd>=0x100000) { 
     step=(tmp&0x400000)^((tmp&0x20000)<<5) ; tmp = ((tmp<<1)+(step>0||test)) & 0x7FFFFF; nLFSR[chn]=tmp; }   
    wfout = (wf&0x70)?0: ((tmp&0x100000)>>5)+((tmp&0x40000)>>4)+((tmp&0x4000)>>1)+((tmp&0x800)<<1)+((tmp&0x200)<<2)+((tmp&0x20)<<5)+((tmp&0x04)<<7)+((tmp&0x01)<<8); }
   else if (wf&PUL) { 
    pw=(M[chnadd+2]+(M[chnadd+3]&0xF)*256)*16; tmp=aAdd>>9; if (0<pw && pw<tmp) pw=tmp; tmp^=0xFFFF; if(pw>tmp) pw=tmp; tmp=pacc[chn]>>8;
    if (wf==PUL) { step=256/(aAdd>>16); 
     if (test) wfout=0xFFFF;
     else if (tmp < pw) { lim = (0xFFFF-pw)*step; if (lim>0xFFFF) lim=0xFFFF; wfout = lim - (pw-tmp)*step; if (wfout<0) wfout=0; } 
     else { lim = pw*step; if (lim>0xFFFF) lim=0xFFFF; wfout = (0xFFFF-tmp)*step - lim; if (wfout>=0) wfout=0xFFFF; wfout&=0xFFFF; }  } 
    else { 
     wfout = (tmp >= pw || test) ? 0xFFFF:0; 
     if (wf&TRI) { 
      if (wf&SAW) { wfout = (wfout)? cmbWF(chn,Pulsetrsaw,tmp>>4,1) : 0; } 
      else { tmp=pacc[chn]^(ctrl&RNG?sMSB:0); wfout = (wfout)? cmbWF(chn,pusaw,(tmp^(tmp&0x800000?0xFFFFFF:0))>>11,0) : 0; } } 
     else if (wf&SAW) wfout = (wfout)? cmbWF(chn,pusaw,tmp>>4,1) : 0;  }  } 
   else if (wf&SAW) { wfout=pacc[chn]>>8; 
    if (wf&TRI) wfout = cmbWF(chn,trsaw,wfout>>4,1); 
    else { step=aAdd/0x1200000; wfout += wfout*step; if (wfout>0xFFFF) wfout = 0xFFFF-(wfout-0x10000)/step; }  } 
   else if (wf&TRI) { tmp=pacc[chn]^(ctrl&RNG?sMSB:0); wfout = (tmp^(tmp&0x800000?0xFFFFFF:0)) >> 7; }
   if (wf) prevwfout[chn] = wfout; else { wfout = prevwfout[chn]; } 
   pracc[chn] = pacc[chn]; sMSB = MSB;
   if (M[0xD417]&FSW[chn]) flin += (wfout-0x8000)*(envcnt[chn]/256); 
   else if (chn!=2 || !(M[0xD418]&OFF3)) output += (wfout-0x8000)*(envcnt[chn]/256);  
  }
  if(M[1]&3) M[0xD41B]=wfout>>8; M[0xD41C]=envcnt[3]; 
  ctf = (M[0xD415]&7)/8 + M[0xD416] + 0.2; 
  if (SIDm==8580.0) { ctf = 1-Math.exp(ctf*ctfr); reso = Math.pow( 2, ( (4-(M[0xD417]>>4) ) / 8) ); }
  else { if (ctf<24) ctf=0.035; else ctf = 1-1.263*Math.exp(ctf*ctf_ratio_6581); reso = (M[0xD417]>0x5F)? 8/(M[0xD417]>>4) : 1.41; }
  tmp = flin + pbp*reso + plp; if (M[0xD418]&HP) output-=tmp;
  tmp = pbp - tmp*ctf; pbp=tmp;  if (M[0xD418]&BP) output-=tmp;
  tmp = plp + tmp*ctf; plp=tmp;  if (M[0xD418]&LP) output+=tmp;   
  return (output/SCALE)*(M[0xD418]&0xF)*volume + (Math.random()*bgnoi-bgnoi/2); 
 }

 function cmbWF(chn,wfa,index,differ6581) 
 { if(differ6581 && SIDm==6581.0) index&=0x7FF; combiwf = (wfa[index]+pwv[chn])/2; pwv[chn]=wfa[index]; return combiwf; }
 
 function cCmbWF(wfa,bitmul,bstr,trh) { 
  for (var i=0; i<4096; i++) { wfa[i]=0; 
   for (var j=0; j<12;j++) { var blvl=0;
    for (var k=0; k<12; k++) { blvl += ( bitmul/Math.pow(bstr,Math.abs(k-j)) ) * (((i>>k)&1)-0.5) ; }
    wfa[i] += (blvl>=trh)? Math.pow(2,j) : 0;  }
   wfa[i]*=12;  }
 }
 trsaw = new Array(4096);  cCmbWF(trsaw,0.8,2.4,0.64); 
 pusaw = new Array(4096);  cCmbWF(pusaw,1.4,1.9,0.68);
 Pulsetrsaw = new Array(4096); cCmbWF(Pulsetrsaw,0.8,2.5,0.64); 
 
 var prd0 = Math.max(ckr,9);
 var Aprd = [prd0,32*1,63*1,95*1,149*1,220*1,267*1,313*1,392*1,977*1,1954*1,3126*1,3907*1,11720*1,19532*1,31251*1];
 var Astp = [Math.ceil(prd0/9),1,1,1,1,1,1,1,1,1,1,1,1,1,1,1];
 var Aexp = [ 1,30,30,30,30,30,30,16,16,16,16,16,16,16,16,8,8,8,8,8,8,8,8,8,8,8,8,4,4,4,4,4, 
  4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,2,2,2,2,2,2,2,2,2, 2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,1, 
  1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
  1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
  1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1];
 
}
