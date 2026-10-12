/* AI MindSET website – main script */

/* =========================================================
   EDIT YOUR DETAILS HERE
   ========================================================= */
const CONFIG = {
  email: "you@example.com",          // your contact email (used for bookings, registrations, tips)
  phone: "+91 00000 00000",          // your phone number
  founderLabel: "FOUNDER"            // label under the signature on certificates
};
/* ---------- site background: bokeh + particle wave ---------- */
(function(){
  const cv=document.getElementById("bgArt"), ctx=cv.getContext("2d"), cw=document.getElementById("bgWave"), wx=cw.getContext("2d");
  const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
  let W=0,H=0,dpr=1,bokeh=[],cols=110,rows=46,raf=0,running=true;
  function build(){
    dpr=Math.min(window.devicePixelRatio||1,2);
    W=innerWidth; H=innerHeight; cv.width=W*dpr; cv.height=H*dpr; ctx.setTransform(dpr,0,0,dpr,0,0); cw.width=W*dpr; cw.height=H*dpr; wx.setTransform(dpr,0,0,dpr,0,0);
    const mobile=W<760; cols=mobile?90:190; rows=mobile?34:54;
    bokeh=[];
    for(let i=0;i<(mobile?16:30);i++){
      const gold=Math.random()<.55;
      bokeh.push({x:Math.random()*W,y:Math.random()*H*0.8,r:14+Math.random()*(mobile?34:56),
        a:gold?.10+Math.random()*.16:.08+Math.random()*.14, c:gold?"255,196,60":"230,226,214",
        dx:(Math.random()-.5)*.06, dy:-(.02+Math.random()*.06), ph:Math.random()*6.28});
    }
  }
  function draw(t){
    const tt=t*0.00035;
    ctx.fillStyle="#000"; ctx.fillRect(0,0,W,H);
    for(const b of bokeh){
      b.x+=b.dx; b.y+=b.dy; if(b.y<-80){ b.y=H*0.85; b.x=Math.random()*W; }
      const tw=.75+.25*Math.sin(tt*3+b.ph);
      const g=ctx.createRadialGradient(b.x,b.y,0,b.x,b.y,b.r);
      g.addColorStop(0,`rgba(${b.c},${b.a*tw})`); g.addColorStop(.55,`rgba(${b.c},${b.a*tw*.55})`); g.addColorStop(1,`rgba(${b.c},0)`);
      ctx.fillStyle=g; ctx.beginPath(); ctx.arc(b.x,b.y,b.r,0,6.283); ctx.fill();
    }
    // particle wave surface, sweeping up from the bottom-left (own layer, softly blurred)
    wx.clearRect(0,0,W,H);
    const fov=Math.max(W,H)*0.85, horizon=H*0.40, camH=2.9, cx=W*0.18;
    for(let r=0;r<rows;r++){
      const Z=r/rows*9;
      const depthA=1-r/rows;
      for(let c=0;c<cols;c++){
        const X=(c/cols-0.5)*18 + Z*0.9;
        const Y=0.55*Math.sin(X*0.8+tt*2.2+Z*0.45)*Math.cos(Z*0.55-tt*1.4)+0.35*Math.sin(X*0.33-tt*1.1)+0.25*Math.cos(X*0.15+Z*0.9+tt);
        const k=fov/(Z+3.2);
        const px=cx+X*k*0.55, py=horizon+(camH-Y)*k*0.55;
        if(px<-4||px>W+4||py<-4||py>H+4) continue;
        const lift=(Y+1.1)/2.2;
        const a=(0.7*depthA*depthA+0.04)*(0.45+0.55*lift);
        wx.fillStyle=`rgba(255,${190+((lift*50)|0)},${70+((lift*60)|0)},${a})`;
        const sz=0.8+1.3*depthA;
        wx.fillRect(px,py,sz,sz);
      }
    }
  }
  function loop(t){ if(!running) return; draw(t); raf=requestAnimationFrame(loop); }
  function start(){ build(); cancelAnimationFrame(raf); if(reduce){ draw(0); return; } running=true; raf=requestAnimationFrame(loop); }
  let rt; addEventListener("resize",()=>{ clearTimeout(rt); rt=setTimeout(start,200); });
  document.addEventListener("visibilitychange",()=>{ if(reduce) return; if(document.hidden){ running=false; cancelAnimationFrame(raf);} else { running=true; raf=requestAnimationFrame(loop);} });
  start();
})();



