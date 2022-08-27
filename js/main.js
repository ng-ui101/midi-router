import { ignoreMessage, playNote } from './midi-utils.js';
import { NoteMessagesRouter } from './pseudo-polyphony/note-messages-router.js';
import { ChannelViewArea } from './pseudo-polyphony/channel-view-area.js';
import { ChannelViewWidget } from './pseudo-polyphony/channel-view-widget.js';

const MIDI_INPUT_MENU = '#midi-input-menu';
const MIDI_OUTPUT_MENU = '#midi-output-menu';
const RELOAD_SOURCES_BUTTON = '#reload-sources-button';

let midi = null;

let reloadSourcesButton = null;

let midiInList = [];
let midiInMenu = null;
let midiInput = null;

let midiOutList = [];
let midiOutMenu = null;
let midiOutput = null;

const noteMessagesRouter = new NoteMessagesRouter([1, 2, 3, 4]);

initMidiSources();

customElements.define('channel-view-area', ChannelViewArea);
customElements.define('channel-view-widget', ChannelViewWidget);


function initMidiSources() {
    if (!reloadSourcesButton) {
        reloadSourcesButton = document.querySelector(RELOAD_SOURCES_BUTTON);
        reloadSourcesButton.onclick = initMidiSources;
    }
    
    navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);

    midiInList = [];
    !midiInput?.onmidimessage || (midiInput.onmidimessage = null);
    midiInput = null;

    midiOutList = [];
    midiOutput = null;

    const findOptions = (id) => document.querySelectorAll(`${id} option`)

    !midiInMenu || findOptions(MIDI_INPUT_MENU).forEach((option) => midiInMenu.removeChild(option));
    !midiOutMenu || findOptions(MIDI_OUTPUT_MENU).forEach((option) => midiOutMenu.removeChild(option));
}

function onMIDISuccess(midiAccess) {
    console.log("MIDI is ready!");
    midi = midiAccess;

    const outputs = midiAccess.outputs.values();
    const inputs = midiAccess.inputs.values();

    initMidiInList(inputs);
    initMidiOutList(outputs);
}

function onMIDIFailure(msg) {
    console.warn("Failed to get MIDI access - " + msg);
}

function initMidiOutList(outputs) {
    midiOutList = [];

    if (!midiOutMenu) {
        midiOutMenu = document.querySelector(MIDI_OUTPUT_MENU);
        midiOutMenu.onchange = changeMidiOut;
    }

    for (const output of outputs) {
        const option = document.createElement('option');
        option.innerText = output.name || 'unknown';
        option.value = output.id;

        midiOutMenu.appendChild(option);

        midiOutList.push(output);
    }

    changeMidiOut();
}

function initMidiInList(inputs) {
    midiInList = [];
    
    if (!midiInMenu) {
        midiInMenu = document.querySelector(MIDI_INPUT_MENU);
        midiInMenu.onchange = changeMidiIn;
    }

    for (const input of inputs) {
        const option = document.createElement('option');
        option.innerText = input.name || 'unknown';
        option.value = input.id;

        midiInMenu.appendChild(option);

        midiInList.push(input);
    }

    changeMidiIn();
}

function changeMidiIn() {
    !midiInput?.onmidimessage || (midiInput.onmidimessage = null);

    midiInput = midiInList.find((el) => el.id === midiInMenu.value);
    console.log(midiInput);

    try {
        midiInput.onmidimessage = modifyMidiMessage;
    } catch (e) {
        //TODO: change notification and re-init midi
        //TODO: try to catch onstatechange
        alert('MIDI controller was inserted! Please, reconnect your device and try again!')
    }
}

function changeMidiOut() {
    midiOutput = midiOutList.find((el) => el.id === midiOutMenu.value);
    console.log(midiOutput);
}

function modifyMidiMessage(message) {
    if (ignoreMessage(message)) {
        return;
    }

    const modifiedMessage = noteMessagesRouter.setRoute(message);
    playNote(modifiedMessage, midiOutput);
}