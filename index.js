const express = require('express');
const { default: mongoose } = require('mongoose');
const axios = require('axios')
const {story, chapter} = require('./model')
var cron = require('node-cron');

const app = express()

const user = process.env.MONGO_USER
const pass = process.env.MONGO_PASS
const host = process.env.MONGO_HOST
const port = process.env.MONGO_PORT
const dbName = process.env.DB_NAME
const uri = `mongodb://${user}:${pass}@${host}:${port}`

main().catch(err => console.log(err));
async function main() {
    await mongoose.connect(uri, { dbName: dbName })
}

app.all('/', async (req, res) => {
    getStoryNonUpdate()
    res.send('hi')
})
async function getStoryNonUpdate(){
    const item = await story.findOne({ description: { $exists: false } })
    if (item != null) {
        console.log('>>>>>>>>', item._id);
        updateStory(item)
        updateChapter(item)
    }
}//61d2d91272a47d7b8d057756
function updateStory(item) {
    axios.get(`https://api.noveltyt.net/api/v2/stories?id=${item._id}`).then(async res => {
        if (res.status == 200 && res.data.status == true) {
            const { genre, crawl_url, publish_level, created, updated, author, cover, desc,
                first_chapter_url, full, owner_id, source, title, chapter_count, publish, view_count,
                like_count, review_count, star } = res.data.data
            let query = { _id: item._id };
            let update = {
                title: title, thumb: cover, categories: genre, crawl_url: crawl_url,
                publish_level: publish_level, created: created, updated: updated, author: author,
                description: desc, first_chapter_url: first_chapter_url, full: full, owner_id: owner_id,
                source: source, chapter_count: chapter_count, publish: publish, view_count: view_count,
                like_count: like_count, review_count: review_count, star: star, update_detail: true
            };
            let options = { upsert: true, new: true };
            let doc = await story.findOneAndUpdate(query, update, options)
            console.log('=========', doc);
        }
    }).catch(error => {
        console.log(`====>>error ${error}`);
    })
}
function updateChapter(item){
    const countLoop = Math.floor(item.chapter_count / 10) + 1
    for (var i = 0; i < countLoop; i++) {
        const start = (i * 10) + 1
        const end = (i * 10) + 10
        dowloadStoryAndSave(start, end, item._id)
    }
}
function dowloadStoryAndSave(start, end, storyId) {
    axios.get(`http://api.noveltyt.net/api/v2/chapters/numbers?end=${end}&start=${start}&story_id=${storyId}&type=all`, {
        headers: { 'client-id': 'simbo' }
    }).then(res => {
        if (res.status == 200 && res.data.status == true) {
            if (res.data.data.length != 0) {
                res.data.data.forEach(async e => {
                    let query = { _id: e.id };
                    let update = {
                        $setOnInsert: {
                            _id: e.id, title: e.title, number: e.number, published: e.published,
                            updated: e.updated, story_id: e.story_id.$oid, content: e.content
                        }
                    };
                    let options = { upsert: true, new: true };
                    let doc = await chapter.findOneAndUpdate(query, update, options)
                    console.log(`-----------${doc.title}`)
                });
            }
        }
    }).catch(error => {
        console.log(`====>>error ${error}`)
    })
}
cron.schedule('*/3 * * * *', () => {
    getStoryNonUpdate()
});
app.listen(process.env.PORT || 3000)