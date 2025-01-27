const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

let userTypeViewCountPath = path.join(__dirname, 'segmentationUsertype.json');
let eventsViewCountPath = path.join(__dirname, 'segmentationEvent.json');

const readJsonFile = (filePath) => {
return new Promise((resolve, reject) => {
fs.readFile(filePath, 'utf8', (err, data) => {
if (err) {
return reject(err);
}
resolve(JSON.parse(data));
});
});
};

const writeJsonFile = (filePath, data) => {
return new Promise((resolve, reject) => {
fs.writeFile(filePath, JSON.stringify(data, null, 2), (err) => {
if (err) {
return reject(err);
}
resolve();
});
});
};

app.get('/api/segmentation_usertype', async (req, res) => {
const userType = req.query.userType;
let clickCounts = await readJsonFile(userTypeViewCountPath);
if (clickCounts[userType] !== undefined) {
clickCounts[userType]++;
try {
await writeJsonFile(path.join(__dirname, 'segmentationUsertype.json'), clickCounts);
return res.json({ message: 'Click recorded', clickCount: clickCounts[userType] });
} catch (err) {
return res.status(500).send('Error writing to file');
}
} else {
return res.status(400).send('Invalid user type');
}
});

app.get('/api/segmentation_event', async (req, res) => {

 const eventId = req.query.eventId;
 const eventTitle = req.query.title;   
  try {
        let eventsData = await readJsonFile(eventsViewCountPath);
        
        if (!Array.isArray(eventsData)) {
            eventsData = [];
        }
        let event = eventsData.find(e => e.id === eventId);

        if (event) {
            event.views += 1;
        } else {
            event = {
                id: eventId,
                name: eventTitle,
                views: 1
            };
            eventsData.push(event); 
        }

        await writeJsonFile(eventsViewCountPath, eventsData);
        console.log('Data updated successfully.');

    } catch (error) {
        console.error('Error updating event view count:', error);
    }


});

app.get('/api/get_data', async (req, res) => {
 const userType = req.query.userType;
 const page = parseInt(req.query.page) || 0;

 try {
 const data = await readJsonFile(path.join(__dirname, 'data.json'));
 const sortedData = data.sort((a, b) => a.id - b.id);
 const filteredData = sortedData.filter(item => item.userType === userType);

 const startIndex = page * 10;
 const endIndex = startIndex + 10;
 const paginatedData = filteredData.slice(startIndex, endIndex);

 return res.json(paginatedData);
 } catch (err) {
 return res.status(500).json({ error: 'Failed to read the data.' });
 }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
console.log(`Server running on port ${PORT}`);
});


