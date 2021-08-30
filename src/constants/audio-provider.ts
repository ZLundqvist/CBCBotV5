import ResourceHandler from "../core/resource-handler";

interface AudioProvider {
    emoji: string;
    file?: string;
    color: string;
}

export const Youtube: AudioProvider = {
    emoji: 'Youtube',
    file: ResourceHandler.getImagePath('yt-logo.png'),
    color: '#FF0000'
};

export const Soundcloud: AudioProvider = {
    emoji: 'Soundcloud',
    file: ResourceHandler.getImagePath('soundcloud-logo.png'),
    color: '#FF8800'
};
