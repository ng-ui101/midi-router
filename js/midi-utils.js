import { MIDI_COMMAND } from './enums.js'

export function ignoreMessage(message, rules) {
    /*
    in the future the rules may be:
    
    const rules = {
        allowedMidiInChannel: number[] / number,
        allowedMidiOutChannel: number[] / number,
        allowedControlChangeSource: [{
            source: number,
            range: number[]
        }]
        ...etc
    }
    
    ignoreMessage(message, rules)
    
    currently, it catches MIDI on / off messages:
    */
    return !(message.data[0] >= 128 && message.data[0] <= 159);
}

export function playNote(note, midiOutput) {
    const outputNote = { ...note };
    console.log(outputNote)
    
    switch (note.assignedCommand) {
        case MIDI_COMMAND.NOTE_ON:
            outputNote.message.data[0] = note.assignedChannel.noteOnCode;
            midiOutput.send(outputNote.message.data);
            break;
        case MIDI_COMMAND.NOTE_OFF:
            outputNote.message.data[0] = note.assignedChannel.noteOffCode;
            midiOutput.send(outputNote.message.data);
            break;
        case MIDI_COMMAND.IGNORE:
        default:
            break;
    }
}
