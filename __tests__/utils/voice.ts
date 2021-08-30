import * as voice from '../../src/utils/voice';
import Discord from 'discord.js';


describe('connect', () => {
    test('calls connect on voicechannel', () => {
        const mockedJoin = jest.fn();
        const mockedVC: jest.Mocked<Discord.VoiceChannel> = {} as any;
        mockedVC.join = mockedJoin;
        voice.connect(mockedVC);
        expect(mockedJoin).toHaveBeenCalledTimes(1);
        
    });
});

describe('disconnect', () => {
    test('disconnects from guild', () => {
        const mockedDisconnect = jest.fn();
    
        // Guild with connection
        const mockedGuild: jest.Mocked<Discord.Guild> = {
            voice: {
                connection: {
                    disconnect: mockedDisconnect
                }
            }
        } as any;
        voice.disconnect(mockedGuild);
        expect(mockedDisconnect).toHaveBeenCalledTimes(1);
    });

    test('does not disconnect to guild without voicestate', () => {
        const mockedDisconnect = jest.fn();

        // Guild with no voice
        const mockedGuild: jest.Mocked<Discord.Guild> = {
            voice: null
        } as any;
        voice.disconnect(mockedGuild);
        expect(mockedDisconnect).toHaveBeenCalledTimes(0);
    });

    test('does not disconnect to guild without connection', () => {
        const mockedDisconnect = jest.fn();

        const mockedGuild: jest.Mocked<Discord.Guild> = {
            voice: {
                connection: null
            }
        } as any;
        voice.disconnect(mockedGuild);
        expect(mockedDisconnect).toHaveBeenCalledTimes(0);
    });
});

describe('membersInMyVoiceChannel', () => {
    test('returns correct amount of members in channel', () => {
        const mockedGuild: jest.Mocked<Discord.Guild> = {
            voice: {
                channel: {
                    members: new Set(['bot'])
                }
            }
        } as any;
        expect(voice.membersInMyVoiceChannel(mockedGuild)).toBe(1);

        (<any>mockedGuild).voice = {
            channel: {
                members: new Set(['bot', 'one person', 'another one'])
            }
        };
        expect(voice.membersInMyVoiceChannel(mockedGuild)).toBe(3);
    });

    test('returns 0 in guild without channel', () => {
        const mockedGuild: jest.Mocked<Discord.Guild> = {
            voice: {
                channel: null
            }
        } as any;
    
        expect(voice.membersInMyVoiceChannel(mockedGuild)).toBe(0)
    });

    test('returns 0 in guild without voicestate', () => {
        const mockedGuild: jest.Mocked<Discord.Guild> = {
            voice: null
        } as any;
    
        expect(voice.membersInMyVoiceChannel(mockedGuild)).toBe(0)
    });
});


describe('connectIfAloneOrDisconnected', () => {
    test('connects if alone in channel', () => {
        const mockedJoin = jest.fn();
        const mockedVC: jest.Mocked<Discord.VoiceChannel> = {
            join: mockedJoin,
            guild: {
                voice: {
                    channel: {
                        members: new Set(['1'])
                    }
                }
            }
        } as any;
        voice.connectIfAloneOrDisconnected(mockedVC);
        expect(mockedJoin).toHaveBeenCalledTimes(1);
    });

    test('connects if no voicestate in guild', () => {
        const mockedJoin = jest.fn();    
        const mockedVC: jest.Mocked<Discord.VoiceChannel> = {
            join: mockedJoin,
            guild: {}
        } as any;
        voice.connectIfAloneOrDisconnected(mockedVC);
        expect(mockedJoin.mock.calls.length).toBe(1);
    });

    test('does not connect if not alone', () => {
        const mockedJoin = jest.fn();  
        const mockedVC: jest.Mocked<Discord.VoiceChannel> = {
            join: mockedJoin,
            guild: {
                voice: {
                    channel: {
                        members: new Set(['1', '2'])
                    }
                }
            }
        } as any;
        voice.connectIfAloneOrDisconnected(mockedVC);
        expect(mockedJoin.mock.calls.length).toBe(0);
    });
});

