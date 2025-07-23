const notificationService = require('../services/notificationService');

const createNews = (req, res) => {
    const { title, content } = req.body;
    // In a real application, you would save the news to the database here.
    // For now, we'll just simulate the creation and send a notification.
    const newArticle = {
        id: Date.now().toString(), // Simple unique ID
        title,
        content,
        timestamp: new Date().toISOString()
    };

    notificationService.sendGeneralNotification(`New News Alert: ${title}`);
    res.status(201).send({ message: 'News created and notification sent.', article: newArticle });
};

module.exports = {
    createNews
};