import { ColorResolvable } from 'discord.js';
import { Colors } from './colors';
import { EmojiCharacters } from './emoji-characters';

export interface AudioProvider {
    emoji: string;
    file?: string;
    color: ColorResolvable;
}

export const YoutubeAudioProvider: AudioProvider = {
    emoji: 'Youtube',
    file: 'yt-logo.png',
    color: '#FF0000'
};

export const SoundcloudAudioProvider: AudioProvider = {
    emoji: 'Soundcloud',
    file: 'soundcloud-logo.png',
    color: '#FF8800'
};

export const LocalAudioProvider: AudioProvider = {
    emoji: EmojiCharacters.note,
    color: Colors.white
};
