// generate-pdf-pureblood.mjs: the pureblood addendum to the Yorvath Palefang
// whitelist application. Shares its typography with the main document via
// doc-theme.mjs.
// Run: node generate-pdf-pureblood.mjs
import { resolve } from 'path';
import { buildCss, sigil, renderPdf, BASE } from './doc-theme.mjs';

const OUT = resolve(BASE, 'Yorvath-Palefang-Pureblood-Addendum.pdf');

console.log('Embedding fonts and building HTML...');

const SIGIL = sigil({ ring: 'VOLKIHAR · PUREBLOOD · MOLAG BAL ·' });

const HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Yorvath Palefang: Pureblood Addendum</title>
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
    <div class="cover-sigil">${SIGIL}</div>
    <h1 class="cover-name">Yorvath Palefang</h1>
    <div class="cover-sub">Pureblood &nbsp;&bull;&nbsp; Gifted by Molag Bal &nbsp;&bull;&nbsp; 4E 185</div>
  </div>
  <div class="cover-bot">
    <div class="cover-rule"></div>
    <div class="cover-epigraph">
      &ldquo;The Prince didn&rsquo;t create a predator.<br>He recognized one, and made it eternal.&rdquo;
    </div>
  </div>
  <div class="cover-foot">
    <div class="cover-hair"></div>
    <div class="cover-foot-line">Addendum &nbsp;&bull;&nbsp; Pureblood Version</div>
  </div>
</div>

