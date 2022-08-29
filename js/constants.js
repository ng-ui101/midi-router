export const MIDI_COMMAND = {
    NOTE_ON: 'midi-on',
    NOTE_OFF: 'midi-off',
    REPLACE_NOTE: 'replace-note',
    IGNORE: 'ignore'
}

export const SUBSCRIPTION_DICTIONARY = {
    CHANNEL_SETTINGS_WAS_CHANGED: 'channel-settings-was-changed',
    NOTE_WAS_PLAYED: 'note-was-played',
    NOTE_WAS_RELEASED: 'note-was-released',
}

export const MIDI_IMPLEMENTATION_LIST = [];

for (let i = 0; i <= 15;) {
    MIDI_IMPLEMENTATION_LIST.push({
        noteOnCode: 144 + i,
        noteOffCode: 128 + i,
        channel: ++i,
    });
}
