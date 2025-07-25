console.log('editor.js loaded');
const fs = require('fs');
const path = require('path');
const upload = require('../../middleware/upload');
const { auth, authorize } = require('../../middleware/auth');
const express = require('express');
const router = express.Router();

const UPLOAD_DIR = './uploads'; // Relative to server.js
const NEWS_FILE = path.join(__dirname, 'news.json');
const ADS_FILE = path.join(__dirname, 'ads.json');

// Helper to read JSON data from a file
const readJsonFile = (filePath) => {
    if (!fs.existsSync(filePath)) {
        return [];
    }
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
};

// Helper to write JSON data to a file
const writeJsonFile = (filePath, data) => {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
};

// Helper to handle file uploads
const handleFileUpload = (req, res, next) => {
    upload(req, res, (err) => {
        if (err) {
            return res.status(400).json({ msg: err });
        }
        if (!req.file) {
            return res.status(400).json({ msg: 'No file selected' });
        }
        next();
    });
};

// News Endpoints
router.post('/news', auth, authorize(['editor', 'super_admin']), handleFileUpload, (req, res) => {
    const { title, content, author, category } = req.body;
    const image_url = req.file ? `/uploads/${req.file.filename}` : null;

    try {
        const news = readJsonFile(NEWS_FILE);
        const newId = news.length > 0 ? Math.max(...news.map(n => n.id)) + 1 : 1;
        const newArticle = {
            id: newId,
            title,
            content,
            author,
            category,
            image_url,
            published_at: new Date().toISOString()
        };
        news.push(newArticle);
        writeJsonFile(NEWS_FILE, news);
        res.status(201).json({ message: 'News created successfully', news: newArticle });
    } catch (err) {
        console.error('Error creating news:', err);
        res.status(500).send('Server Error');
    }
});

router.get('/news/:id', auth, authorize(['editor', 'super_admin']), (req, res) => {
    const { id } = req.params;
    try {
        const news = readJsonFile(NEWS_FILE);
        const newsItem = news.find(n => n.id === parseInt(id));
        if (newsItem) {
            res.status(200).json(newsItem);
        } else {
            res.status(404).send('News not found');
        }
    } catch (err) {
        console.error('Error fetching news:', err);
        res.status(500).send('Server Error');
    }
});

router.put('/news/:id', auth, authorize(['editor', 'super_admin']), handleFileUpload, (req, res) => {
    const { id } = req.params;
    const { title, content, author, category } = req.body;
    const image_url = req.file ? `/uploads/${req.file.filename}` : req.body.image_url_existing; // Allow updating or keeping existing image

    try {
        let news = readJsonFile(NEWS_FILE);
        const index = news.findIndex(n => n.id === parseInt(id));
        if (index !== -1) {
            news[index] = {
                ...news[index],
                title: title || news[index].title,
                content: content || news[index].content,
                author: author || news[index].author,
                category: category || news[index].category,
                image_url: image_url || news[index].image_url
            };
            writeJsonFile(NEWS_FILE, news);
            res.status(200).json({ message: 'News updated successfully', news: news[index] });
        } else {
            res.status(404).send('News not found');
        }
    } catch (err) {
        console.error('Error updating news:', err);
        res.status(500).send('Server Error');
    }
});

router.delete('/news/:id', auth, authorize(['editor', 'super_admin']), (req, res) => {
    const { id } = req.params;
    try {
        let news = readJsonFile(NEWS_FILE);
        const initialLength = news.length;
        news = news.filter(n => n.id !== parseInt(id));
        if (news.length < initialLength) {
            writeJsonFile(NEWS_FILE, news);
            res.status(200).send('News deleted successfully');
        } else {
            res.status(404).send('News not found');
        }
    } catch (err) {
        console.error('Error deleting news:', err);
        res.status(500).send('Server Error');
    }
});

// Ad Management Endpoints
router.post('/ads/image', auth, authorize(['editor', 'super_admin']), handleFileUpload, (req, res) => {
    const { name, target_url, start_date, end_date, placeholder } = req.body;
    const image_url = req.file ? `/uploads/${req.file.filename}` : null;

    try {
        const ads = readJsonFile(ADS_FILE);
        const newId = ads.length > 0 ? Math.max(...ads.map(a => a.id)) + 1 : 1;
        const newAd = {
            id: newId,
            name,
            type: 'image',
            image_url,
            target_url,
            start_date,
            end_date,
            status: 'active',
            placeholder
        };
        ads.push(newAd);
        writeJsonFile(ADS_FILE, ads);
        res.status(201).json({ message: 'Image ad created successfully', ad: newAd });
    } catch (err) {
        console.error('Error creating image ad:', err);
        res.status(500).send('Server Error');
    }
});

