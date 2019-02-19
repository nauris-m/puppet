const puppeteer = require('puppeteer');
const nodemailer = require('nodemailer');

async function doScreenCapture(url, site_name) {
    const d = new Date();
    const current_time = `${d.getFullYear()}_${d.getMonth() + 1}_${d.getDate()}_${d.getHours()}_${d.getMinutes()}`;
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url, {waitUntil: 'domcontentloaded'});

    let path = './screens/' + site_name + 'list_.png';
    let shotResult = await page.screenshot({fullPage: true, path: path})
        .then((result) => {
            console.log(`${site_name} got some results.`);
            return result;
        }).catch(e => {
            console.error(`[${site_name}] Error in snapshotting news`, e);
            return false;
        });
    if (shotResult) {
        sendMail(path, current_time);
    } else {
        return null;
    }
    await browser.close();
}

async function sendMail(path, time) {
    const transporter = nodemailer.createTransport({
        service: process.env.SERVICE,
        auth: {
            user: process.env.FROM,
            pass: process.env.PASS
        }
    });

    const mailOptions = {
        from: process.env.FROM,
        to: process.env.TO,
        subject: 'puppet test?',
        html: '<h2>hello, message from puppet, ' + time + '</h2><br><div>',
        attachments: [
            {
                path: path
            }
        ]
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}

const sites = [
    {
        name: 'yahoo',
        url: 'https://www.yahoo.com/?guccounter=1'
    }, {
        name: 'duck',
        url: 'https://duckduckgo.com/?t=hp'
    }
];

async function doSnapshots(news_sites) {
    for (let i = 0; i < news_sites.length; i++) {
        try {
            await doScreenCapture(news_sites[i]['url'], news_sites[i]['name']);
        } catch (e) {
            console.error(`[${news_sites[i]['name']
            || 'Unknown site'}] Error in snapshotting news`, e);
        }
    }
}

doSnapshots(sites);