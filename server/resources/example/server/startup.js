/// <reference types="@altv/types-server" />
import alt from 'alt-server';

const spawns = [
    { x: -1854.0791015625, y: 2068.707763671875, z: 141.09521484375 },
    { x: -1895.88134765625, y: 2040.7252197265625, z: 140.859375 },
    { x: -1887.217529296875, y: 2089.63525390625, z: 140.994140625 },
    { x: -1868.3209228515625, y: 2050.404296875, z: 140.977294921875 },
    { x: -1911.7978515625, y: 2083.134033203125, z: 140.3707275390625 },
    { x: -1868.017578125, y: 2118.989013671875, z: 132.2828369140625 },
    { x: -1799.5780029296875, y: 2119.305419921875, z: 133.2601318359375 },
    { x: -1874.874755859375, y: 1994.822021484375, z: 137.77587890625 },
    { x: -1908.14501953125, y: 1971.191162109375, z: 146.3524169921875 },
    { x: -1945.806640625, y: 2014.918701171875, z: 152.3846435546875 }
];
alt.log(`Deathmatch server started`);

let scores = {};
let globalTimer = '00:00';
let timerStarted = false;
let winner;

const startTimer = (duration) => {
    let timer = duration, minutes, seconds;
        setInterval(function () {
            minutes = parseInt((timer / 60).toString(), 10);
            seconds = parseInt((timer % 60).toString(), 10);

            minutes = minutes < 10 ? '0' + minutes : minutes;
            seconds = seconds < 10 ? '0' + seconds : seconds;
            if (--timer < 0) {
                if (Object.keys(scores).length === 0) winner = 'no one made a kill';
                else {
                    winner = scores[0];
                    Object.keys(scores).map((value)=> {
                        if (winner.kills < scores[value].kills) winner = scores[value];
                    })
                }
                alt.log(scores);
                if(winner === 'no one made a kill') alt.emitClient(null, 'winner', winner);
                else alt.emitClient(null, 'winner', winner.player.name);
                alt.Player.all.forEach(value => {
                    let sp = getSpawnPoint()
                    value.spawn(sp.x, sp.y, sp.z, 0);
                });
                setTimeout(() => {
                    alt.emitClient(null, 'winner', '');
                }, 10000)
                timerStarted = true;
                timer = 2 * 60;
                scores = {};

                return alt.emitClient(null, 'updateTimer','00:00');
            }
            globalTimer = minutes + ':' + seconds;
            return alt.emitClient(null, 'updateTimer', globalTimer);
        }, 1000);
}

alt.on('playerConnect', () => {
    if (!timerStarted) {
        if(alt.Player.all.length >= 2) {
            startTimer(2*60);
            timerStarted = true;
        } else {
            globalTimer = 'not enough players';
            alt.emitClient(null, 'updateTimer', globalTimer);
        }
    }
})



const getSpawnPoint = () => {
    return spawns[Math.floor(Math.random() * (spawns.length))];
}

const respawn = (player, killer) => {
    if (scores[player.id] === undefined) {
        scores[player.id] = {player, kills: 0, deaths: 1}
    } else {
        scores[player.id] = {player, kills: scores[player.id].kills, deaths: scores[player.id].deaths + 1}
    }
    const spawnpoint = getSpawnPoint();
    alt.emitClient(player, 'addDeath');
    player.spawn(spawnpoint.x, spawnpoint.y, spawnpoint.z, 2000);

    if(player === killer) {
        return;
    } else {
        alt.emitClient(killer, 'addKill');
        if (scores[killer.id] === undefined) {
            scores[killer.id] = {player: killer, kills: 1, deaths: 0}
        } else {
            scores[killer.id] = {player: killer, kills: scores[killer.id].kills + 1, deaths: scores[killer.id].deaths}
        }
    }

    console.log(player.name, killer.name, scores[player.id], scores[killer.id]);
}

alt.onClient('addKill', player => {
    console.log(player.name, scores[player.id]);
})

alt.on('playerDeath', respawn);

alt.on('playerConnect', (player) => {
    const spawnpoint = getSpawnPoint();
    player.model = `u_m_y_militarybum`;
    player.spawn(spawnpoint.x, spawnpoint.y, spawnpoint.z, 0);
    alt.log(`player ${player.id} with username ${player.name} connected`);
    player.giveWeapon(-1045183535, 100, true); // give revolver
    player.giveWeapon(-1074790547, 200, false); // give ak
    player.giveWeapon(-1813897027, 25, false); // give grenades
});
