import * as sonantx from './sonantX'
const bulletSound = require('./../../assets/bullet.json')

const audioCtx = new AudioContext()

let bulletBuffer:AudioBuffer;
sonantx.generateSong(bulletSound, audioCtx.sampleRate).then((audioBuffer: AudioBuffer) =>{bulletBuffer = audioBuffer})
export default function playBulletSound(){
    const audioBufferSource = audioCtx.createBufferSource()
    audioBufferSource.buffer = bulletBuffer;
    audioBufferSource.connect(audioCtx.destination)
    audioBufferSource.start()
}