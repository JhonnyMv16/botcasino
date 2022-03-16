module.exports = {
    HOME_URL: 'https://www.bet365.com/#/HO/',
    headers: { 'Accept-Language': 'en' },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36',
    enablePrint: true,

    viewPort: {
        width: 1280,
        height: 960,
        deviceScaleFactor: 1,
    },
    
     screenshots: {
        home: 'screenshots/home.png',
        casino_home: 'screenshots/casino-home.png',
        games_home: 'screenshots/games-home.png', 
        form: 'screenshots/form.png',
        form_fill: 'screenshots/form-fill.png',
        login_complete: 'screenshots/login_complete.png',
        close: 'screenshots/close.png',
        error: 'screenshots/error.png'
    },
    
     login: {
        username: 'magnoramos23',
        password: 'Timao@12345'
    },
    
     exportFiles: {
        cookies: './cookies.json'
    }
}