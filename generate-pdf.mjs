// generate-pdf.mjs: Yorvath Palefang whitelist application PDF builder
// Run: node generate-pdf.mjs
import { resolve } from 'path';
import { buildCss, sigil, renderPdf, BASE } from './doc-theme.mjs';

const OUT = resolve(BASE, 'Yorvath-Palefang-Application.pdf');

console.log('Embedding fonts and building HTML...');

const SIGIL_SVG = sigil({ ring: 'VOLKIHAR \u00b7 INNER COURT \u00b7 4E 185 \u00b7' });

const HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Yorvath Palefang: Volkihar Vampire Lord Application</title>
<style>${buildCss()}</style>
</head>
<body>
<div class="page-bg"></div>

<!-- COVER -->
<div class="cover">
  <div class="cover-top">
    <div class="cover-eyebrow">Mereth RP &nbsp;&bull;&nbsp; Volkihar Vampire Lord Whitelist</div>
    <div class="cover-hair"></div>
  </div>
  <div class="cover-mid">
    <div class="cover-sigil">${SIGIL_SVG}</div>
    <h1 class="cover-name">Yorvath Palefang</h1>
    <div class="cover-sub">Ancient Turned &nbsp;&bull;&nbsp; Inner Court &nbsp;&bull;&nbsp; 4E 185</div>
  </div>
  <div class="cover-bot">
    <div class="cover-rule"></div>
    <div class="cover-epigraph">
      &ldquo;Power is not the strongest teeth in the room.<br>Power is being the last one still in it.&rdquo;
    </div>
  </div>
  <div class="cover-foot">
    <div class="cover-hair"></div>
    <div class="cover-foot-line">Submitted to the Court of Harkon &nbsp;&bull;&nbsp; Volkihar Keep</div>
  </div>
</div>

