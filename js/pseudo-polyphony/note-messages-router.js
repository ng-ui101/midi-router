import { MIDI_COMMAND } from '../enums.js'

/*
* [1] - is the place to overridden old notes - it make is possible ignore note-off messages 
* that were received, when the polyphony reached its limit:
*
* 
* [2] - it returns object with initial midi-message with some additional information:
* currentNote = {
*       assignedCommand: MIDI_COMMAND (see enums.js) - required,
*       assignedChannel: channel for modified midi message - optional,
*       message: received midi message - optional,
*       replaceableNote: reference for previously note - optional
* }
* 
* [3] - note on handler
* [4] - note off handler
* */

export class NoteMessagesRouter {
    _activeNotes = [];
    _ignoredNotes = [];     // [1]
    _channelList = [];
    _maxPolyphony = 0;
    
    constructor(allowedOutChannels) {
        this._maxPolyphony = allowedOutChannels.length;
        this._initChannelsTable(allowedOutChannels);
    }

    _initChannelsTable(allowedOutChannels) {
        for (let i = 0; i <= 15;) {
            this._channelList.push({
                noteOnCode: 144 + i, 
                noteOffCode: 128 + i,
                channelAlias: ++i,
                isUsed: !!allowedOutChannels.find((ch) => ch === i),
                isBusy: false,
            });
        }
        console.log(this._channelList);
    }

    /*[2]*/
    setRoute(message) {
        /*[3]*/
        if (message.data[0] >= 144 && message.data[0] <= 159) {
            let currentNote = {};
            
            if (this._activeNotes.length >= this._maxPolyphony) {
                const oldNote = this._activeNotes[0];
                
                this._ignoredNotes.push(oldNote);
                oldNote.assignedChannel.isBusy = false;
                this._activeNotes.shift();

                delete oldNote?.replaceableNote;
                delete oldNote.assignedCommand;
                
                currentNote = {
                    replaceableNote: oldNote,
                    assignedCommand: MIDI_COMMAND.REPLACE_NOTE
                }
            }

            const assignedChannel = this._channelList.find((ch) => ch.isUsed && !ch.isBusy);
            assignedChannel.isBusy = true;

            currentNote = {
                ...currentNote,
                message,
                assignedChannel,
                assignedCommand: currentNote?.assignedCommand || MIDI_COMMAND.NOTE_ON
            }

            this._activeNotes.push(currentNote);

            return currentNote;
        }

        /*[4]*/
        if (message.data[0] >= 128 && message.data[0] <= 143) {
            const ignoredNoteIndex = this._ignoredNotes.findIndex((note) => note.message.data[1] === message.data[1]);
            if (ignoredNoteIndex >= 0) {
                this._ignoredNotes.splice(ignoredNoteIndex, 1);
                return { assignedCommand: MIDI_COMMAND.IGNORE };
            }

            const currentNoteIndex = this._activeNotes.findIndex((note) => note.message.data[1] === message.data[1]);
            const currentNote = this._activeNotes[currentNoteIndex];

            currentNote.assignedChannel.isBusy = false;
            this._activeNotes.splice(currentNoteIndex, 1);

            return {
                ...currentNote,
                assignedCommand: MIDI_COMMAND.NOTE_OFF
            };
        }
    }
}