<!-- CONTENT -->
<table class="doc">
<thead><tr><td></td></tr></thead>
<tfoot><tr><td></td></tr></tfoot>
<tbody><tr><td>

  <div class="opening-note">
    Yo! So I wrote my main application as a turned Volkihar, mostly because I built it with the potential staff position in mind and didn't want to overreach on a rare slot. But I lowkey really want the Vampire Lord, so here's an altered version reframed as a pureblood, gifted directly by Molag Bal. You could honestly take both and judge the quality of the RP either way, the character's soul is the same, this just answers the questions where being a pureblood actually changes the answer. I've skipped the general lore questions here since those don't change, they're all answered in the main application. Happy to expand any of this if you want more.
  </div>

  <h2 class="sh">The Core Change: Pureblood, Gifted by Molag Bal</h2>

  <p>Yorvath is not turned. He was chosen, personally, by the God of Schemes himself.</p>
  <p>He was a mortal hunter once, the finest tracker of his age in the Pale, the man other hunters sent for when something in the dark was killing people and no one else could follow it. That's the part that matters, because it's <em>why</em> Molag Bal took an interest. The Prince of Domination watched a mortal who could sit motionless in the snow for a day and a night to take a single kill, a mortal who already thought the way a predator that lives forever must think: patient, cold, certain. Molag Bal does not gift the strong or the beautiful. He gifts the useful, the ones whose nature already serves his designs. He saw in Yorvath a hunter who would never stop hunting, and he made him a thing that never has to.</p>
  <p>The gift was not given freely and it was not given kindly. That is not the Lord of Coldharbour's way. Yorvath was taken, tested, and broken down in that grey realm before the blood was ever offered, made to understand exactly what he was becoming and exactly whose hand had made him. He came back to Nirn carrying the pure, undiluted blood of the source, and the certain knowledge that he had not been saved. He had been <em>acquired</em>.</p>
  <p>He has never once mistaken the gift for a reward. He knows precisely what he is: a tool of Molag Bal's, given eternity because eternity makes him a better instrument. That knowledge is the cold at the center of him.</p>

  <h2 class="sh">Why This Changes His Standing</h2>

  <p>As a pureblood he does not stand where the turned stand. He carries the direct blood, which places him high in the natural order of the court without him ever having to reach for it, and that suits him, because reaching is beneath a creature who was chosen by a Prince of Oblivion. He is not ambitious for a throne. A pureblood who was hand-picked by Molag Bal has nothing to prove to a court of the turned, and everything to prove to the one who made him.</p>
  <p>That's the interesting tension I want to play. His loyalty to Harkon is real but it is not his <em>deepest</em> loyalty. Underneath it sits the knowledge that he serves something far older and far worse than any Lord of a keep. He'll never say so. But it shapes everything.</p>

  <h2 class="sh">The Questions That Actually Change</h2>

  <div class="qa">
    <span class="qa-label">Why did Molag Bal choose your character?</span>
    <p class="qa-answer">For his patience and his nature as a hunter, not his strength or station. Molag Bal is the God of Schemes, and a schemer values an instrument that can wait, track, and strike without ever being seen doing it. Yorvath was a mortal who already lived that way. The Prince didn't create a predator. He recognized one, and made it eternal.</p>
  </div>
  <div class="qa">
    <span class="qa-label">Why a pureblood Lord rather than a turned vampire or lesser strain?</span>
    <p class="qa-answer">Because I want to play the weight of being <em>chosen</em>, and what that does to a creature over centuries. A turned vampire was made by an accident of another's hunger. A pureblood was selected, on purpose, by a Daedric Prince, and has to live with knowing why. That's a richer, colder character to inhabit, and it earns the rarity of the slot by making the pureblood status mean something in the roleplay rather than just being a power tier.</p>
  </div>
  <div class="qa">
    <span class="qa-label">What belief forged in mortal life survived the gift unchanged?</span>
    <p class="qa-answer">That patience is the only real power. He believed it as a mortal hunter in the snow, and Molag Bal chose him <em>for</em> it. It's the one thing about him the gift didn't have to change, because it was already exactly what the Prince wanted.</p>
  </div>
  <div class="qa">
    <span class="qa-label">Does your Lord carry guilt for what they are, or how they were made?</span>
    <p class="qa-answer">Not guilt. Something colder. He knows he was not saved but taken, that his eternity is a leash as much as a gift, and that the hand that made him can call the debt any time it wishes. He does not rage against it and he does not grieve it. He simply carries the knowledge, the way he carries everything, in silence, and lets it make him careful. A creature that knows it is owned does not waste itself on pride.</p>
  </div>
  <div class="qa">
    <span class="qa-label">His command of the Vampire Lord form?</span>
    <p class="qa-answer">Total, and closer to the source than any turned vampire could manage. As a pureblood the form is not a strain on him the way it is on the turned, it is nearer to his true nature, the shape Molag Bal's blood wants him to wear. He still almost never assumes it, for the same reason as ever: the patient hunter's art is ending things without showing the beast at all. But when he does, it is the real thing, undiluted, and older courts than Harkon's have learned to be quiet when the Pale Hunter stops holding it back.</p>
  </div>
  <div class="qa">
    <span class="qa-label">How does he view the turned members of the court?</span>
    <p class="qa-answer">Without contempt, which surprises them. He was mortal once and he remembers it, so he doesn't sneer at the turned the way some purebloods do. But he does not pretend they are his equals in blood, because they aren't, and pretending would insult everyone. He treats them as what they are: kin of a lesser making, useful, valued, and a step below the blood he carries. He's simply too old and too cold to be cruel about it.</p>
  </div>

  <h2 class="sh">Everything Else</h2>

  <p>The rest, the disciplines, the full lore knowledge, the scenarios, the in-character voice, all of it holds exactly as written in the main application. The patient hunter, the tracker, the &ldquo;power is being the last one still in it&rdquo; mindset, none of that changes with the blood. Being a pureblood just deepens it: now the patience isn't only a hunter's discipline, it's the patience of a thing that knows it will outlast even its own reasons for waiting, because a Prince of Oblivion made it to.</p>

  <div class="endmatter">
    <div class="closing">
      <p>So, take both versions. Judge the RP. Whichever slot you think fits best, turned or pureblood, staff role or Lord, I'll happily shape the character to match. The quality's there either way, and that's the part I actually care about.</p>
    </div>
    <div class="doc-colophon">Yorvath Palefang &nbsp;&bull;&nbsp; Pureblood Addendum &nbsp;&bull;&nbsp; Mereth RP &nbsp;&bull;&nbsp; 4E 185</div>
  </div>

</td></tr></tbody>
</table>

<!-- FINALE -->
<div class="monologue-page">
  <div class="mono-eyebrow">Coldharbour &nbsp;&bull;&nbsp; The Gift</div>
  <div class="mono-rule"></div>
  <div class="mono-pull">
    <p>He has never once mistaken the gift for a reward. He knows precisely what he is: a tool of Molag Bal's, given eternity because eternity makes him a better instrument.</p>
    <p>That knowledge is the cold at the center of him.</p>
  </div>
  <div class="mono-sign">Yorvath Palefang</div>
</div>

</body>
</html>`;

await renderPdf({ html: HTML, out: OUT, tmpName: '.yorvath-pureblood-tmp.html' });
console.log('\nTo regenerate: node generate-pdf-pureblood.mjs');