<!-- CONTENT -->
<table class="doc">
<thead><tr><td></td></tr></thead>
<tfoot><tr><td></td></tr></tfoot>
<tbody><tr><td>

  <div class="opening-note">
    Here is my application for Yorvath Palefang, an ancient turned Volkihar of Harkon's inner court. Everything is kept to 4E 185 canon: the Vigilants hunting our kind, the Dawnguard not yet reformed, the Tyranny of the Sun still only a whisper in the Keep. A note up front: I am applying as a <em>turned</em> Volkihar, not a pureblood. He is old and powerful, but I am not claiming Molag Bal's direct gift. Happy to adjust anything to fit the court as it already stands.
  </div>

  <h2 class="sh">Acknowledgment</h2>
  <p>I understand this is a new character and that I cannot retcon clan, bloodline, generation, or age of Embrace later. I understand Vampire Lords receive strict review for lore and political balance, and that purebloods are extremely limited, which is exactly why I am applying as turned rather than reaching for something I would have to force.</p>

  <h2 class="sh">Character Basics</h2>

  <div class="field">
    <span class="field-name">Name and other names across the centuries</span>
    <div class="field-val">Yorvath Palefang. His mortal name he has not spoken in centuries and will not. Other mouths have called him the Pale Hunter, the Cold Tracker, the Quiet One of the Keep, and in the mountain villages that still half-remember him, <em>the thing in the snow</em>. Palefang is the name he took for himself after the turning, and the only one he answers to now.</div>
  </div>
  <div class="field">
    <span class="field-name">Pureblood or turned</span>
    <div class="field-val">Turned. A member of the inner court by centuries of proven service, not by Molag Bal's direct gift. I would rather play a character who earned his place than one who claims a birthright he would spend the whole application defending.</div>
  </div>
  <div class="field">
    <span class="field-name">Mortal race and birthplace</span>
    <div class="field-val">Nord, born in the Pale, in a hard little hunting settlement on the edge of the Sea of Ghosts. A man of the snow long before the cold became the only thing he could stand.</div>
  </div>
  <div class="field">
    <span class="field-name">Born</span>
    <div class="field-val">2E 551.</div>
  </div>
  <div class="field">
    <span class="field-name">When and how he was turned</span>
    <div class="field-val">In the last century of the Second Era. As a mortal he was an aging master hunter and tracker, the man other hunters sent for when something in the dark was killing people. He followed one target all the way to its lair, which was the mistake: the thing he tracked was a Volkihar of the court, and it had let itself be followed. It had watched him hunt for weeks and decided his patience was worth keeping. It offered the turning. Yorvath, old and slowing and terrified of becoming useless, said yes with his eyes open. He has never pretended he was a victim. He chose it.</div>
  </div>
  <div class="field">
    <span class="field-name">Standing in Harkon's court</span>
    <div class="field-val">Ancient ally. Not a bloodline cousin, not a claimant to anything. He is the old, reliable blood a court like Harkon's is built on, respected for his age and his usefulness, trusted precisely because he has never once reached for a seat above his own. Harkon values him the way a king values a blade that has never turned in his hand.</div>
  </div>

  <h2 class="sh">Background &amp; Motivations</h2>

  <div class="qa">
    <span class="qa-label">Why his sire chose him</span>
    <p class="qa-answer">Not for beauty, bloodline, or magic. For patience. His sire had watched him sit motionless in the snow for a day and a night to take a single kill cleanly, and recognized what most mortals do not have and most young vampires never learn: the ability to wait. A creature that lives forever is worthless if it cannot be still. His sire saw a mortal who already thought in the long, cold, patient way undeath demands, and decided that was rarer than any noble line.</p>
  </div>
  <div class="qa">
    <span class="qa-label">Why a Volkihar Lord, and not a Cyrodiilic vampire, thrall, or spawn</span>
    <p class="qa-answer">Because the Volkihar are the oldest and proudest strain, the blood of Molag Bal's own court, and because I want to play the weight of centuries and real standing rather than a fledgling or a servant. A thrall is owned. A spawn is barely more than an animal. A Cyrodiilic vampire hides among mortals and weakens the more it feeds, a fascinating curse but not my story. The Volkihar are apex, feudal, ancient, and unapologetic, and Yorvath as an old turned Lord lets me play the discipline and the long game that make that court frightening instead of just edgy.</p>
  </div>
  <div class="qa">
    <span class="qa-label">The first time he fed to kill</span>
    <p class="qa-answer">Not long after the turning, and it was clumsy and too much. He took a shepherd on a mountain road meaning only to feed, and the new hunger took over and he drained the man dry before he understood what he was doing. What shook him was not the death, he had killed plenty as a hunter. It was how little the death meant to the thing he had become, and how good it felt. That kill set the rule that has governed every century since: control the hunger, or the hunger ends you. He fed sloppily once. Never again.</p>
  </div>
  <div class="qa">
    <span class="qa-label">How he stays relevant across the ages</span>
    <p class="qa-answer">By adapting quietly and never mistaking the past for the present. He has watched the Second Era end, the Empire rise, the Oblivion Crisis nearly unmake the world, the Great War, and now the Thalmor's slow poison, and the vampires who died in each upheaval were the ones who could not stop living in the age that made them. He refuses to be a relic. He learns each new century's shape before he acts. A hunter who tracks the same prey the same way every year eventually meets prey that learned. He never lets himself be that hunter.</p>
  </div>
  <div class="qa">
    <span class="qa-label">If a childe of his blood defied Harkon's law or court custom</span>
    <p class="qa-answer">He would deal with it himself, before Harkon had to. A childe's crime is the sire's failure, and Yorvath would treat it as his to answer. He would want to know why first, in private, because a childe breaking law usually means the sire taught them something wrong. But the judgment would be real and heavy, and if the law demanded the childe's ending, he would do it with his own hand rather than let the court see him flinch. He made the childe. He owns what the childe does.</p>
  </div>
  <div class="qa">
    <span class="qa-label">A mortal belief that survived every century unchanged</span>
    <p class="qa-answer">That patience is the only real power. He believed it as a mortal hunter sitting motionless in the snow, and undeath has only proven it a thousand times over. Everything else about him has changed. That one thing is bedrock. The patient thing outlasts the strong thing, always, given enough time, and he has nothing but time.</p>
  </div>
  <div class="qa">
    <span class="qa-label">The greatest mistake of his unlife, and what it cost</span>
    <p class="qa-answer">A century or two into the turning, he grew fond of a mortal woman in a coastal town, fond enough to let himself feel something like his old life. He told himself he was careful. He was not. A rival noticed the attachment and used her against him, took her, turned her badly, and left the ruined result for him to find. It cost him the last piece of his mortal heart, and taught him the lesson that has kept him cold and alive ever since: attachment is a handle other people grab you by. He has not let himself love anything since. He is not proud of that. It is just true.</p>
  </div>
  <div class="qa">
    <span class="qa-label">What centuries have taught him about mortals, power, and the gift</span>
    <p class="qa-answer">That mortals are not lesser, only briefer, and that forgetting he was one is the first step toward the stupidity that gets old vampires killed. That power is not strength: it is patience plus position, and the strong die young reaching for what the patient simply wait to inherit. And that the gift is a trade, not a prize: eternity in exchange for the sun, for warmth, for the ability to love a thing without it becoming a weapon. He took the trade. Most centuries he thinks it was worth it. Some nights he is not sure, and he is honest enough not to pretend otherwise.</p>
  </div>
  <div class="qa">
    <span class="qa-label">His philosophy on time and legacy</span>
    <p class="qa-answer">History is to be endured and quietly used, not hoarded or rewritten. He has watched vampires obsess over their own legends and it always kills them, because a creature in love with its own history stops watching the present that is about to end it. Yorvath keeps no monuments and tells no grand stories about himself. His legacy, if he has one, is simply that he is still here when so many louder, prouder, more legendary vampires are ash. Lasting is the only legacy that means anything. The rest is vanity that gets you hunted.</p>
  </div>
  <div class="qa">
    <span class="qa-label">Something about this new age he refuses to accept</span>
    <p class="qa-answer">The Thalmor. He understands them as a threat, patient and cruel and organized, and that framing is exactly his blind spot. He thinks of them as clever mortals who won a war and will eventually overreach and fall, the way clever mortals always do. What he refuses to grasp is that the Thalmor think in the long timescales he believed were the exclusive province of the immortal. He keeps waiting for them to be impatient. They will not be. That misjudgment may one day cost him everything.</p>
  </div>
  <div class="qa">
    <span class="qa-label">Has he ever truly regretted a kill</span>
    <p class="qa-answer">One. A young Vigilant, barely more than a boy, who had tracked Yorvath's line with real skill and real courage. Yorvath killed him cleanly and without hate, the way he would put down a dangerous animal, and only afterward realized the boy had reminded him of himself, the mortal hunter he had been, following something into the dark that would destroy him. He does not regret the necessity. He regrets that he felt nothing doing it, and that the nothing is what centuries have made of him.</p>
  </div>
  <div class="qa">
    <span class="qa-label">Does he carry guilt for what he is</span>
    <p class="qa-answer">Not guilt, exactly. He chose the turning with his eyes open, so he has no right to the innocence guilt requires. What he carries is heavier and quieter: the knowledge of what he traded away, and the discipline of never letting himself dwell on it, because a vampire who wallows in what he lost becomes either a monster or a martyr, and both get you killed. He works, he hunts, he serves the court, and he lets the cold do what the cold does.</p>
  </div>
  <div class="qa">
    <span class="qa-label">How he views younger vampires</span>
    <p class="qa-answer">With patience and a very cold eye. Fledglings burn bright and die fast, and he has watched enough of them get everyone around them hunted that he no longer learns their names until they have survived a decade. The feral strain he treats the way he would treat a rabid animal: no malice and no mercy, because a feral is a torch waiting to be lit under all of them. He respects exactly one thing in a young vampire: the capacity to wait. Almost none of them have it.</p>
  </div>
  <div class="qa">
    <span class="qa-label">His outlook on cattle and on mortals beyond the walls</span>
    <p class="qa-answer">The Keep's cattle he treats well, the way a good hunter treats good dogs: not from sentiment, from sense. Frightened cattle bolt and talk. Content cattle are quiet, healthy, and do not bring hunters to the door. Mortals beyond the walls he sees as prey and cover both: waste nothing, expose nothing, keep the long game in view. He has no interest in theatrical cruelty. Terror is loud, and loud is how courts die.</p>
  </div>

  <h2 class="sh">Disciplines, Lore &amp; The Gift</h2>

  <span class="qa-label">Primary powers and strengths</span>
  <ul class="ll">
    <li><span class="ll-name">The Vampire Lord form</span>Commanded with the control of centuries. He treats it as a hunter treats his heaviest weapon: drawn only when the kill demands it. He can assume the form at will and hold it far longer than a younger vampire, but almost never chooses to, because the patient hunter's whole art is ending things without ever showing the beast at all.</li>
    <li><span class="ll-name">Tracking and the hunt</span>His mortal mastery never left him. He is the finest tracker in the court, able to follow prey, rivals, or hunters across any ground and understand them before he strikes. This is his real signature: not raw power but the patient certainty of a hunter who always knows where you are.</li>
    <li><span class="ll-name">Blood magic</span>At the level long practice grants: drain, blood control, the raising of gargoyles and lesser servants.</li>
    <li><span class="ll-name">Necromancy</span>Competent but not his focus. The standard Volkihar command of death hounds and the risen dead.</li>
    <li><span class="ll-name">Court patience and intrigue</span>His deadliest skill. He waits, watches, remembers, and outlasts. Most of his victories were won by simply being present while louder rivals destroyed themselves.</li>
    <li><span class="ll-name">Martial skill</span>The practical, brutal fighting of a man who hunted dangerous things for a living. Not showy, just effective.</li>
  </ul>

  <div class="qa" style="margin-top:4mm;">
    <span class="qa-label">The major vampire bloodlines of Tamriel</span>
    <ul style="margin-top:1.5mm;">
      <li><strong>Volkihar:</strong> the Nordic strain, blood of Molag Bal's own court, oldest and proudest. Powerful, feudal, able to assume the Vampire Lord form. They grow stronger as they starve rather than weaker.</li>
      <li><strong>Cyrodiilic:</strong> blend among mortals and appear human when well-fed but grow more monstrous the more they feed. Masters of hiding in plain sight, lacking the Lord form.</li>
      <li><strong>Valenwood (Bosmer strain):</strong> bound up with their own traditions and the Green.</li>
      <li><strong>Black Marsh strains:</strong> Argonian-touched bloodlines with their own curses, far from the courtly Volkihar model.</li>
      <li><strong>High Rock / western strains:</strong> the Daggerfall-region clans, with distinct feeding customs and weaknesses.</li>
    </ul>
  </div>
  <div class="qa">
    <span class="qa-label">Five vampiric weaknesses, and how he manages them</span>
    <ul style="margin-top:1.5mm;">
      <li><strong>Sunlight.</strong> He simply never risks it, living by the hunter's discipline of knowing the ground and the hours, moving only in dark and deep. Centuries of never being caught at dawn is not luck, it is method.</li>
      <li><strong>Fire.</strong> He respects it the way he respects the Dawnguard: never underestimating it, keeping distance and exits, never fighting where fire can corner him.</li>
      <li><strong>The hunger and the starvation frenzy.</strong> He manages it with rigid feeding discipline, never gorging, never starving to the edge, holding the controlled middle where he is strong but never wild.</li>
      <li><strong>Detection by the faithful.</strong> He hides it with patience and cover: the well-kept cattle, the quiet feeding, the false trails. He knows exactly how trackers find things, and removes every sign before it can be followed.</li>
      <li><strong>His own attachments.</strong> He mitigates it by allowing himself none. A vampire with nothing to lose has no handle for an enemy to grab.</li>
    </ul>
  </div>
  <div class="qa">
    <span class="qa-label">Five factions or powers in 4E 185, as threat or opportunity</span>
    <ul style="margin-top:1.5mm;">
      <li><strong>The Vigilants of Stendarr:</strong> the active hunters of his kind in this age, disciplined, faithful, growing. The court's most immediate mortal threat.</li>
      <li><strong>The Thalmor:</strong> threat and possible opportunity both, patient and organized, but a power whose enemies could become the court's temporary friends.</li>
      <li><strong>The Empire and its weakened Legion:</strong> whose weakness creates the shadows a court thrives in.</li>
      <li><strong>Necromancers and Daedric cults of Skyrim:</strong> potential allies of convenience, potential rivals for the same dark corners.</li>
      <li><strong>The mortal holds and their Jarls:</strong> cattle-states, cover, and opportunity, the feeding grounds and shadows a patient court hides within.</li>
    </ul>
  </div>

  <h2 class="sh">Basic Knowledge</h2>

  <div class="qa">
    <span class="qa-label">Molag Bal and the origin of vampirism</span>
    <p class="qa-answer">Molag Bal is the Daedric Prince of Domination and Enslavement, lord of Coldharbour. He is the origin of vampirism: the first vampire was created when he defiled a mortal woman, and from that violation both the curse and the gift flow. Every vampire traces back to him in the end. The Volkihar are closest to that origin, the blood of his own dark court.</p>
  </div>
  <div class="qa">
    <span class="qa-label">The Daughter of Coldharbour rite</span>
    <p class="qa-answer">The rite by which a mortal woman becomes a pureblood vampire through Molag Bal himself, offering herself in Coldharbour and surviving his defilement to emerge gifted with his pure blood. It is the source of true pureblood status, the direct gift, as opposed to turned blood passed vampire to vampire. It is exceedingly rare, and it is why purebloods stand above the turned in the court's order.</p>
  </div>
  <div class="qa">
    <span class="qa-label">The prophecy of the Tyranny of the Sun</span>
    <p class="qa-answer">An ancient Volkihar prophecy, whispered in the Keep but not yet set in motion in 4E 185, promising that vampires could blot out the sun itself and end the tyranny it holds over their kind. It requires the blood of a Daughter of Coldharbour and the fabled Auriel's Bow. For now it is only a whisper, a promise and a temptation, not yet a plan.</p>
  </div>
  <div class="qa">
    <span class="qa-label">Pureblood vs turned</span>
    <p class="qa-answer">A pureblood is gifted directly by Molag Bal through the Daughter of Coldharbour rite, carrying his pure, undiluted blood. A turned member was made by another vampire passing on the blood, and however ancient or powerful they become, they remain a step removed from the direct gift. Yorvath is turned, and he knows exactly where that places him: part of why he has never reached above his station.</p>
  </div>
  <div class="qa">
    <span class="qa-label">A thrall, and the master-thrall obligations</span>
    <p class="qa-answer">A thrall is a mortal bound in service to a vampire, providing blood, labor, and loyalty. The obligations run both ways: the thrall owes obedience and their blood; the master owes protection and in the better courts a measure of care, because a well-kept thrall is loyal and quiet while an abused one runs or talks. The bond is feudal, a darker mirror of lord and servant.</p>
  </div>
  <div class="qa">
    <span class="qa-label">Volkihar vs Cyrodiilic, in power and weakness</span>
    <p class="qa-answer">The Volkihar grow stronger the longer they go without feeding, can assume the Vampire Lord form, and are tied to their frozen keep and Nordic tradition: apex predators who do not hide what they are. The Cyrodiilic appear fully human when well-fed and blend seamlessly among mortals, but grow more monstrous and vulnerable the more they feed, and they lack the Lord form. Volkihar are power and pride; Cyrodiilic are concealment and blending.</p>
  </div>
  <div class="qa">
    <span class="qa-label">The Vigilants of Stendarr, and why they matter in 4E 185</span>
    <p class="qa-answer">A militant order devoted to Stendarr, the God of Mercy, dedicated to hunting daedra, the undead, and abominations. In 4E 185 they matter enormously because the Dawnguard has not yet been reformed by Isran, which means the Vigilants are the primary active force hunting our kind. Faithful, disciplined, and spreading, they are the constant mortal threat that makes discipline and secrecy a matter of survival rather than preference.</p>
  </div>
  <div class="qa">
    <span class="qa-label">Sanguinare Vampiris vs the pureblood gift</span>
    <p class="qa-answer">Sanguinare Vampiris is the common vampiric disease, an infection that slowly turns its victim into a common vampire over a few days. It is how most vampires in Tamriel are made, producing lesser, ordinary vampires. The pureblood gift is entirely different: the direct blood of Molag Bal through the Daughter of Coldharbour rite. One is a sickness passed by accident; the other is a dark sacrament.</p>
  </div>
  <div class="qa">
    <span class="qa-label">Gargoyles, death hounds, and the wards of Volkihar Keep</span>
    <p class="qa-answer">Gargoyles are stone guardians animated by Volkihar blood magic, appearing lifeless until they wake to tear apart intruders. Death hounds are undead war-dogs, frost-touched and loyal, used to hunt and to guard. Together with skeletal servants, thralls, and the Keep's own frozen isolation, they form the layered defenses that have kept Volkihar Keep unbreached.</p>
  </div>
  <div class="qa">
    <span class="qa-label">Factions traditionally denied any standing in the court, and why</span>
    <ul style="margin-top:1.5mm;">
      <li><strong>The Dawnguard and vampire hunters (and the Vigilants of Stendarr):</strong> sworn to destroy us; no standing for those whose entire purpose is our ending.</li>
      <li><strong>Werewolves and the followers of Hircine:</strong> the ancient blood-enemy of vampire-kind.</li>
      <li><strong>Openly Stendarr- or Divines-faithful mortals:</strong> their faith is a weapon against us.</li>
      <li><strong>The feral strain and mindless spawn:</strong> beneath standing, dangerous, a liability.</li>
      <li><strong>Known servants of rival Daedric Princes hostile to Molag Bal:</strong> enemies at the root. A court that lets its natural predators inside its order does not survive to regret it.</li>
    </ul>
  </div>

  <h2 class="sh">Advanced Character Information</h2>

  <div class="qa">
    <span class="qa-label">The most ruthless thing he has done to hold his standing or silence a rival</span>
    <p class="qa-answer">He did not kill the rival. He was more patient than that. A younger, ambitious vampire had begun turning the court against him with whispers he could not answer without seeming to protest too much. So Yorvath did nothing, visibly, for years, and let the rival grow bold. Quietly, he tracked the rival's own secrets: an unsanctioned childe, a broken feeding law, a mortal lover kept against custom, and gathered every one. Then, at the moment the rival moved openly against him in the hall, Yorvath laid the evidence before the court all at once, calmly, and let the rival's own crimes do the killing. He never raised a hand. He simply waited until the rival had enough rope, and handed the court the noose.</p>
  </div>
  <div class="qa">
    <span class="qa-label">The most important lessons learned the hard way</span>
    <p class="qa-answer">That attachment is a handle enemies grab you by. That the loud and the proud die young, and the patient inherit what they reached for. That the past will kill you if you keep living in it. That mercy given to the wrong creature is paid for by better ones. And that the surest way to survive centuries is to never, ever be the most interesting thing in the room.</p>
  </div>
  <div class="qa">
    <span class="qa-label">A cabal of younger vampires gaining Harkon's favor at your expense: what do you do</span>
    <p class="qa-answer">Exactly what I described above, at scale. I do not panic and I do not move openly, that is what they want, and it is how an old vampire looks desperate and loses Harkon's regard. I wait. I let them overreach, because the ambitious and young always overreach. I learn each of them: who leads, who merely follows, what each actually wants, using the one thing they lack and I have in abundance: patience and the hunter's eye. The followers with real ability I quietly draw toward myself, offering the mentorship their hunger actually craves, peeling them off the leader one by one. The leader I let expose themselves, and when they do, I make sure Harkon sees it clearly, and sees just as clearly that I was the steady old blood who never flinched while the young ones schemed. You do not fight a cabal. You outlast it.</p>
  </div>
  <div class="qa">
    <span class="qa-label">Titles, reputations, and whispered names, and how he wields them</span>
    <p class="qa-answer">At court he is known simply as one of the old blood, the Pale Hunter, the tracker Harkon sends when something must be found and ended quietly. Among mortals he is a ghost story, <em>the thing in the snow</em>, a shape half-remembered and wholly feared. He wields the court reputation as quiet authority: he rarely speaks, so when he does it lands. He wields the mortal legend as cover: fear that keeps prey from looking too hard at the dark.</p>
    <p class="ooc">OOC: I will play this by keeping him deliberately understated, the vampire who says least in the room and misses nothing, and let other players' reactions build the reputation rather than announcing it myself. I will lean on the tracker/hunter identity as his signature so he is distinct from more overtly political or brutal Lords, and keep his menace in restraint rather than on display.</p>
  </div>
  <div class="qa">
    <span class="qa-label">If one of his own blood broke a sacred custom</span>
    <p class="qa-answer">He answers it himself, publicly and heavily, because a sire who lets his childe's crime slide teaches the whole court that his blood is undisciplined. He would not wait for Harkon to demand it. He would want the truth first, in private, but the judgment would be real, and if the custom demanded the childe's ending, he would do it with his own hand. His blood, his responsibility, his knife. That is the only way the court's law means anything, and the only way his own name stays clean.</p>
  </div>

  <h2 class="sh">Scenarios</h2>

  <div class="scenario">
    <span class="sc-num">Scenario One</span>
    <div class="sc-prompt">A younger vampire questions your authority in the great hall, in Harkon's hearing, calling you soft and too entangled with mortal affairs.</div>
    <p>He lets them finish. An old vampire who interrupts looks rattled, and Yorvath is never rattled. When they are done, he answers quietly, so the hall has to lean in to hear, which puts the room on his terms. He agrees with the surface of it: yes, he concerns himself with mortal affairs, because mortal affairs are where the Vigilants come from, where the cattle come from, where every threat to this court is born, and a Lord who ignores the mortal world wakes to find hunters at the gate.</p>
    <p>Then he turns the accusation into the young one's own trap, noting mildly that he has watched a great many young vampires call patience softness, and watched almost all of them die of the impatience they mistook for strength. He names none of them. He does not have to.</p>
    <p>Politically he does not punish the challenge: punishing open words would look weak. He answers it and lets the hall judge. The hall sees an ancient Lord who could not be shaken by a child. Personally he marks the young vampire and, patiently, learns whether this was foolish pride or the opening move of a faction. If pride, he may even mentor them: ambition turned to use. If a first move, they have shown their hand in open court for nothing, and Yorvath has all the time in the world.</p>
  </div>

  <div class="scenario">
    <span class="sc-num">Scenario Two</span>
    <div class="sc-prompt">A rival of another bloodline uncovers a stain from your past and threatens to bring it before Harkon's court unless you grant favor.</div>
    <p>First he finds out precisely what they have and whether it is true. If it is exaggerated or false, he calls the bluff and prepares to meet it in open court, where the truth is his oldest weapon and a Cyrodiilic lord's word against an ancient Volkihar's carries little weight.</p>
    <p>If it is true, he weighs it coldly: what does the favor cost, against what does the revelation cost. He does not simply pay: a blackmailer paid once returns hungrier, and centuries have taught him that. His instinct is to take the leverage away entirely by controlling the telling. If the old thing must surface, far better it surface from his own mouth, framed as he chooses, than as a rival's ambush. He might go to Harkon himself first and lay out the old sin as a thing long past and long since made useful to the court, robbing the rival of the weapon before it is raised.</p>
    <p>If the rival forces it, though, he is a tracker and a Volkihar Lord, and a Cyrodiilic wintering far from his own court, on Yorvath's frozen ground, is prey in the worst possible place to make an enemy of the thing in the snow.</p>
  </div>

  <div class="scenario">
    <span class="sc-num">Scenario Three</span>
    <div class="sc-prompt">A powerful figure outside the court offers a secret pact of mutual benefit.</div>
    <p>He neither accepts nor refuses in the moment, that is the trap. He hears the offer fully, gives nothing, and takes it away to weigh. Accepting openly risks everything with Harkon; a court runs on loyalty, and disloyalty smelled is disloyalty punished. Refusing outright makes an enemy who knows too much of the Keep.</p>
    <p>So he takes the patient third road: he manages the figure, keeping the channel open, giving nothing real, learning everything he can about what they actually want and actually know. And depending how dangerous the figure is, he may go to Harkon himself and reveal that the approach was made, framing himself as the loyal Lord who was tempted and came straight to his master. That single act turns a liability into proof of loyalty and puts Harkon's power behind whatever he does next.</p>
  </div>

  <div class="scenario">
    <span class="sc-num">Scenario Four</span>
    <div class="sc-prompt">A childe of your own making has broken sacred law, and Harkon demands their ending. The court watches.</div>
    <p>To Harkon, he does not argue. He acknowledges the law and acknowledges that the failure is his: the childe is his making, so the crime is his to answer. That alone raises him in Harkon's eyes: a Lord who owns his blood's failures instead of hiding from them.</p>
    <p>To the court, he sets the precedent deliberately: that Yorvath's blood is held to a harder standard than anyone's, not a softer one. A court that thinks his line gets special leniency will test him forever. He ends that thought before it starts.</p>
    <p>To the childe, in private first, he is not cold. He tells them the truth: that he sees himself in what they did, that the hunger they followed is the same one he followed once and barely survived. And then, because Harkon demanded it and because the law is the law, he does it himself, with his own hand, cleanly. He will not let another end his blood, and he will not let the court see him flinch. He carries it afterward the way he carries everything: in silence, in the cold, without letting it show.</p>
  </div>

  <div class="scenario">
    <span class="sc-num">Scenario Five</span>
    <div class="sc-prompt">Centuries ago Yorvath orchestrated the end of a small mortal settlement to hide his line's feeding grounds and destroy a rival coven in one stroke. Now a single survivor, since made a ghoul-thrall, has pieced the truth together and carries proof, whispering to the Vigilants, hunters, and Harpies within Harkon's own hall.</div>
    <p>He does not simply hunt the survivor down. Not out of mercy: out of understanding. He is a tracker. He knows a whisper already spreading is not silenced by one more body; it is confirmed by one. Kill the survivor clumsily now and the proof surfaces anyway, with a fresh corpse pointing straight at him.</p>
    <p>So he does the patient thing, the frightening thing. First he maps exactly how far the truth has spread and to whom, before he moves at all. The Vigilants and hunters who have heard it he handles as threats to be quietly ended or misdirected: false trails laid, the survivor's credibility poisoned, the proof made to look like the raving of a mad ghoul-thrall with a grudge. The Harpies in Harkon's hall are the real danger, and here he considers the boldest move: going to Harkon himself first, framing the whole ancient matter as a long-buried success now being twisted by a bitter survivor and rivals who would use it against a loyal Lord. Get ahead of it. Control the telling.</p>
    <p>And the survivor themselves? He tracks them, patiently, completely, and when he finally stands before them, it is not with rage. He looks at the ghoul-thrall that child became and feels the closest thing to regret he is capable of, because he made this. He does not apologize: he has no right to and would not insult them with it. He might even tell them the truth, plainly: yes, he did it, and yes, it was cold, and yes, he would likely do it again, because that is what he is. And then he does what the long dark of his unlife demands.</p>
    <p>The lesson: nothing is ever truly buried, so the only real safety is not in hiding a thing but in outlasting everyone who could ever remember it. He thought the ash was the end of it. The centuries taught him again that the patient thing always comes back, and that even he, the most patient thing in the snow, can be hunted by something that learned to wait as long as he has.</p>
  </div>

  <div class="endmatter">
    <div class="closing">
      <p>Thank you for reading all of it. Yorvath is built to be the patient, understated old blood of the court: loyal to the structure, no threat to the throne, there to make the Volkihar feel genuinely ancient and dangerous rather than young and loud. Happy to adjust anything to fit the court as it already stands, or to tie him to an existing Lord or bloodline if that helps the political balance.</p>
    </div>
    <div class="doc-colophon">Yorvath Palefang &nbsp;&bull;&nbsp; Volkihar Vampire Lord &nbsp;&bull;&nbsp; Mereth RP &nbsp;&bull;&nbsp; 4E 185</div>
  </div>

