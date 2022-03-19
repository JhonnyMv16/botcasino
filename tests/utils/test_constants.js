const TABLES_TO_BET = [
    {
      name: 'Quantum Roulette Live',
      min: '1',
      max: '10,000',
      history: [
        24, 36, 6, 36, 24,
         8, 27, 0,  6, 15
      ],
      className: 'lobby-table__wrapper',
      index: 0
    },
    {
      name: 'Roulette',
      min: '2.50',
      max: '10,000',
      history: [
        3,  1,  3,  1, 11,
        4, 25, 35, 17, 13
      ],
      className: 'lobby-table__wrapper',
      index: 1
    }
]

const TABLE_STATE_DEFAULT = {
    balance: 0,
    canBet: false,
    history: [
        31, 2, 22, 7,
        16, 6, 1, 35,
        2, 14, 26, 0
    ]
}

const TABLE_BET_POINTS = {
    c1: { name: 'Coluna 1', x: 555.2301025390625, y: 451.1864318847656 },
    c2: { name: 'Coluna 2', x: 555.2301025390625, y: 431.22314453125 },
    c3: { name: 'Coluna 3', x: 555.2301025390625, y: 411.2598571777344 },
    db: { name: 'Dúzia baixa', x: 341.68646240234375, y: 470.15496826171875 },
    dm: { name: 'Dúzia média', x: 419.374755859375, y: 470.15496826171875 },
    da: { name: 'Dúzia alta', x: 501.3912048339844, y: 470.15496826171875 },
    minBtn: { name: 'Botão 2.5', x: 606.65625, y: 513.4813232421875 }
}

module.exports = {
    TABLES_TO_BET,
    TABLE_STATE_DEFAULT,
    TABLE_BET_POINTS
}