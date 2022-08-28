import { MIDI_COMMAND } from './constants.js'

/*
* [1] - in the future the rules may be:
* 
* const rules = {
*     allowedMidiInChannel: number[] / number,
*     allowedMidiOutChannel: number[] / number,
*     allowedControlChangeSource: [{
*         source: number,
*         range: number[]
*     }]
*     ...etc
* }
* 
* ignoreMessage(message, rules)
* 
* currently, it catches MIDI on / off messages:
* */

/*[1]*/
export function ignoreMessage(message, rules) {
    return !(message.data[0] >= 128 && message.data[0] <= 159);
}

export function playNote(note, midiOutput) {
    console.log(note)
    
    switch (note.assignedCommand) {
        case MIDI_COMMAND.NOTE_ON:
            note.message.data[0] = note.assignedChannel.noteOnCode;
            midiOutput.send(note.message.data);
            break;
        case MIDI_COMMAND.NOTE_OFF:
            note.message.data[0] = note.assignedChannel.noteOffCode;
            midiOutput.send(note.message.data);
            break;
        case MIDI_COMMAND.REPLACE_NOTE:
            note.replaceableNote.message.data[0] = note.replaceableNote.assignedChannel.noteOffCode;
            midiOutput.send(note.replaceableNote.message.data);

            note.message.data[0] = note.assignedChannel.noteOnCode;
            midiOutput.send(note.message.data);
            break;
        case MIDI_COMMAND.IGNORE:
        default:
            break;
    }
}
