import { MIDI_COMMAND } from '../constants.js'
import { MIDI_IMPLEMENTATION_LIST } from '../constants.js'
import { subscribeTo, unsubscribeFrom, emit } from '../subscription-tools.js'
import { isNoteOn, isNoteOff } from '../midi-utils.js'

/*
* [1] - is the place to overridden old notes - it make is possible ignore note-off messages 
* that were received, when the polyphony reached its limit:
*
* 
* [2] - it returns object with initial midi-message with some additional information:
* currentNote = {
*       assignedCommand: MIDI_COMMAND (see constants.js) - required,
*       assignedChannel: channel for modified midi message - optional,
*       message: received midi message - optional,
*       replaceableNote: reference for previously note - optional
* }
* */

export class NoteMessagesRouter {
    _activeNotes = [];
    _ignoredNotes = [];     // [1]
    _channelList = [];

    _channelListIsClearSub = 'channel-list-is-clear';
    
    _passOnlyNoteOff = false;
    
    constructor(updateChannelListSub) {
        subscribeTo(updateChannelListSub, (usedChannels) => this._initChannelsTable(usedChannels));
    }

    _initChannelsTable(usedChannels) {
        if (usedChannels.length === 0) {
            return;
        }

        const updatedList = [];

        usedChannels.forEach((el) => {
            updatedList.push({
                id: el.id,
                channelAlias: el.channel,
                noteOnCode: (MIDI_IMPLEMENTATION_LIST.find((code) => el.channel === code.channel)).noteOnCode,
                noteOffCode: (MIDI_IMPLEMENTATION_LIST.find((code) => el.channel === code.channel)).noteOffCode,
                isBusy: false,
            })
        });

        const modifyChannelList = () => {
            this._channelList = [...updatedList];
            this._passOnlyNoteOff = false;

            unsubscribeFrom(this._channelListIsClearSub);
        }
        
        if (this._channelList.find((ch) => ch.isBusy)) {
            this._passOnlyNoteOff = true;
            
            subscribeTo(this._channelListIsClearSub, modifyChannelList);
        } else {
            modifyChannelList();
        }
    }

    _noteOnHandler(message) {
        if (this._passOnlyNoteOff) {
            this._ignoredNotes.push({
                assignedCommand: MIDI_COMMAND.NOTE_ON,
                message
            });

            return { assignedCommand: MIDI_COMMAND.IGNORE };
        }
        
        let currentNote = {};
        if (this._activeNotes.length >= this._channelList.length) {
            const oldNote = this._activeNotes[0];

            this._ignoredNotes.push(oldNote);
            oldNote.assignedChannel.isBusy = false;
            this._activeNotes.shift();

            delete oldNote?.replaceableNote;
            delete oldNote.assignedCommand;

            currentNote = {
                replaceableNote: oldNote,
                assignedCommand: MIDI_COMMAND.REPLACE_NOTE
            };
        }

        const assignedChannel = this._channelList.find((ch) => !ch.isBusy);

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

    _noteOffHandler(message) {
        const ignoredNoteIndex = this._ignoredNotes.findIndex((note) => note.message.data[1] === message.data[1]);
        if (ignoredNoteIndex >= 0) {
            this._ignoredNotes.splice(ignoredNoteIndex, 1);
            return { assignedCommand: MIDI_COMMAND.IGNORE };
        }

        const currentNoteIndex = this._activeNotes.findIndex((note) => note.message.data[1] === message.data[1]);
        const currentNote = this._activeNotes[currentNoteIndex];

        currentNote.assignedChannel.isBusy = false;
        this._activeNotes.splice(currentNoteIndex, 1);

        if (this._activeNotes.length === 0 && this._passOnlyNoteOff) {
            emit(this._channelListIsClearSub);
        }
        
        return {
            ...currentNote,
            assignedCommand: MIDI_COMMAND.NOTE_OFF
        };
    }
    
    /*[2]*/
    setRoute(message) {
        if (this._channelList.length === 0) {
            return { assignedCommand: MIDI_COMMAND.IGNORE };
        }
        
        if (isNoteOn(message)) {
            return this._noteOnHandler(message);
        }
        
        if (isNoteOff(message)) {
            return this._noteOffHandler(message);
        }
    }
}