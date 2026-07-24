// The Showcase: a stranger's copy of the book, fully written in, so the app
// can be shown off without revealing a single true record. Lives only in
// memory; nothing a visitor does is kept.

const ago = (days, hours = 0) =>
  new Date(Date.now() - days * 86400000 - hours * 3600000).toISOString()

export function makeDemoDb () {
  const P = {
    niranye: 'demo-niranye',
    torbjorn: 'demo-torbjorn',
    ambarys: 'demo-ambarys',
    suvaris: 'demo-suvaris',
    jora: 'demo-jora',
    viola: 'demo-viola'
  }

  return {
    version: 1,
    demo: true,
    people: [
      {
        id: P.niranye,
        name: 'Niranye',
        role: 'Altmer fence, market stall by day',
        allegiance: 'East Empire Company, so she claims',
        metAt: 'the Windhelm marketplace',
        createdAt: ago(41),
        notes: [
          { id: 'demo-n1', text: 'Owes the House four hundred septims for the shipment we let pass the docks unsearched. Due by Evening Star.', tags: ['debt'], createdAt: ago(3, 2) },
          { id: 'demo-n2', text: 'She moves stolen goods through a contact in the Gray Quarter she calls only the Apothecary. She does not know I have seen them together twice.', tags: ['secret'], createdAt: ago(9) },
          { id: 'demo-n3', text: 'Offered me information on the Shatter-Shield ledgers unprompted. Wants something. Watch what.', tags: ['favour'], createdAt: ago(17) }
        ],
        ties: [
          { id: 'demo-t1', personId: P.torbjorn, kind: 'debt', note: 'moves his unbooked cargo' },
          { id: 'demo-t2', personId: P.ambarys, kind: 'informant', note: 'drinks where she talks' }
        ]
      },
      {
        id: P.torbjorn,
        name: 'Torbjorn Shatter-Shield',
        role: 'Master of the docks, Clan Shatter-Shield',
        allegiance: 'Windhelm, old blood',
        metAt: 'the Palace of the Kings, at court',
        createdAt: ago(60),
        notes: [
          { id: 'demo-n4', text: 'Grief over his daughter makes him careless with his tongue at drink. Twice now he has spoken of the war levies before they were announced.', tags: ['secret'], createdAt: ago(6) },
          { id: 'demo-n5', text: 'Called me a Gray Quarter errand boy before the assembled court. He will learn what errands I run.', tags: ['threat'], createdAt: ago(21) },
          { id: 'demo-n6', text: 'His shipping manifests and his tax declarations do not agree. The difference winters in a warehouse he does not own on paper.', tags: ['secret', 'debt'], createdAt: ago(12) }
        ],
        ties: [{ id: 'demo-t3', personId: P.suvaris, kind: 'patron', note: 'she keeps his books' }]
      },
      {
        id: P.ambarys,
        name: 'Ambarys Rendar',
        role: 'Keeper of the New Gnisis Cornerclub',
        allegiance: 'The Gray Quarter',
        metAt: 'his own counter, over bitter sujamma',
        createdAt: ago(55),
        notes: [
          { id: 'demo-n7', text: 'Hears everything spoken under his roof and forgets none of it. Has traded me three true things for three favors. Fair dealing so far.', tags: ['ally', 'favour'], createdAt: ago(4, 5) },
          { id: 'demo-n8', text: 'Warned me the Butcher rumors were stirring the Quarter before the guard knew a thing.', tags: ['favour'], createdAt: ago(26) }
        ],
        ties: [{ id: 'demo-t4', personId: P.torbjorn, kind: 'enemy', note: 'an old grievance over the Quarter' }]
      },
      {
        id: P.suvaris,
        name: 'Suvaris Atheron',
        role: 'Clerk of the Shatter-Shield accounts',
        allegiance: 'Serves the old blood, belongs to the Quarter',
        metAt: 'the counting house, after hours',
        createdAt: ago(30),
        notes: [
          { id: 'demo-n9', text: 'Sees every manifest before Torbjorn does. Keeps her own copies, though she thinks no one knows.', tags: ['secret'], createdAt: ago(2, 8) },
          { id: 'demo-n10', text: 'Her brother speaks loudly against the Jarl at the Cornerclub. She pays for his tongue with her caution.', tags: ['secret'], createdAt: ago(14) }
        ],
        ties: [{ id: 'demo-t5', personId: P.ambarys, kind: 'kin', note: 'cousins, though neither says it' }]
      },
      {
        id: P.jora,
        name: 'Jora of Riften',
        role: 'Courier, or so her papers say',
        allegiance: 'Unknown. The papers are too clean.',
        metAt: 'the Candlehearth Hall, asking after me by name',
        createdAt: ago(8),
        notes: [
          { id: 'demo-n11', text: 'Asked the innkeep which nights I keep to my chambers. She was gone before I came down the stair.', tags: ['threat'], createdAt: ago(7, 12) },
          { id: 'demo-n12', text: 'Paid for her room with fresh-minted coin. Riften coin is never fresh.', tags: ['secret', 'threat'], createdAt: ago(5) }
        ],
        ties: []
      },
      {
        id: P.viola,
        name: 'Viola Giordano',
        role: 'Busybody of means',
        allegiance: 'Herself, loudly',
        metAt: 'everywhere; she cannot be avoided',
        createdAt: ago(50),
        notes: [
          { id: 'demo-n13', text: 'Knows every rumor in the city a day before it is true. Useful, if one can stand the delivery.', tags: ['ally'], createdAt: ago(11) }
        ],
        ties: [{ id: 'demo-t6', personId: P.jora, kind: 'rival', note: 'both hunt the same gossip' }]
      }
    ],
    journal: [
      {
        id: 'demo-j1',
        title: 'On the Matter of the Docks',
        day: 21, month: 'Frostfall', year: '4E 201',
        style: 'court',
        personIds: [P.niranye, P.torbjorn],
        createdAt: ago(3),
        body: 'The docks gave up their secret tonight, as I knew they must. Three crates marked for Solitude that will never see the Karth. I had Niranye watched from the moment the tide turned, and her man led me straight to the warehouse that Torbjorn keeps off his books.\n\nLet it be written plainly: the House does not yet know, and will not, until the knowing serves them. [[The warehouse sits behind the candlemaker on the second row, its key kept beneath the third stone.]] A secret spent is a secret gone. I will hold this one a while yet.\n\nTomorrow the Jarl holds court. I will stand at his shoulder and say nothing, as is my office. The Dark Cup is not filled in a day.'
      },
      {
        id: 'demo-j2',
        title: 'A Courier With Clean Papers',
        day: 16, month: 'Frostfall', year: '4E 201',
        style: 'field',
        personIds: [P.jora],
        createdAt: ago(8),
        body: 'A woman came to Candlehearth asking my name, and left before I could give it. Papers say Riften. Boots say she has not walked from Riften in a year.\n\nShe knows which stair I take. That is one more thing about me than I know about her, and I do not intend to leave the count uneven. [[I have set the boy Aval to watch the stables at dawn.]]\n\nIf someone has bought eyes in Windhelm, I will find the purse.'
      },
      {
        id: 'demo-j3',
        title: 'What the Cornerclub Keeps',
        day: 9, month: 'Frostfall', year: '4E 201',
        style: 'seal',
        personIds: [P.ambarys, P.suvaris],
        createdAt: ago(15),
        body: 'Sujamma loosens what mead never could. Ambarys poured, and I listened, and the Quarter spoke of levies, of grain, of a clerk who keeps two sets of books for the old blood.\n\nThe clerk is careful. Her copies are her surety against the day the Shatter-Shields need someone to blame. A wise woman. Wise enough, perhaps, to trade.\n\nI paid for the sujamma twice over and said nothing worth repeating. Let the room remember me as furniture. Furniture hears everything.'
      }
    ],
    cases: [
      {
        id: 'demo-c1',
        title: 'The Warehouse Accounts',
        personId: P.torbjorn,
        status: 'open',
        createdAt: ago(10),
        steps: [
          { id: 'demo-s1', type: 'contact', text: 'Shared a drink at Candlehearth and let him complain about the docks. Said nothing of what I know. He believes me a sympathetic ear.', witnesses: '', worldDate: '14th of Frostfall', createdAt: ago(10) },
          { id: 'demo-s2', type: 'warning', text: 'Mentioned, in passing, that the harbormaster has been asked to recount the winter manifests. Watched the color leave his face.', witnesses: 'Ambarys, from across the room', worldDate: '19th of Frostfall', createdAt: ago(5) },
          { id: 'demo-s3', type: 'pressure', text: 'A copy of one manifest page, the wrong one for him, left folded under his tankard. No note. None needed.', witnesses: '', worldDate: '21st of Frostfall', createdAt: ago(3) }
        ]
      },
      {
        id: 'demo-c2',
        title: 'The Matter of the Grain Cart',
        personId: P.viola,
        status: 'resolved',
        createdAt: ago(35),
        steps: [
          { id: 'demo-s4', type: 'contact', text: 'She had been telling half the city the House shorted the granary. Brought her honeyed wine and let her tell me too.', witnesses: '', worldDate: '2nd of Frostfall', createdAt: ago(35) },
          { id: 'demo-s5', type: 'mercy', text: 'Showed her the granary receipts, all of them true, and let her keep the story of how she uncovered the clerk who misread them.', witnesses: 'The steward', worldDate: '5th of Frostfall', createdAt: ago(32) },
          { id: 'demo-s6', type: 'resolution', text: 'She now tells half the city the House feeds Windhelm honestly. The other half will hear by Loredas.', witnesses: '', worldDate: '6th of Frostfall', createdAt: ago(31) }
        ]
      }
    ],
    poison: [
      { id: 'demo-d1', dateText: '2nd of Frostfall', dose: 1, unit: 'drops', effect: 'Nothing observed. As expected.', note: 'Patience.', createdAt: ago(22) },
      { id: 'demo-d2', dateText: '9th of Frostfall', dose: 2, unit: 'drops', effect: 'A tremor in the left hand at supper, blamed on the cold.', note: '', createdAt: ago(15) },
      { id: 'demo-d3', dateText: '14th of Frostfall', dose: 2, unit: 'drops', effect: 'No change. Holding steady.', note: '', createdAt: ago(10) },
      { id: 'demo-d4', dateText: '18th of Frostfall', dose: 3, unit: 'drops', effect: 'Pallor remarked upon by the cook. Appetite thinning.', note: 'The cook must be kept away from the kitchens on Loredas.', createdAt: ago(6) },
      { id: 'demo-d5', dateText: '21st of Frostfall', dose: 4, unit: 'drops', effect: 'Kept to his bed past midday. The healers speak of winter fever.', note: 'Ease off a week. Let the fever story settle.', createdAt: ago(3) }
    ],
    quicknotes: [
      { id: 'demo-q1', text: 'The courier from Riften asked after my chamber nights again. Third time. Find who pays her.', createdAt: ago(0, 5) },
      { id: 'demo-q2', text: 'Sujamma shipment short two casks. Ambarys suspects the new dock guard.', createdAt: ago(1, 3) },
      { id: 'demo-q3', text: 'The new dock guard drinks alone and pays in fresh-minted coin. Worth a look. Same coin as the courier?', createdAt: ago(0, 1) }
    ],
    updatedAt: new Date().toISOString()
  }
}
