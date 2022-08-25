const MIDI_INPUT_MENU = '#midi-input-menu';
const MIDI_OUTPUT_MENU = '#midi-output-menu';
const MAX_POLYPHONY = 4;

let midi = null;

let midiInList = [];
let midiInMenu = null;
let midiInput = null;

let midiOutList = [];
let midiOutMenu = null;
let midiOutput = null;

const activeNotes = [];
const overriddenNotes = [];
const channelList = [];

//////
initChannelList()

initMidiSources();
////////

function initChannelList() {
    for (let i = 0; i <= 15; i++) {
        channelList.push({channel: 1 + i, isUsed: i < MAX_POLYPHONY, isBusy: false, noteOnCode: 144 + i, noteOffCode: 128 + i});
    }
    console.log(channelList);
}

function initMidiSources() {
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

    initMidiOutList(outputs);
    initMidiInList(inputs);
}

function onMIDIFailure(msg) {
    console.warn("Failed to get MIDI access - " + msg);
}

function initMidiOutList(outputs) {
    midiOutList = [];
    midiOutMenu = midiOutMenu || document.querySelector(MIDI_OUTPUT_MENU);

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
    midiInMenu = midiInMenu || document.querySelector(MIDI_INPUT_MENU);

    for (const input of inputs) {
        const option = document.createElement('option');
        option.innerText = input.name || 'unknown';
        option.value = input.id;

        midiInMenu.appendChild(option);

        midiInList.push(input);
    }

    changeMidiIn();
}

function changeMidiOut() {
    midiOutput = midiOutList.find((el) => el.id === midiOutMenu.value);
    console.log(midiOutput);
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

function modifyMidiMessage(message) {
    if (ignoreMessage(message)) {
        return;
    }

    changeMidiChannel(message);
    
    midiOutput.send(message.data)
}

function ignoreMessage(message) {
    // currently, it catches MIDI on / off messages:
    return !(message.data[0] >= 128 && message.data[0] <= 159);
}

function changeMidiChannel(message) {
    // Note on
    if (message.data[0] >= 144 && message.data[0] <= 159) {
        if (activeNotes.length >= MAX_POLYPHONY) {
            playNoteOff(activeNotes[0]);
            overriddenNotes.push(activeNotes[0]);
            activeNotes[0].channel.isBusy = false;
            activeNotes.shift();
        }

        const channel = channelList.find((ch) => ch.isUsed && !ch.isBusy);
        channel.isBusy = true;

        const currentNote = {
            message,
            channel
        }

        activeNotes.push(currentNote);

        playNoteOn(currentNote);
    }

    // Note off
    if (message.data[0] >= 128 && message.data[0] <= 143) {
        const overriddenNoteIndex = overriddenNotes.findIndex((note) => note.message.data[1] === message.data[1]);
        if (overriddenNoteIndex >= 0) {
            overriddenNotes.splice(overriddenNoteIndex, 1);
            return;
        }

        const currentNoteIndex = activeNotes.findIndex((note) => note.message.data[1] === message.data[1]);
        const currentNote = activeNotes[currentNoteIndex];
        
        currentNote.channel.isBusy = false;
        activeNotes.splice(currentNoteIndex, 1);
        
        playNoteOff(currentNote);
    }
}

function playNoteOn(currentNote) {
    const outputNote = currentNote.message.data;
    outputNote[0] = currentNote.channel.noteOnCode;
    midiOutput.send(outputNote);
}

function playNoteOff(currentNote) {
    const outputNote = currentNote.message.data;
    outputNote[0] = currentNote.channel.noteOffCode;
    midiOutput.send(outputNote);
}