import { ignoreMessage, playNote } from './midi-utils.js';
import { NoteMessagesRouter } from './pseudo-polyphony/note-messages-router.js';
import { ChannelViewArea } from './pseudo-polyphony/channel-view-area.js';
import { ChannelViewWidget } from './pseudo-polyphony/channel-view-widget.js';
import { NotificationView } from './general/notification-view.js';
import { SUBSCRIPTION_DICTIONARY } from './constants.js'

const MIDI_INPUT_MENU = '#midi-input-menu';
const MIDI_OUTPUT_MENU = '#midi-output-menu';
const RELOAD_SOURCES_BUTTON = '#reload-sources-button';
const NOTIFICATION_PLACE = '#notification-place';

let midi = null;

let reloadSourcesButton = null;

let midiInList = [];
let midiInMenu = null;
let midiInput = null;

let midiOutList = [];
let midiOutMenu = null;
let midiOutput = null;

const noteMessagesRouter = new NoteMessagesRouter(SUBSCRIPTION_DICTIONARY.CHANNEL_SETTINGS_WAS_CHANGED);

initMidiSources();

initHtmlComponents();

function initHtmlComponents() {
    customElements.define('channel-view-area', ChannelViewArea);
    customElements.define('channel-view-widget', ChannelViewWidget);
    customElements.define('notification-view', NotificationView);
}

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
    
    if (!midiInput || midiInput.state === 'disconnected') {
        showNotification();
    } else {
        midiInput.onmidimessage = modifyMidiMessage;
    }
}

function changeMidiOut() {
    midiOutput = midiOutList.find((el) => el.id === midiOutMenu.value);

    if (!midiOutput || midiOutput.state === 'disconnected') {
        showNotification();
    }
}

function showNotification() {
    const notificationPlace = document.querySelector(NOTIFICATION_PLACE);
    const notification = document.createElement('notification-view');
    
    if (notificationPlace.hasChildNodes()) {
        return;
    }

    notificationPlace.append(notification)

    notification.close = () => notification.remove()

    notification.reloadAndClose = () => {
        initMidiSources();
        notification.remove();
    }
}

function modifyMidiMessage(message) {
    if (ignoreMessage(message)) {
        return;
    }

    const modifiedMessage = noteMessagesRouter.setRoute(message);
    playNote(modifiedMessage, midiOutput);
}