/* ---------- data ---------- */
const WORKSHOPS = [
  {id:"w-2026-11-05", day:"05", mon:"Nov 2026", title:"AI basics for everyone", level:"Level 1", lv:"l1", where:"Online", time:"10:00–13:00"},
  {id:"w-2026-11-12", day:"12", mon:"Nov 2026", title:"Excel and MIS with AI", level:"Level 2", lv:"l2", where:"Online", time:"10:00–13:00"},
  {id:"w-2026-11-19", day:"19", mon:"Nov 2026", title:"Build a presentation in 1 hour", level:"Level 2", lv:"l2", where:"Online", time:"15:00–17:00"},
  {id:"w-2026-11-26", day:"26", mon:"Nov 2026", title:"Monthly AI session: wins and new tools", level:"All levels", lv:"l1", where:"Online", time:"16:00–17:00"},
  {id:"w-2026-12-03", day:"03", mon:"Dec 2026", title:"8D and quality reports with AI", level:"Level 2", lv:"l2", where:"Online", time:"10:00–13:00"},
  {id:"w-2026-12-10", day:"10", mon:"Dec 2026", title:"Your first automation", level:"Level 3", lv:"l3", where:"Online", time:"10:00–14:00"}
];
const PROMPTS = [
  {fn:"Everyday office", t:"Write a professional email", w:"Clear, polite emails in seconds.", p:"Act as a professional business writer. Draft a clear, polite email to [recipient role] about [topic].\nKey points: [point 1], [point 2].\nTone: [formal / friendly]. Keep it under 150 words and end with a clear next step."},
  {fn:"Everyday office", t:"Summarise meeting notes", w:"Turn messy notes into decisions and actions.", p:"Summarise these meeting notes into:\n1) key decisions\n2) action items with owner and due date\n3) open questions\nUse short bullet points.\nNotes: [paste notes]"},
  {fn:"Everyday office", t:"Explain in simple Hindi", w:"Make instructions easy for shop-floor teams.", p:"Translate the following into simple Hindi that shop-floor staff can understand. Keep technical terms like [term] in English. Use short sentences.\nText: [paste text]"},
  {fn:"Presentations", t:"PPT outline in minutes", w:"A full deck structure from one prompt.", p:"Create a [10]-slide presentation outline on [topic] for [audience].\nFor each slide give: a title that states the key message, 3 short bullet points, and one chart or visual idea.\nData available: [paste data]"},
  {fn:"Presentations", t:"Turn data into insights", w:"Find what matters in a table of numbers.", p:"Here is our [weekly production / sales] data: [paste table].\nIdentify the top 3 trends, 2 risks and 1 recommended action. Write each as one sentence a manager can read in 10 seconds."},
  {fn:"Excel & MIS", t:"Excel formula helper", w:"Get the right formula with simple steps.", p:"I have an Excel sheet with columns [A: Date, B: Part no., C: Qty produced, D: Rejections].\nWrite a formula to [calculate rejection % by part for this month]. Explain where to paste it and how it works in simple steps."},
  {fn:"Excel & MIS", t:"Check data for errors", w:"Catch mistakes before they reach a report.", p:"Review this data for errors: duplicates, missing values, impossible numbers (for example rejections greater than production) and inconsistent formats. List each issue with its row number.\nData: [paste data]"},
  {fn:"Design", t:"Write a design specification", w:"Turn customer requirements into a clear spec.", p:"Act as a senior product design engineer in an automotive component company.\nTurn these customer requirements into a design specification table with: function, key dimensions, material, loads, operating environment, applicable standards and critical tolerances.\nMark anything missing as [ASK CUSTOMER].\nRequirements: [paste requirements]"},
  {fn:"Design", t:"Draft a DFMEA", w:"A structured first draft for design risk analysis.", p:"Act as a design quality engineer. Draft a DFMEA for [part / assembly] used in [application].\nColumns: item and function, failure mode, effect, severity, cause, occurrence, current design controls, detection, RPN, recommended action.\nMark all estimated ratings as [VERIFY] so the team can review them."},
  {fn:"Design", t:"Compare materials", w:"Pick the right material with clear trade-offs.", p:"Compare 3 suitable materials for [part] that must handle [load / environment].\nCompare strength, weight, cost, corrosion resistance and manufacturability for [stamping / forming / welding / machining].\nShow it as a table and recommend one material with reasons."},
  {fn:"Design", t:"Tolerance stack-up helper", w:"Check if your tolerances add up.", p:"Help me do a tolerance stack-up for this dimension chain:\n[dimension 1 ± tol], [dimension 2 ± tol], [dimension 3 ± tol]\nTarget gap: [value ± tol].\nCalculate worst-case and RSS results step by step, tell me if the design passes, and suggest which tolerance to tighten first."},
  {fn:"Design", t:"Design for manufacturing review", w:"Catch tooling and production issues early.", p:"Review this [sheet metal / machined / welded] part design for manufacturability:\n[describe part: thickness, bends, holes, features, material]\nCheck bend radii, hole-to-edge and hole-to-bend distances, minimum flange length, draw depth and weld access.\nGive a checklist with OK / RISK and a fix for each risk."},
  {fn:"Design", t:"Engineering change note", w:"Write a complete ECN in minutes.", p:"Write an engineering change note (ECN) for this change:\nPart / drawing number: [ ]\nCurrent design: [ ]\nProposed change: [ ]\nReason: [ ]\nInclude: change description, affected parts and drawings, impact on tooling, cost and timing, validation tests needed, and approvals required."},
  {fn:"Design", t:"Explain a GD&T callout", w:"Make drawings easy for the shop floor.", p:"Explain this GD&T callout in simple words for a shop-floor inspector: [callout, e.g. position Ø0.2 to datum A B C].\nSay what it controls, how to measure it with common gauges, and one example of a part that would fail."},
  {fn:"Design", t:"Check a BOM for errors", w:"Find mistakes before release.", p:"Check this bill of materials for errors: missing quantities, duplicate part numbers, unit mismatches, missing materials or finishes, and parts without a drawing number.\nList each issue with its line number and a suggested fix.\nBOM: [paste BOM]"},
  {fn:"Design", t:"Weight reduction ideas", w:"Fresh concepts for lighter, cheaper parts.", p:"Suggest 5 design concepts to reduce the weight of [part] by [x]% without reducing strength or stiffness.\nCurrent design: [material, thickness, key features].\nFor each concept give the idea, expected saving, risk, and what we need to test."},
  {fn:"Design", t:"Summarise a design review", w:"Turn review notes into clear actions.", p:"Summarise these design review notes into:\n1) decisions taken\n2) open issues with owner and due date\n3) risks to timing or cost\nUse short bullet points.\nNotes: [paste notes]"},
  {fn:"Design", t:"Concept options from a brief", w:"Compare design concepts before you start CAD.", p:"Act as a product design engineer for automotive sheet-metal parts. Based on this brief, suggest 3 concept options with pros, cons and manufacturing risks for each. Present them in a table.\nBrief: [part function, loads, mounting points, material, target weight, target cost]"},
  {fn:"Design", t:"Design review checklist", w:"A structured checklist for design reviews.", p:"Create a design review checklist for a [part type, e.g. hinge bracket] covering function, design for manufacturing (stamping / fine blanking), tolerances, material, corrosion protection, assembly and serviceability. Group by category with a Yes / No / Remarks column."},
  {fn:"NPD", t:"APQP project plan", w:"Plan a new part launch backwards from SOP.", p:"Create an APQP-based project plan for a new part: [part name, customer, SOP date].\nList the phases (planning, product design, process design, validation, launch), key deliverables in each (DFMEA, PFMEA, control plan, PPAP), the owner role, and a target week counted back from SOP."},
  {fn:"NPD", t:"Manufacturing feasibility review", w:"Check a new enquiry before you commit.", p:"Prepare a manufacturing feasibility review for this new enquiry: [part description, material, thickness, annual volume, key tolerances].\nCover the process route, tooling needed, capacity check, main risks, and questions to ask the customer."},
  {fn:"NPD", t:"PPAP status tracker", w:"Know every PPAP element and its status.", p:"List all 18 PPAP elements with a one-line explanation of each, and mark which are usually needed for a Level 3 submission. Add Status, Owner and Due date columns that I can fill in."},
  {fn:"Engineering & R&D", t:"Summarise CAE results", w:"Turn simulation output into a clear decision.", p:"Summarise these CAE simulation results for a management review: [max stress, displacement, safety factor, load cases].\nSay pass or fail against these targets: [targets]. Name the weakest area and suggest 2 design changes to consider."},
  {fn:"Engineering & R&D", t:"Validation test plan (DVP&R)", w:"Plan every test needed to validate a design.", p:"Create a DVP&R for [part] covering durability, strength, corrosion, dimensional and functional tests. For each test give: test name, standard or specification, sample size, acceptance criteria and responsibility."},
  {fn:"Tool room & die design", t:"Progressive die strip layout", w:"A first strip layout to discuss with the team.", p:"Act as a press tool designer. For this part: [dimensions, material, thickness, features], suggest a progressive die strip layout: number of stations, the operation at each station, pilot positions, and tips to improve material utilisation."},
  {fn:"Tool room & die design", t:"Fine-blanking die design checks", w:"Key checks before releasing a fine-blanking die.", p:"List the key design checks for a fine-blanking die for [part]: V-ring (impingement ring) design, die clearance, counter-punch force, high-wear areas, and part features that are difficult to fine-blank. Explain each in one line."},
  {fn:"Tool room & die design", t:"Press tonnage calculation", w:"Estimate blanking and piercing force fast.", p:"Calculate the approximate blanking and piercing force for: cut perimeter [mm], thickness [mm], material shear strength [MPa].\nShow the formula and each step, then recommend a press tonnage with a safety margin."},
  {fn:"Tool room & die design", t:"Die maintenance history", w:"Find repeat die problems and set PM intervals.", p:"Here is the maintenance history of die [die no.]: [paste date, problem, action, strokes at the time].\nFind repeat problems, calculate the average strokes between failures, and suggest a preventive maintenance interval."},
  {fn:"Production & manufacturing", t:"Clean shift report", w:"From rough notes to a handover report.", p:"Convert these shift notes into a clean shift report with: output vs target, downtime reasons with minutes, quality issues, and actions for the next shift.\nNotes: [paste notes]"},
  {fn:"Production & manufacturing", t:"Press OEE calculation", w:"See where press time is being lost.", p:"Here is today's data for press [no.]: planned time [min], downtime [min], strokes produced [ ], rated SPM [ ], rejected parts [ ].\nCalculate availability, performance, quality and OEE step by step, and name the biggest loss."},
  {fn:"Production & manufacturing", t:"Robotic welding defect troubleshooting", w:"Narrow down the cause of weld defects.", p:"Our robotic MIG welding cell shows [porosity / spatter / burn-through / undercut] on [part].\nList the likely causes (parameters, gas, wire, fixture, torch angle, cleaning) in order of likelihood, with the check to do for each."},
  {fn:"Production & manufacturing", t:"Assembly line balancing", w:"Balance stations against takt time.", p:"Help me balance this assembly line. Tasks and times: [paste]. Takt time: [seconds].\nGroup the tasks into stations so no station exceeds takt, and show the load % of each station."},
  {fn:"Quality", t:"Draft an 8D report", w:"A structured first draft for the quality team.", p:"Act as a quality engineer in a manufacturing plant. Using the details below, draft an 8D report with sections D1 to D8. Mark anything that needs checking as [VERIFY].\nDefect: [ ]\nPart: [ ]\nWhen and where found: [ ]\nData: [ ]"},
  {fn:"Quality", t:"5-Why root cause analysis", w:"A guided why-why session.", p:"Help me do a 5-Why root cause analysis for this problem: [problem].\nAsk me one question at a time. At the end, summarise the likely root cause, one corrective action and one preventive action."},
  {fn:"Quality", t:"Control plan draft", w:"A first draft of a control plan.", p:"Draft a control plan for [part / process step] with columns: process step, characteristic, specification, measurement method, sample size and frequency, control method, reaction plan."},
  {fn:"Quality", t:"Dimensional report summary", w:"Flag out-of-tolerance results instantly.", p:"Here are dimensional / CMM results: [paste characteristic, nominal, tolerance, measured value].\nFlag anything out of tolerance, show how close the others are to their limits, and summarise in 5 lines."},
  {fn:"Quality", t:"Explain metallurgical results", w:"Understand lab reports in plain language.", p:"Explain these test results in simple words: [hardness, tensile strength, microstructure or case depth].\nSay whether they meet [specification], and what could cause any deviation."},
  {fn:"Maintenance", t:"Find breakdown patterns", w:"Spot repeat failures in your machine log.", p:"Here is the breakdown log for [machine]: [paste log].\nGroup the breakdowns by cause, show which repeat most often, and suggest preventive maintenance checks."},
  {fn:"Maintenance", t:"Preventive maintenance schedule", w:"Daily to yearly checks for a press.", p:"Create a preventive maintenance schedule for a [400-tonne fine-blanking / mechanical] press with daily, weekly, monthly and yearly checks (hydraulics, lubrication, clutch-brake, safety devices, electrical), and the time needed for each."},
  {fn:"Maintenance", t:"Understand IIoT machine alerts", w:"Turn monitoring alerts into action.", p:"Our machine monitoring system shows: [paste alerts or trends: vibration, temperature, oil pressure, cycle time].\nExplain what may be going wrong, how urgent it is, and what to check first."},
  {fn:"Maintenance", t:"MTBF and MTTR", w:"Rank machines by reliability.", p:"From this breakdown log [paste machine, start time, end time, cause], calculate MTBF and MTTR for each machine and rank the three worst machines with the main cause for each."},
  {fn:"Supply chain & stores", t:"Compare supplier quotes", w:"A side-by-side table with a recommendation.", p:"Compare these supplier quotes in a table: price, lead time, payment terms, MOQ and quality certifications. Then recommend the best option with reasons.\nQuotes: [paste quotes]"},
  {fn:"Supply chain & stores", t:"Raw material requirement", w:"Plan steel needs from the schedule.", p:"Based on this monthly schedule [part, quantity] and material per part [coil grade, thickness, kg per part], calculate the total steel needed per grade with [x]% scrap allowance and suggest order quantities."},
  {fn:"Supply chain & stores", t:"Inventory ageing analysis", w:"Find slow-moving and dead stock.", p:"Here is our stores inventory: [item, quantity, last movement date, value].\nGroup it into 0–30, 31–90, 91–180 and 180+ days, highlight slow-moving items, and suggest an action for each group."},
  {fn:"Supply chain & stores", t:"Supplier delay follow-up", w:"A firm, polite chase for late material.", p:"Write a firm but polite follow-up email to supplier [name] about the delayed delivery of [material], PO [no.], due on [date]. Ask for a confirmed dispatch date and a recovery plan."},
  {fn:"HR & admin", t:"Training quiz for operators", w:"Check understanding of any SOP.", p:"Create a 10-question multiple-choice quiz to check operators' understanding of [SOP / safety topic]. Use simple language and put the answer key at the end."},
  {fn:"HR & admin", t:"Job description", w:"A clear JD in minutes.", p:"Write a job description for a [role] in the [press shop / quality / design] department: purpose, key responsibilities, skills, qualification, experience and KPIs. Keep it under 300 words."},
  {fn:"HR & admin", t:"Interview questions", w:"Technical, safety and behaviour questions.", p:"Create 10 interview questions for a [role], mixing technical, safety and behaviour questions. For each, add what a good answer should include."},
  {fn:"HR & admin", t:"Employee notice in two languages", w:"Clear notices everyone understands.", p:"Write a clear notice for all employees about [shift change / holiday / safety drill] in English and in simple Hindi, under 120 words each."},
  {fn:"Accounts & taxation", t:"Explain budget vs actual", w:"Find the real drivers behind a variance.", p:"Explain the variance between budget and actual: [paste lines].\nList the top 3 drivers in plain words and what to check for each."},
  {fn:"Accounts & taxation", t:"GST reconciliation checklist", w:"A monthly routine for GST matching.", p:"Create a monthly GST reconciliation checklist comparing our purchase register with GSTR-2B: the steps, common mismatch reasons, and how to resolve each. Remind me to confirm final positions with our tax advisor."},
  {fn:"Accounts & taxation", t:"Reply to a payroll query", w:"Explain deductions clearly and politely.", p:"Draft a polite reply to an employee asking about [salary deduction / PF / TDS], with a clear explanation based on these details: [details]."},
  {fn:"Accounts & taxation", t:"Monthly MIS summary", w:"One page the management will read.", p:"Turn this monthly P&L data into a one-page MIS summary: revenue, material cost %, EBITDA, and the top 3 changes versus last month.\nData: [paste]"},
  {fn:"Marketing & sales", t:"RFQ summary for review", w:"Brief the team on a new enquiry fast.", p:"Summarise this RFQ for an internal review: part details, annual volume, key specifications, delivery terms, risks, and questions to ask the customer.\nRFQ text: [paste, with confidential pricing removed]"},
  {fn:"Marketing & sales", t:"Capability presentation for an OEM", w:"Pitch your strengths to a new customer.", p:"Create a 10-slide outline to present our capabilities to [OEM / Tier-1 customer]: company overview, products, processes, quality certifications, key customers, new technologies, and why choose us."},
  {fn:"Marketing & sales", t:"Quotation cover email", w:"Send quotes that look professional.", p:"Write a professional email sending our quotation for [part / RFQ no.] to [customer]. Mention the key assumptions and validity, and offer a technical discussion."},
  {fn:"Marketing & sales", t:"Customer complaint first response", w:"Respond fast and with the right tone.", p:"Draft a first response to this customer complaint: [paste].\nAcknowledge the issue, state the containment actions within 24 hours, and commit to an 8D report by [date]. Professional tone."},
  {fn:"IT & network", t:"Network troubleshooting checklist", w:"Fix slow or dropping connections step by step.", p:"Users in [plant area] report [slow network / no internet / ERP disconnecting]. Give a step-by-step troubleshooting checklist from simplest to advanced, including what to check on switches, Wi-Fi access points and the ERP server."},
  {fn:"IT & network", t:"Safe AI use policy", w:"One page of clear AI rules for employees.", p:"Write a one-page policy for safe use of AI tools by employees: approved tools, data that must never be shared, account and password rules, and how to report a mistake."},
  {fn:"IT & network", t:"Plant digitization roadmap", w:"Plan shop-floor digitization in phases.", p:"Suggest a 6-month roadmap to digitize [shop-floor data / production reporting]: quick wins, hardware needed (tablets, sensors, network), software options, and risks."},
  {fn:"IT & network", t:"Excel macro helper", w:"Automate repetitive Excel work.", p:"Write an Excel VBA macro that [describe the task, e.g. combines all sheets into one]. Explain how to add it and run it, step by step."}
];

