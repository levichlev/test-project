/// <reference types="@altv/types-client" />
/// <reference types="@altv/types-natives" />
import alt from 'alt-client';
import * as native from 'natives';

let serverTimer = '00:00';
let serverScores = '';

const drawText = (
    msg,
    x,
    y,
    scale,
    fontType,
    r,
    g,
    b,
    a,
    useOutline = true,
    useDropShadow = true,
    layer = 0,
    align = 0
) => {
  let hex = msg.match('{.*}');
  if (hex) {
    const rgb = hexToRgb(hex[0].replace('{', '').replace('}', ''));
    r = rgb[0];
    g = rgb[1];
    b = rgb[2];
    msg = msg.replace(hex[0], '');
  }

  native.beginTextCommandDisplayText('STRING');
  native.addTextComponentSubstringPlayerName(msg);
  native.setTextFont(fontType);
  native.setTextScale(1, scale);
  native.setTextWrap(0.0, 1.0);
  native.setTextCentre(true);
  native.setTextColour(r, g, b, a);
  native.setTextJustification(align);

  if (useOutline) {
    native.setTextOutline();
  }

  native.endTextCommandDisplayText(x,y);
  native.clearDrawOrigin();
}


let totalKills = 0;
let totalDeaths = 0;




alt.log(`You connected! Nice!`);


alt.everyTick(() => {
  native.restorePlayerStamina(alt.Player.local.scriptID, 100);
  drawText(serverTimer, 0.5, 0.03, 0.4, 4, 255, 255, 255, 255);
  drawText(`Kills: ${totalKills}`.toUpperCase(), 0.1, 0.03, 0.4, 4, 255, 255, 255, 255);
  drawText(`Deaths: ${totalDeaths}`.toUpperCase(), 0.2, 0.03, 0.4, 4, 255, 255, 255, 255);
  if (serverScores !== '') drawText('Winner is ' + serverScores, 0.5, 0.05, 0.4, 4, 255, 255, 255, 255);
})

alt.on('consoleCommand', (command) => {
  if (command === 'pos') {
    alt.log(alt.Player.local.pos,  alt.Player.local.aimPos);
  }
});

alt.on('playerDeath', player => {
  alt.onServer('drawNotification', drawNotification)
});

alt.onServer('addKill', () => {
  alt.emitServer('addKill');
  totalKills += 1;
});

alt.onServer('addDeath', () => {
  totalDeaths += 1;
});


alt.onServer('updateTimer', (globalTimer) => {
  serverTimer = globalTimer
  alt.log('client', serverTimer);
})

alt.onServer('winner', winner => {
  serverScores = winner;
  totalKills = 0;
  totalDeaths = 0;
})

