let io;

const init = (socketIoInstance) => {
    io = socketIoInstance;
};

const sendLiveScoreUpdate = (match) => {
    if (io) {
        io.emit('liveScoreUpdate', match);
        console.log(`Emitted liveScoreUpdate for match ${match.id}`);
    }
};

const sendGeneralNotification = (message) => {
    if (io) {
        io.emit('generalNotification', { message });
        console.log(`Emitted generalNotification: ${message}`);
    }
};

module.exports = {
    init,
    sendLiveScoreUpdate,
    sendGeneralNotification
};