/* ---------- helpers ---------- */
const $ = s => document.querySelector(s);
const toastEl = $("#toast"); let toastT;
function toast(msg){ toastEl.textContent = msg; toastEl.classList.add("show"); clearTimeout(toastT); toastT = setTimeout(()=>toastEl.classList.remove("show"), 2200); }
async function copyText(t){
  try { await navigator.clipboard.writeText(t); toast("Prompt copied"); }
  catch { const ta=document.createElement("textarea"); ta.value=t; document.body.appendChild(ta); ta.select();
    try{ document.execCommand("copy"); toast("Prompt copied"); }catch{ toast("Select the text and copy it manually"); } ta.remove(); }
}
function el(tag, attrs={}, kids=[]){ const e=document.createElement(tag); for(const [k,v] of Object.entries(attrs)){ if(k==="text") e.textContent=v; else if(k==="class") e.className=v; else e.setAttribute(k,v);} kids.forEach(k=>e.appendChild(k)); return e; }

/* ---------- contact details from CONFIG ---------- */
(function(){ const e=document.getElementById("cfgEmail"), t=document.getElementById("cfgPhone");
  e.textContent=CONFIG.email; e.href="mailto:"+CONFIG.email; t.textContent=CONFIG.phone; t.href="tel:"+CONFIG.phone.replace(/\s+/g,""); })();
