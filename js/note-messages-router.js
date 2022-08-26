import { MIDI_COMMAND } from './enums.js'

export class NoteMessagesRouter {
    _activeNotes = [];
    _ignoredNotes = [];
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

    setRoute(message) {
        // Note on handler
        if (message.data[0] >= 144 && message.data[0] <= 159) {
            if (this._activeNotes.length >= this._maxPolyphony) {
                const oldNote = this._activeNotes[0];
                
                this._ignoredNotes.push(oldNote);
                oldNote.assignedChannel.isBusy = false;
                this._activeNotes.shift();

                setTimeout(() => this.setRoute(message));

                return {
                    ...oldNote,
                    assignedCommand: MIDI_COMMAND.NOTE_OFF
                };
            }

            const assignedChannel = this._channelList.find((ch) => ch.isUsed && !ch.isBusy);
            assignedChannel.isBusy = true;

            const currentNote = {
                message,
                assignedChannel,
                assignedCommand: MIDI_COMMAND.NOTE_ON
            }

            this._activeNotes.push(currentNote);

            return currentNote;
        }

        // Note off handler
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