</td></tr></tbody>
</table>

<!-- THE LONG DARK -->
<div class="monologue-page">
  <div class="mono-eyebrow">In Character &nbsp;&bull;&nbsp; The Long Dark</div>
  <div class="mono-rule"></div>
  <div class="mono-body">
    <p class="drop-cap">The young ones ask me why I do not simply take what I want. They have teeth and centuries ahead of them and they cannot understand why an old blood sits so still.</p>
    <p>I was a hunter before I was this. I sat a full day and a night in the snow once, unmoving, to take a single elk cleanly, because the man who rushes the shot goes hungry and the man who waits eats. Nothing has changed. I have only traded the snow for the centuries.</p>
    <p>They see patience and call it weakness. They are wrong, and most of them will die of being wrong, and I will be standing in the hall when they are ash, the way I have stood while a hundred louder, prouder, hungrier things burned themselves out reaching for what I simply waited to inherit.</p>
    <p>Power is not the strongest teeth in the room. Power is being the last one still in it. I have buried empires. I have watched mortals mistake a war for the end of history. I am not in a hurry. I have never once, in all these centuries, been in a hurry.</p>
    <p>That is the gift they do not understand yet. Not the strength. Not the blood. The waiting. I can wait longer than you can live, longer than you can scheme, longer than your ambition can hold its breath. And when you have finally exhausted yourself, I will still be here, in the cold, exactly where I have always been, and I will not even have moved.</p>
  </div>
  <div class="mono-sign">Yorvath Palefang</div>
</div>


</body>
</html>`;

await renderPdf({ html: HTML, out: OUT, tmpName: '.yorvath-tmp.html' });
console.log('\nTo regenerate: node generate-pdf.mjs');