function mailto(subject, body){ location.href = "mailto:"+CONFIG.email+"?subject="+encodeURIComponent(subject)+"&body="+encodeURIComponent(body); }

/* ---------- prompt library: department pages ---------- */
const CAT_INFO = {
  "Everyday office":"Emails, meeting notes and simple translations.",
  "Presentations":"Deck outlines and data insights for reviews.",
  "Excel & MIS":"Formulas, data checks and MIS reports.",
  "Design":"Concepts, DFMEA, GD&T, tolerances and BOM checks.",
  "NPD":"APQP plans, feasibility reviews and PPAP.",
  "Engineering & R&D":"CAE summaries and validation test plans.",
  "Tool room & die design":"Strip layouts, tonnage and die design checks.",
  "Production & manufacturing":"OEE, welding, line balancing and shift reports.",
  "Quality":"8D, root cause, control plans and test results.",
  "Maintenance":"PM schedules, machine alerts and MTBF.",
  "Supply chain & stores":"Material planning, inventory and suppliers.",
  "HR & admin":"Job descriptions, interviews, notices and training.",
  "Accounts & taxation":"Variance, GST, payroll and MIS.",
  "Marketing & sales":"OEM pitches, quotations and complaints.",
  "IT & network":"Troubleshooting, AI policy and digitization."
};
const CATS = [...new Set(PROMPTS.map(p=>p.fn))];
const catSlug = c => c.toLowerCase().replace(/&/g,"and").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
function catCard(c){
  const n = PROMPTS.filter(p=>p.fn===c).length;
  return el("a",{class:"cat-card",href:"#prompts/"+catSlug(c),"aria-label":c+", "+n+" prompts"},[
    el("h3",{text:c}), el("p",{text:CAT_INFO[c]||"Ready-to-use prompts for this team."}),
    el("div",{class:"cat-foot"},[ el("span",{text:n+(n===1?" PROMPT":" PROMPTS")}), el("span",{text:"→"}) ])
  ]);
}
const catGrid = $("#catGrid"); CATS.forEach(c=>catGrid.appendChild(catCard(c)));
function promptCard(p){
  const copy = el("button",{class:"btn btn-ghost btn-sm",text:"Copy prompt"}); copy.onclick=()=>copyText(p.p);
  const tryb = el("button",{class:"btn btn-primary btn-sm",text:"Try it"});
  tryb.onclick=()=>{ location.hash = "#try"; setTimeout(()=>{ $("#playInput").value = p.p; if(typeof syncOpenLinks==="function") syncOpenLinks(); $("#playground").scrollIntoView({block:"center"}); $("#playInput").focus({preventScroll:true}); },80); };
  return el("article",{class:"prompt"},[ el("span",{class:"fn",text:p.fn}), el("h3",{text:p.t}), el("p",{class:"why",text:p.w}), el("pre",{text:p.p}), el("div",{class:"row"},[copy,tryb]) ]);
}
function showCategory(slug){
  const c = CATS.find(x=>catSlug(x)===slug);
  const view = document.getElementById("articleView"), main = document.querySelector("main");
  if(!c){ location.hash = "#prompts"; return; }
  view.textContent = "";
  const page = el("div",{class:"cat-page"});
  page.appendChild(el("a",{class:"art-back",href:"#prompts",text:"← All departments"}));
  page.appendChild(el("span",{class:"ins-cat",text:"PROMPT LIBRARY"}));
  page.appendChild(el("h1",{text:c}));
  const list = PROMPTS.filter(p=>p.fn===c);
  page.appendChild(el("p",{class:"lead",text:(CAT_INFO[c]||"")+" "+list.length+" ready-to-use prompts. Replace the words in [brackets] with your details."}));
  const search = el("input",{class:"search",type:"search",placeholder:"Search in "+c,"aria-label":"Search prompts in "+c}); search.style.maxWidth="420px"; search.style.marginBottom="20px";
  const grid = el("div",{class:"prompt-grid"});
  const render = ()=>{ const q = search.value.trim().toLowerCase(); grid.textContent = "";
    const l = list.filter(p=>!q || (p.t+" "+p.w+" "+p.p).toLowerCase().includes(q));
    if(!l.length){ grid.appendChild(el("div",{class:"empty-state",text:"No prompts match that search. Try a shorter word."})); return; }
    l.forEach(p=>grid.appendChild(promptCard(p))); };
  search.addEventListener("input", render); render();
  page.appendChild(search); page.appendChild(grid);
  const others = el("div",{class:"cat-others"},[ el("h4",{text:"Other departments"}) ]);
  const links = el("div",{class:"links"}); CATS.filter(x=>x!==c).forEach(x=>links.appendChild(el("a",{class:"chip",href:"#prompts/"+catSlug(x),text:x}))); others.appendChild(links);
  page.appendChild(others);
  view.appendChild(page);
  main.hidden = true; view.hidden = false; view.style.paddingTop = "40px";
  document.title = c + " prompts · AI MindSET"; window.scrollTo(0,0);
}