router.post('/ads/google', auth, authorize(['editor', 'super_admin']), (req, res) => {
    const { name, ad_unit_id, slot_id, start_date, end_date, placeholder } = req.body;
    try {
        const ads = readJsonFile(ADS_FILE);
        const newId = ads.length > 0 ? Math.max(...ads.map(a => a.id)) + 1 : 1;
        const newAd = {
            id: newId,
            name,
            type: 'google_adsense',
            ad_unit_id,
            slot_id,
            start_date,
            end_date,
            status: 'active',
            placeholder
        };
        ads.push(newAd);
        writeJsonFile(ADS_FILE, ads);
        res.status(201).json({ message: 'Google ad created successfully', ad: newAd });
    } catch (err) {
        console.error('Error creating Google ad:', err);
        res.status(500).send('Server Error');
    }
});

router.post('/ads/script', auth, authorize(['editor', 'super_admin']), (req, res) => {
    const { name, script_content, placement, start_date, end_date, placeholder } = req.body;
    try {
        const ads = readJsonFile(ADS_FILE);
        const newId = ads.length > 0 ? Math.max(...ads.map(a => a.id)) + 1 : 1;
        const newAd = {
            id: newId,
            name,
            type: 'custom_script',
            script_content,
            placement,
            start_date,
            end_date,
            status: 'active',
            placeholder
        };
        ads.push(newAd);
        writeJsonFile(ADS_FILE, ads);
        res.status(201).json({ message: 'Custom script ad created successfully', ad: newAd });
    } catch (err) {
        console.error('Error creating custom script ad:', err);
        res.status(500).send('Server Error');
    }
});

router.get('/ads/:id', auth, authorize(['editor', 'super_admin']), (req, res) => {
    const { id } = req.params;
    try {
        const ads = readJsonFile(ADS_FILE);
        const adItem = ads.find(a => a.id === parseInt(id));
        if (adItem) {
            res.status(200).json(adItem);
        } else {
            res.status(404).send('Ad not found');
        }
    } catch (err) {
        console.error('Error fetching ad:', err);
        res.status(500).send('Server Error');
    }
});

router.get('/ads', auth, authorize(['editor', 'super_admin']), (req, res) => {
    try {
        const ads = readJsonFile(ADS_FILE);
        res.status(200).json(ads);
    } catch (err) {
        console.error('Error fetching ads:', err);
        res.status(500).send('Server Error');
    }
});

router.put('/ads/:id', auth, authorize(['editor', 'super_admin']), handleFileUpload, (req, res) => {
    const { id } = req.params;
    const { name, target_url, start_date, end_date, status, ad_unit_id, slot_id, script_content, placement, placeholder } = req.body;
    const image_url = req.file ? `/uploads/${req.file.filename}` : req.body.image_url_existing; // Allow updating or keeping existing image

    try {
        let ads = readJsonFile(ADS_FILE);
        const index = ads.findIndex(a => a.id === parseInt(id));
        if (index !== -1) {
            ads[index] = {
                ...ads[index],
                name: name || ads[index].name,
                target_url: target_url || ads[index].target_url,
                start_date: start_date || ads[index].start_date,
                end_date: end_date || ads[index].end_date,
                status: status || ads[index].status,
                image_url: image_url || ads[index].image_url,
                ad_unit_id: ad_unit_id || ads[index].ad_unit_id,
                slot_id: slot_id || ads[index].slot_id,
                script_content: script_content || ads[index].script_content,
                placement: placement || ads[index].placement,
                placeholder: placeholder || ads[index].placeholder
            };
            writeJsonFile(ADS_FILE, ads);
            res.status(200).json({ message: 'Ad updated successfully', ad: ads[index] });
        } else {
            res.status(404).send('Ad not found');
        }
    } catch (err) {
        console.error('Error updating ad:', err);
        res.status(500).send('Server Error');
    }
});

router.delete('/ads/:id', auth, authorize(['editor', 'super_admin']), (req, res) => {
    const { id } = req.params;
    try {
        let ads = readJsonFile(ADS_FILE);
        const initialLength = ads.length;
        ads = ads.filter(a => a.id !== parseInt(id));
        if (ads.length < initialLength) {
            writeJsonFile(ADS_FILE, ads);
            res.status(200).send('Ad deleted successfully');
        } else {
            res.status(404).send('Ad not found');
        }
    } catch (err) {
        console.error('Error deleting ad:', err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;