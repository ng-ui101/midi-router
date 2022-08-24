const MIDI_INPUT_MENU = '#midi-input-menu';
const MIDI_OUTPUT_MENU = '#midi-output-menu';

let midi = null;

let midiInList = [];
let midiInMenu = null;
let midiInput = null;

let midiOutList = [];
let midiOutMenu = null;
let midiOutput = null;

//////

initMidiSources();

////////

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
        midiInput.onmidimessage = playNote;
    } catch (e) {
        //TODO: change notification and re-init midi
        alert('MIDI controller was inserted! Please, reconnect your device and try again!')
    }
}

function playNote(message) {
    console.log(message.data);
    midiOutput.send(message.data)
}