/* ---------- playground (sample capability) ---------- */
let sample = null, ctl = null, downloads = null;
const runBtn = $("#playRun"), out = $("#playOut");
$("#playCopy").onclick = ()=>copyText($("#playInput").value);
function setNoSample(){
  runBtn.hidden = true; $("#openClaude").hidden = false; $("#openGpt").hidden = false;
  $("#playMode").textContent = "Opens in your AI tool";
  out.textContent = "Press Open in Claude or Open in ChatGPT to run this prompt in a new tab. Use it as a first draft, then check and edit it yourself.";
}
function syncOpenLinks(){ const q=encodeURIComponent($("#playInput").value); $("#openClaude").href="https://claude.ai/new?q="+q; $("#openGpt").href="https://chatgpt.com/?q="+q; }
$("#playInput").addEventListener("input", syncOpenLinks); syncOpenLinks();
setNoSample();
const SYSTEM = "You are the AI MindSET practice assistant. You help company employees who are new to AI, many of them working in manufacturing and office roles in India. Answer the user's prompt helpfully and concisely in plain text without markdown symbols. If the prompt still contains [placeholders], fill them with realistic example details and say so in one line at the end. If the user appears to paste confidential customer drawings, pricing or personal data, remind them not to share such data with AI tools.";
runBtn.onclick = async ()=>{
  if(!sample) return;
  const prompt = $("#playInput").value.trim();
  if(!prompt){ out.textContent = "Type or pick a prompt first, then press Run prompt."; return; }
  if(ctl) ctl.abort(); ctl = new AbortController();
  runBtn.disabled = true; out.classList.remove("empty"); out.textContent = "Thinking…";
  try{
    await sample([{role:"user", content: SYSTEM + "\n\nUser prompt:\n" + prompt}], {signal: ctl.signal, cache:false, onText: ({text}) => { out.textContent = text; }});
  }catch(e){
    if(e && e.code === "not_granted"){ out.textContent = "Running prompts here needs your permission. Copy the prompt and use your approved AI tool instead."; setNoSample(); }
    else if(e && e.code === "rate_limited"){ out.textContent = "Too many runs in a short time. Wait a minute, then run it again."; }
    else if(e && e.name === "AbortError"){ }
    else { out.textContent = (e && e.text) ? e.text : "The prompt couldn't run right now. Copy it and use your approved AI tool."; }
  }finally{ if(sample) runBtn.disabled = false; }
};

/* ---------- workshops + registrations (db) ---------- */
let db=null, uid=null, myDoc=null, myData={workshops:[], tips:false}, counts={};
function renderWorkshops(){
  const list = $("#wsList"); list.textContent = "";
  WORKSHOPS.forEach(w=>{
    const mine = myData.workshops.includes(w.id);
    const btn = el("button",{class:"btn btn-sm "+(mine?"btn-primary registered":"btn-primary"),text: mine?"Registered ✓":"Register"});
    btn.onclick = ()=>{ if(db&&uid) toggleReg(w.id); else mailto("Workshop registration: "+w.title+" ("+w.day+" "+w.mon+")", "Hi,\n\nI would like to register for \""+w.title+"\" on "+w.day+" "+w.mon+", "+w.time+".\n\nName:\nCompany / team:\nPhone:\n\nThank you."); };
    const n = counts[w.id]||0;
    list.appendChild(el("div",{class:"ws"},[
      el("div",{class:"ws-date"},[document.createTextNode(w.day), el("small",{text:w.mon})]),
      el("div",{},[ el("h3",{text:w.title}), el("div",{class:"ws-meta"},[ el("span",{class:"tag "+w.lv,text:w.level}), el("span",{class:"tag",text:w.where}), el("span",{class:"tag",text:w.time}) ]) ]),
      el("div",{class:"ws-side"},[ btn, el("span",{class:"ws-count",text: db ? (n===1?"1 person registered":n+" people registered") : ""}) ])
    ]));
  });
}
async function saveMine(){
  myData.updatedAt = new Date().toISOString();
  await myDoc.set({workshops: myData.workshops, tips: !!myData.tips, updatedAt: myData.updatedAt});
}
async function toggleReg(id){
  if(!myDoc) return;
  const had = myData.workshops.includes(id);
  myData.workshops = had ? myData.workshops.filter(x=>x!==id) : [...myData.workshops, id];
  renderWorkshops();
  try{ await saveMine(); toast(had ? "Registration cancelled" : "You're registered"); }
  catch(e){ myData.workshops = had ? [...myData.workshops, id] : myData.workshops.filter(x=>x!==id); renderWorkshops(); $("#wsStatus").textContent = "Registration couldn't be saved. Please email us to register."; }
}
renderWorkshops();

/* ---------- tips subscribe ---------- */
function renderTip(){
  const b = $("#tipBtn");
  b.textContent = myData.tips ? "Subscribed ✓  (tap to stop)" : "Subscribe to monthly tips";

}
$("#tipBtn").onclick = async ()=>{
  if(!myDoc){ mailto("Subscribe to monthly AI tips", "Hi,\n\nPlease add me to the monthly AI tips list.\n\nName:\nCompany / team:\n\nThank you."); return; } myData.tips = !myData.tips; renderTip();
  try{ await saveMine(); toast(myData.tips ? "Subscribed to monthly tips" : "Unsubscribed"); }
  catch{ myData.tips = !myData.tips; renderTip(); toast("Couldn't save. Try again later."); }
};
renderTip();

/* ---------- capabilities ---------- */
(async ()=>{
  if(!window.claude || !window.claude.use) return;
  claude.use("sample").then(s=>{ if(s){ sample = s; runBtn.hidden = false; runBtn.disabled = false; $("#openClaude").hidden = true; $("#openGpt").hidden = true; $("#playMode").textContent = "Practice space"; out.textContent = "The answer appears here. Use it as a first draft, then check and edit it yourself."; } });
  claude.use("downloads").then(d=>{ downloads = d; });
  const [d, user] = await Promise.all([claude.use("db"), claude.use("user")]);
  if(!d || !user) return;
  db = d; uid = await user.id();
  if(uid){
    myDoc = db.doc("registrations/"+uid);
    myDoc.onSnapshot(snap=>{ const v = snap.exists ? snap.data() : null; if(v){ myData.workshops = Array.isArray(v.workshops)?v.workshops.filter(x=>typeof x==="string"):[]; myData.tips = !!v.tips; } renderWorkshops(); renderTip(); },
      ()=>{});
  }
  db.collection("registrations").onSnapshot(qs=>{
    counts = {}; qs.docs.forEach(doc=>{ const v = doc.data()||{}; (Array.isArray(v.workshops)?v.workshops:[]).forEach(id=>{ counts[id]=(counts[id]||0)+1; }); });
    renderWorkshops();
  }, ()=>{});
  renderWorkshops(); renderTip();
})();

/* ---------- certificate ---------- */