describe('inSameChannelAs', () => {
    test('returns false if not connected', () => {
        const mockedMember: jest.Mocked<Discord.GuildMember> = {
            guild: {
                voice: null
            }
        } as any;

        expect(voice.inSameChannelAs(mockedMember)).toBeFalsy();
    });

    test('return false if member is not connected', () => {
        const mockedMember: jest.Mocked<Discord.GuildMember> = {
            guild: {
                voice: {
                    connection: {}
                }
            },
            voice: {
                channel: null
            }
        } as any;

        expect(voice.inSameChannelAs(mockedMember)).toBeFalsy();
    });

    test('returns false if in different channels', () => {
        const mockedMember: jest.Mocked<Discord.GuildMember> = {
            guild: {
                voice: {
                    channel: {
                        id: '1'
                    }
                }
            },
            voice: {
                channel: {
                    id: '2'
                }
            }
        } as any;

        expect(voice.inSameChannelAs(mockedMember)).toBeFalsy();
    });

    test('returns true if in same channel', () => {
        const mockedMember: jest.Mocked<Discord.GuildMember> = {
            guild: {
                voice: {
                    channel: {
                        id: '1337'
                    }
                }
            },
            voice: {
                channel: {
                    id: '1337'
                }
            }
        } as any;

        expect(voice.inSameChannelAs(mockedMember)).toBeTruthy();
    });
});

describe('getVoiceUpdateType', () => {
    test('returns disconnect on disconnect', () => {
        const mockedOldState: jest.Mocked<Discord.VoiceState> = {
            channel: {}
        } as any;

        const mockedNewState: jest.Mocked<Discord.VoiceState> = {
            channel: null
        } as any;

        expect(voice.getVoiceUpdateType(mockedOldState, mockedNewState)).toBe('disconnect')
    });

    test('returns connect on connect', () => {
        const mockedOldState: jest.Mocked<Discord.VoiceState> = {
            channel: null
        } as any;

        const mockedNewState: jest.Mocked<Discord.VoiceState> = {
            channel: {}
        } as any;

        expect(voice.getVoiceUpdateType(mockedOldState, mockedNewState)).toBe('connect');
    });

    test('returns transfer on transfer', () => {
        const mockedOldState: jest.Mocked<Discord.VoiceState> = {
            channel: {}
        } as any;

        const mockedNewState: jest.Mocked<Discord.VoiceState> = {
            channel: {}
        } as any;

        expect(voice.getVoiceUpdateType(mockedOldState, mockedNewState)).toBe('transfer');
    });
});

describe('inVoiceChannel', () => {
    test('returns true if in voicechannel', () => {
        const mockedGuild: jest.Mocked<Discord.Guild> = {
            voice: {
                channel: {}
            }
        } as any;

        expect(voice.inVoiceChannel(mockedGuild)).toBeTruthy();
    });

    test('returns false if not in voicechannel', () => {
        let mockedGuild: jest.Mocked<Discord.Guild> = {
            voice: {
                channel: null
            }
        } as any;
        expect(voice.inVoiceChannel(mockedGuild)).toBeFalsy();

        mockedGuild = {
            voice: null
        } as any;
        expect(voice.inVoiceChannel(mockedGuild)).toBeFalsy();
    });
});

describe('isAlone', () => {
    test('returns true if alone', () => {
        let mockedGuild: jest.Mocked<Discord.Guild> = {
            voice: {
                channel: {
                    members: new Set(['bot'])
                }
            }
        } as any;

        expect(voice.isAlone(mockedGuild)).toBeTruthy();
    });

    test('returns false if not alone', () => {
        let mockedGuild: jest.Mocked<Discord.Guild> = {
            voice: {
                channel: {
                    members: new Set(['bot', 'another person'])
                }
            }
        } as any;

        expect(voice.isAlone(mockedGuild)).toBeFalsy();
    });
});

describe('disconnectIfAlone', () => {
    test('disconnects if alone', () => {
        const mockedDisconnect = jest.fn();

        let mockedGuild: jest.Mocked<Discord.Guild> = {
            voice: {
                channel: {
                    members: new Set(['bot'])
                },
                connection: {
                    disconnect: mockedDisconnect
                }
            }
        } as any;
        voice.disconnectIfAlone(mockedGuild);

        expect(mockedDisconnect).toHaveBeenCalledTimes(1);
    });

    test('does not disconnect if not alone', () => {
        const mockedDisconnect = jest.fn();

        let mockedGuild: jest.Mocked<Discord.Guild> = {
            voice: {
                channel: {
                    members: new Set(['bot', 'another one'])
                },
                connection: {
                    disconnect: mockedDisconnect
                }
            }
        } as any;
        voice.disconnectIfAlone(mockedGuild);

        expect(mockedDisconnect).toHaveBeenCalledTimes(0);
    });
});