const markImg = new Image();
markImg.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent("<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120'><defs><linearGradient id='r' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='#FFF6D6'/><stop offset='1' stop-color='#A79F84'/></linearGradient><linearGradient id='y' x1='0' y1='1' x2='1' y2='0'><stop offset='0' stop-color='#FFC933'/><stop offset='1' stop-color='#FFE58A'/></linearGradient></defs><path d='M51 8 H66 L39 104 H17 Z' fill='#FFF6D6'/><path d='M54 8 H69 L103 104 H81 Z' fill='url(#r)'/><rect x='8' y='102' width='40' height='8' rx='2' fill='#FFF6D6'/><rect x='72' y='102' width='40' height='8' rx='2' fill='url(#r)'/><path d='M14 84 C 40 82, 62 74, 98 44' fill='none' stroke='url(#y)' stroke-width='8' stroke-linecap='round'/><circle cx='14' cy='84' r='4' fill='#FFC933'/><circle cx='101' cy='41' r='9' fill='none' stroke='#FFE58A' stroke-width='4'/><circle cx='101' cy='41' r='3.5' fill='#FFE58A'/></svg>");
const sigImg = new Image();
sigImg.src = "assets/images/signature.png";
const dlg = $("#certDlg"), cv = $("#certCanvas"), cx = cv.getContext("2d");
const thumbCx = $("#certThumbCv").getContext("2d");
WORKSHOPS.forEach(w=>$("#cWs").appendChild(el("option",{value:w.title,text:w.title})));
$("#cDate").valueAsDate = new Date();
function certId(){ const s = ($("#cName").value+"|"+$("#cWs").value+"|"+$("#cDate").value); let h=0; for(const c of s){ h=(h*31+c.charCodeAt(0))>>>0; } return "AIM-"+h.toString(36).toUpperCase().padStart(7,"0").slice(0,7); }
function fmtDate(v){ const d = v ? new Date(v+"T00:00:00") : new Date(); return d.toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"}); }
function spaced(c, text, x, y, px){ if("letterSpacing" in c){ c.letterSpacing = px+"px"; c.fillText(text, x + px/2, y); c.letterSpacing = "0px"; } else c.fillText(text, x, y); }
function gold(c, x0, y0, x1, y1){ const g = c.createLinearGradient(x0,y0,x1,y1); g.addColorStop(0,"#8A6500"); g.addColorStop(.35,"#E9C75A"); g.addColorStop(.6,"#FFF0B3"); g.addColorStop(.8,"#C9A227"); g.addColorStop(1,"#8A6500"); return g; }
function paintCert(c, o){
  const W=2000, H=1414;
  c.save(); c.textAlign="center"; c.textBaseline="alphabetic";
  // paper
  c.fillStyle="#0B0B0A"; c.fillRect(0,0,W,H);
  const paper=c.createRadialGradient(W*0.62,H*0.45,100,W*0.62,H*0.5,1200); paper.addColorStop(0,"#FFFDF4"); paper.addColorStop(1,"#F6EBC8");
  c.fillStyle=paper; c.fillRect(34,34,W-68,H-68);
  // faint particle wave, echoing the website
  for(let r=0;r<26;r++){ const Z=r/26*6; for(let k=0;k<120;k++){ const X=(k/120-0.5)*14+Z*0.8; const Y=0.5*Math.sin(X*0.8+Z*0.5)+0.3*Math.sin(X*0.35);
    const kk=1500/(Z+3.2); const px=1150+X*kk*0.5, py=1010+(2.4-Y)*kk*0.22; if(px<520||px>W-60||py>H-60||py<60) continue;
    c.fillStyle=`rgba(184,138,0,${0.05+0.13*(1-r/26)})`; c.fillRect(px,py,3,3); } }
  // gold rules
  c.strokeStyle=gold(c,0,0,W,H); c.lineWidth=5; c.strokeRect(56,56,W-112,H-112);
  c.lineWidth=1.5; c.strokeRect(72,72,W-144,H-144);
  // left panel
  c.fillStyle="#000"; c.fillRect(72,72,450,H-144);
  c.strokeStyle=gold(c,72,0,522,H); c.lineWidth=3; c.beginPath(); c.moveTo(522,72); c.lineTo(522,H-72); c.stroke();
  const px=297;
  c.fillStyle="#FFE58A"; c.font="700 24px Archivo, Arial"; spaced(c,"AI",px,210,14);
  c.font="400 80px Archivo, Arial"; const mW=c.measureText("Mind").width; c.font="800 80px Archivo, Arial"; const sW=c.measureText("SET").width;
  const sx=px-(mW+sW)/2; c.textAlign="left"; c.fillStyle="#F7F2DC"; c.font="400 80px Archivo, Arial"; c.fillText("Mind",sx,292);
  c.fillStyle=gold(c,sx+mW,230,sx+mW+sW,300); c.font="800 80px Archivo, Arial"; c.fillText("SET",sx+mW,292); c.textAlign="center";
  c.fillStyle="#B5AE93"; c.font="500 22px Archivo, Arial"; c.fillText("Practical AI for every team",px,340);
  // seal with ribbons
  const sy=690;
  c.fillStyle="#8A6500";
  c.beginPath(); c.moveTo(px-70,sy+90); c.lineTo(px-120,sy+330); c.lineTo(px-75,sy+300); c.lineTo(px-40,sy+345); c.lineTo(px-5,sy+110); c.closePath(); c.fill();
  c.beginPath(); c.moveTo(px+70,sy+90); c.lineTo(px+120,sy+330); c.lineTo(px+75,sy+300); c.lineTo(px+40,sy+345); c.lineTo(px+5,sy+110); c.closePath(); c.fill();
  c.fillStyle=gold(c,px-160,sy-160,px+160,sy+160); c.beginPath();
  for(let i=0;i<=72;i++){ const a=i/72*Math.PI*2, rr=i%2?150:162; const x=px+Math.cos(a)*rr, y=sy+Math.sin(a)*rr; i?c.lineTo(x,y):c.moveTo(x,y); } c.fill();
  c.fillStyle="#000"; c.beginPath(); c.arc(px,sy,126,0,Math.PI*2); c.fill();
  c.strokeStyle=gold(c,px-120,sy-120,px+120,sy+120); c.lineWidth=3; c.beginPath(); c.arc(px,sy,112,0,Math.PI*2); c.stroke();
  if(markImg.complete && markImg.naturalWidth) c.drawImage(markImg,px-78,sy-82,156,156);
  c.fillStyle="#FFE58A"; c.font="700 22px Archivo, Arial"; spaced(c,"CERTIFIED",px,sy+420,10);
  c.fillStyle="#8F8A78"; c.font="400 20px 'JetBrains Mono', monospace"; c.fillText("Certificate ID",px,H-170); c.fillStyle="#F7F2DC"; c.font="600 24px 'JetBrains Mono', monospace"; c.fillText(o.id,px,H-136);
  // right content
  const cxm=1250;
  c.fillStyle="#111"; c.font="600 128px 'Cormorant Garamond', Georgia, serif"; spaced(c,"CERTIFICATE",cxm,330,14);
  c.fillStyle="#9A7300"; c.font="600 34px 'Cormorant Garamond', Georgia, serif"; spaced(c,"OF COMPLETION",cxm,398,10);
  const ow=c.measureText("OF COMPLETION").width + 13*10, half=ow/2+28;
  c.strokeStyle=gold(c,880,0,1620,0); c.lineWidth=2;
  c.beginPath(); c.moveTo(cxm-half-170,387); c.lineTo(cxm-half,387); c.moveTo(cxm+half,387); c.lineTo(cxm+half+170,387); c.stroke();
  c.fillStyle="#5C5440"; c.font="500 28px Archivo, Arial"; c.fillText("This certificate is proudly presented to",cxm,505);
  let fs=150; c.font=`400 ${fs}px 'Great Vibes', 'Brush Script MT', cursive`; while(c.measureText(o.name).width>1250 && fs>60){ fs-=6; c.font=`400 ${fs}px 'Great Vibes', 'Brush Script MT', cursive`; }
  c.fillStyle=gold(c,cxm-500,520,cxm+500,660); c.fillStyle="#7A5B00"; c.fillText(o.name,cxm,640);
  c.strokeStyle=gold(c,820,0,1680,0); c.lineWidth=2.5; c.beginPath(); c.moveTo(820,680); c.lineTo(1680,680); c.stroke();
  c.fillStyle="#2B2820"; c.font="400 30px Archivo, Arial";
  c.fillText(o.plant ? `of ${o.plant}, for successfully completing the workshop` : "for successfully completing the workshop",cxm,760);
  c.fillStyle="#000"; let ws=52; c.font=`700 ${ws}px 'Cormorant Garamond', Georgia, serif`; const wt=`“${o.ws}”`; while(c.measureText(wt).width>1300 && ws>30){ ws-=2; c.font=`700 ${ws}px 'Cormorant Garamond', Georgia, serif`; } c.fillText(wt,cxm,836);
  c.fillStyle="#5C5440"; c.font="400 26px Archivo, Arial"; c.fillText("a hands-on programme in practical AI for everyday work",cxm,890);
  // date + signature
  const dx=930, gx=1570, ly=1150;
  c.fillStyle="#111"; c.font="600 32px Archivo, Arial"; c.fillText(o.ds,dx,ly-20);
  if(sigImg.complete && sigImg.naturalWidth){ const sw=330, sh=sw*sigImg.naturalHeight/sigImg.naturalWidth; c.drawImage(sigImg,gx-sw/2,ly-sh+38,sw,sh); }
  c.strokeStyle="#111"; c.lineWidth=2; c.beginPath(); c.moveTo(dx-170,ly); c.lineTo(dx+170,ly); c.moveTo(gx-190,ly); c.lineTo(gx+190,ly); c.stroke();
  c.fillStyle="#9A7300"; c.font="700 20px Archivo, Arial"; spaced(c,"DATE",dx,ly+42,6); spaced(c,(typeof CONFIG!=="undefined"?CONFIG.founderLabel:"FOUNDER"),gx,ly+42,6);
  c.fillStyle="#5C5440"; c.font="400 22px Archivo, Arial"; c.fillText("AI MindSET",gx,ly+76);
  c.restore();
}
function current(){ return { name: $("#cName").value.trim() || "Your Name", plant: $("#cPlant").value.trim(), ws: $("#cWs").value, ds: fmtDate($("#cDate").value), id: certId() }; }
function drawCert(){ paintCert(cx, current()); }
function drawThumb(){ paintCert(thumbCx, { name:"Your Name", plant:"", ws: WORKSHOPS[0].title, ds: fmtDate(""), id:"AIM-0000000" }); }
function redrawAll(){ drawThumb(); if(dlg.open) drawCert(); }
markImg.onload = redrawAll; sigImg.onload = redrawAll;
if(document.fonts){ Promise.all(["400 60px 'Great Vibes'","600 60px 'Cormorant Garamond'","700 60px 'Cormorant Garamond'","400 30px Archivo","800 30px Archivo"].map(f=>document.fonts.load(f).catch(()=>{}))).then(redrawAll); }
drawThumb();
function openCert(){ drawCert(); if(typeof dlg.showModal==="function") dlg.showModal(); else dlg.setAttribute("open",""); $("#cName").focus();
  $("#certStatus").textContent = "Your certificate updates as you type."; $("#certSave").hidden = false; }
$("#certLink").onclick = openCert; $("#certThumb").onclick = openCert;
$("#certClose").onclick = ()=>dlg.close();
["#cName","#cPlant","#cWs","#cDate"].forEach(s=>$(s).addEventListener("input",drawCert));

$("#certSave").onclick = async ()=>{
  if(!$("#cName").value.trim()){ $("#certStatus").textContent = "Enter your full name first."; $("#cName").focus(); return; }
  
  drawCert();
  cv.toBlob(async blob=>{
    if(!blob){ $("#certStatus").textContent = "The certificate image couldn't be created. Try again."; return; }
    const safe = $("#cName").value.trim().replace(/[^a-z0-9]+/gi,"-").replace(/^-|-$/g,"") || "certificate";
    if(!downloads){ const url=URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url; a.download=`AI-MindSET-Certificate-${safe}.png`; document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(url),4000); $("#certStatus").textContent = "Certificate downloaded."; return; }
    try{ await downloads.save({filename:`AI-MindSET-Certificate-${safe}.png`, data: blob}); $("#certStatus").textContent = "Certificate downloaded."; }
    catch(e){ $("#certStatus").textContent = e && e.code==="declined" ? "Download cancelled." : (e && e.code==="rate_limited" ? "A download is already waiting for confirmation." : "Download isn't available here. Right-click the certificate to save it."); }
  }, "image/png");
};

/* ---------- insights + article pages ---------- */
const INSIGHTS = [{"slug": "measuring-ai-roi", "cat": "AI BEST PRACTICES", "alt": "3D letters A and I standing on a circuit board", "title": "Measuring AI ROI: how to prove the hours your team saves", "body": "<h2>Why most AI projects can't show results</h2>\n<p>Many companies buy AI tools, run a training session and hope for the best. Three months later, nobody can say what actually changed. The problem is rarely the tool. It is that nobody measured the work <strong>before</strong> AI arrived.</p>\n<p>Proving value is simple when you treat it like any other improvement project: measure, change, measure again.</p>\n<h2>Step 1: Build a baseline</h2>\n<p>Pick five to ten recurring tasks that eat the most time. For each one, write down three numbers:</p>\n<ul><li><strong>Time</strong> per task (for example, 6 hours for the weekly MIS report)</li><li><strong>Frequency</strong> (4 times a month)</li><li><strong>Errors or rework</strong> (2 corrections a month)</li></ul>\n<p>That one report alone costs 24 hours a month. Multiply across a team and the opportunity becomes clear.</p>\n<h2>Step 2: Measure three kinds of value</h2>\n<ul><li><strong>Time saved:</strong> hours freed for higher-value work</li><li><strong>Quality:</strong> fewer errors, less rework, fewer escalations</li><li><strong>Speed:</strong> faster responses to customers, quicker decisions</li></ul>\n<div class=\"art-quote\">Monthly value = hours saved \u00d7 hourly cost + cost of errors avoided. Compare it with what you spend on tools and training.</div>\n<h2>Step 3: Track adoption, not licences</h2>\n<p>A licence that nobody uses saves nothing. Track how many people use AI every week, which tasks moved to AI, and which prompts are reused. Adoption is the leading indicator; hours saved is the result.</p>\n<h2>Step 4: Report monthly and celebrate wins</h2>\n<p>Share a one-page scorecard every month: hours saved, tasks automated, best example of the month. When people see a colleague finish a 12-hour task in one hour, adoption spreads on its own.</p>", "prompt": "Act as an operations analyst. Help me build a simple AI ROI tracker in Excel. Columns: task name, time before AI (hours), time after AI, frequency per month, errors before and after. Add formulas for monthly hours saved and value saved at \u20b9[hourly cost] per hour.", "src": "assets/images/insight-ai-roi.jpg"}, {"slug": "human-ai-synergy", "cat": "EMPOWERING TEAMS", "alt": "A small programmable robot in front of a screen of code", "title": "The human and AI partnership: new roles and skills for a hybrid workforce", "body": "<h2>AI takes over tasks, not jobs</h2>\n<p>Every job is a bundle of tasks. Some are repetitive: drafting, copying data, searching, formatting. Others need judgment: deciding, approving, building relationships. AI is very good at the first group and still needs people for the second.</p>\n<p>When you look at work task by task, the fear of \"AI will replace me\" turns into a practical question: which parts of my week should AI do?</p>\n<h2>Map one role's week</h2>\n<ul><li>List every recurring task a person does in a typical week</li><li>Mark each one: <strong>AI does it</strong>, <strong>AI helps</strong>, or <strong>people only</strong></li><li>Start with the tasks marked \"AI does it\" and measure the time freed</li></ul>\n<h2>The four skills everyone needs</h2>\n<ul><li><strong>Prompting:</strong> give AI a role, the task, your details and the format you want</li><li><strong>Checking:</strong> verify numbers and facts before anything leaves your desk</li><li><strong>Workflow thinking:</strong> see where a process can be shortened, not just sped up</li><li><strong>Data sense:</strong> know what data AI needs and what must stay private</li></ul>\n<div class=\"art-quote\">The goal is not fewer people. It is people spending their time on the work only people can do.</div>\n<h2>New roles appear</h2>\n<p>As teams adopt AI, new responsibilities emerge: <strong>AI champions</strong> who help colleagues, <strong>process owners</strong> who redesign workflows, and <strong>reviewers</strong> who check AI output where accuracy matters most.</p>\n<h2>Make it safe to learn</h2>\n<p>People learn fastest when they can try, fail and share openly. Celebrate experiments, share mistakes in the monthly session, and keep clear rules about what data never goes into AI tools.</p>", "prompt": "Here is a list of tasks I do in a typical week: [paste tasks]. For each task, tell me whether AI can do it, AI can help, or it should stay human, and explain why in one line. Then suggest the three tasks I should start with.", "src": "assets/images/insight-human-ai.jpg"}, {"slug": "decision-intelligence", "cat": "AI USE CASES", "alt": "A screen full of live charts and data tables", "title": "From data to decisions: how AI turns numbers into smart operational choices", "body": "<h2>Lots of data, slow decisions</h2>\n<p>Most companies already have plenty of data: production logs, sales reports, supplier records, maintenance sheets. Yet decisions still wait for someone to compile a report, spot a pattern and explain it in a meeting. Decision intelligence closes that gap.</p>\n<h2>Three levels of insight</h2>\n<ul><li><strong>Describe:</strong> what happened? (output fell 8% this week)</li><li><strong>Diagnose:</strong> why did it happen? (two machines had repeat stoppages)</li><li><strong>Decide:</strong> what should we do next? (schedule preventive checks before Monday)</li></ul>\n<p>Spreadsheets handle the first level. AI helps with the second and third, in minutes instead of days.</p>\n<h2>Where it works in operations</h2>\n<ul><li><strong>Production:</strong> spot deviations from target and their likely causes</li><li><strong>Inventory:</strong> flag items at risk of running out or piling up</li><li><strong>Suppliers:</strong> compare delivery and quality trends to find risks early</li><li><strong>Maintenance:</strong> find repeat failures and suggest preventive actions</li></ul>\n<div class=\"art-quote\">AI recommends. People decide. Accountability always stays with the person who signs off.</div>\n<h2>Getting started in one week</h2>\n<p>Pick one decision your team makes every week, such as next week's production plan or which supplier to follow up with. List the data that decision depends on. Ask AI to summarise the top drivers and recommend an action, then compare its suggestion with what your team decided. After a few weeks you will know exactly where AI adds value.</p>\n<h2>Keep data quality in mind</h2>\n<p>AI is only as good as the data you give it. Clean, consistent data beats more data. Always check numbers before acting on a recommendation.</p>", "prompt": "Here is our data for the last 4 weeks: [paste table]. Describe what changed, explain the two most likely reasons, and recommend one action for next week. Keep it to 6 short bullet points a manager can read in 30 seconds.", "src": "assets/images/insight-data-decisions.jpg"}];
function insCard(a){
  const link = el("a",{class:"ins-card",href:"#insight/"+a.slug,"aria-label":a.title});
  const im = el("img",{src:a.src,alt:a.alt,loading:"lazy"});
  link.appendChild(el("div",{class:"ins-img"},[im]));
  link.appendChild(el("div",{class:"ins-body"},[ el("span",{class:"ins-cat",text:a.cat}), el("h3",{text:a.title}), el("span",{class:"ins-meta",text:"AI MindSET · October 2026"}), el("span",{class:"ins-more",text:"Read article →"}) ]));
  return link;
}
INSIGHTS.forEach(a=>$("#insGrid").appendChild(insCard(a)));
const mainEl = document.querySelector("main"), artView = $("#articleView");
function showArticle(slug){
  const a = INSIGHTS.find(x=>x.slug===slug);
  if(!a){ artView.hidden = true; mainEl.hidden = false; return; }
  artView.textContent = "";
  const wrap = el("article",{class:"art"});
  const back = el("a",{class:"art-back",href:"#insights",text:"← Back to insights"});
  wrap.appendChild(back);
  wrap.appendChild(el("span",{class:"ins-cat",text:a.cat}));
  wrap.appendChild(el("h1",{text:a.title}));
  wrap.appendChild(el("p",{class:"art-meta",text:"AI MindSET · October 2026 · 4 min read"}));
  wrap.appendChild(el("div",{class:"art-hero"},[el("img",{src:a.src,alt:a.alt})]));
  const body = el("div",{class:"art-body"}); body.innerHTML = a.body;
  const pr = el("div",{class:"art-prompt"},[ el("b",{text:"Try this prompt"}), el("pre",{text:a.prompt}) ]);
  const cp = el("button",{class:"btn btn-ghost btn-sm",text:"Copy prompt"}); cp.onclick=()=>copyText(a.prompt);
  const tr = el("button",{class:"btn btn-primary btn-sm",text:"Try it on the home page"}); tr.style.marginLeft="8px";
  tr.onclick=()=>{ location.hash = "#try"; setTimeout(()=>{ $("#playInput").value = a.prompt; syncOpenLinks(); $("#playInput").focus(); },60); };
  pr.appendChild(cp); pr.appendChild(tr); body.appendChild(pr);
  wrap.appendChild(body);
  const nx = el("div",{class:"art-next"},[ el("h4",{text:"Read next"}) ]);
  const g = el("div",{class:"ins-grid"}); INSIGHTS.filter(x=>x.slug!==slug).forEach(x=>g.appendChild(insCard(x))); nx.appendChild(g);
  wrap.appendChild(nx);
  artView.appendChild(wrap);
  mainEl.hidden = true; artView.hidden = false;
  document.title = a.title + " · AI MindSET";
  window.scrollTo(0,0);
}
function route(){
  const h = location.hash;
  if(h.startsWith("#insight/")){ showArticle(decodeURIComponent(h.slice(9))); return; }
  if(h.startsWith("#prompts/")){ showCategory(decodeURIComponent(h.slice(9))); return; }
  if(!artView.hidden){ artView.hidden = true; mainEl.hidden = false; document.title = "AI MindSET · Practical AI for every team";
    let t=null; try{ t = h && document.querySelector(h); }catch{} if(t) setTimeout(()=>t.scrollIntoView(),0); }
}
addEventListener("hashchange", route);
route();
