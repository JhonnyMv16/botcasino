exports.clickZero = async function (frame, count) {
    await frame.evaluate((count) => {
        let elements = document.querySelectorAll('text.roulette-table-cell__text-tag')
        var element = undefined

        for (let index = 0; index < elements.length; index++) {
            let el = elements[index]
            if (el.textContent === "0") {
                element = el
            }
        }

        let rect = element.getBoundingClientRect()
        var clickEvent = document.createEvent('MouseEvents');
        clickEvent.initMouseEvent(
            'click', true, true, window, 0,
            0, 0, rect.x, rect.y, false, false,
            false, false, 0, null
        );

        for (let index = 0; index < count; index++) {
            document.elementFromPoint(rect.x, rect.y + 10).dispatchEvent(clickEvent);
        }
    }, count)
}

/* CLICKS HIGH AND LOW */

exports.clickHighNumbers = async function (frame, count) {
    await frame.evaluate((count) => {
        let elements = document.querySelectorAll('text.roulette-table-cell__text-tag')
        let filtered = []

        for (let index = 0; index < elements.length; index++) {
            let element = elements[index]
            if (element.textContent === "19-36") {
                filtered.push(element)
            }
        }

        var element = filtered[0]
        let rect = element.getBoundingClientRect()
        var clickEvent = document.createEvent('MouseEvents');
        clickEvent.initMouseEvent(
            'click', true, true, window, 0,
            0, 0, rect.x, rect.y + 10, false, false,
            false, false, 0, null
        );

        for (let index = 0; index < count; index++) {
            document.elementFromPoint(rect.x, rect.y + 10).dispatchEvent(clickEvent);
        }
    }, count)
}

exports.clickLowNumbers = async function (frame, count) {
    await frame.evaluate((count) => {
        let elements = document.querySelectorAll('text.roulette-table-cell__text-tag')
        let filtered = []

        for (let index = 0; index < elements.length; index++) {
            let element = elements[index]
            if (element.textContent === "1-18") {
                filtered.push(element)
            }
        }

        var element = filtered[0]
        let rect = element.getBoundingClientRect()
        var clickEvent = document.createEvent('MouseEvents');
        clickEvent.initMouseEvent(
            'click', true, true, window, 0,
            0, 0, rect.x, rect.y + 10, false, false,
            false, false, 0, null
        );

        for (let index = 0; index < count; index++) {
            document.elementFromPoint(rect.x, rect.y + 10).dispatchEvent(clickEvent);
        }
    }, count)
}


/* CLICKS DOZEN */

exports.clickLowDozen = async function (frame, count) {
    return await frame.evaluate((count) => {
        let elements = document.querySelectorAll('text.roulette-table-cell__text-tag')
        var element = undefined

        for (let index = 0; index < elements.length; index++) {
            let el = elements[index]
            if (el.textContent.includes("1st 12")) {
                element = el
            }
        }

        let rect = element.getBoundingClientRect()
        var clickEvent = document.createEvent('MouseEvents');
        clickEvent.initMouseEvent(
            'click', true, true, window, 0,
            0, 0, rect.x, rect.y + 10, false, false,
            false, false, 0, null
        );

        for (let index = 0; index < count; index++) {
            document.elementFromPoint(rect.x, rect.y + 10).dispatchEvent(clickEvent);
        }
    }, count)
}

exports.clickMediumDozen = async function (frame, count) {
    return await frame.evaluate((count) => {
        let elements = document.querySelectorAll('text.roulette-table-cell__text-tag')
        var element = undefined

        for (let index = 0; index < elements.length; index++) {
            let el = elements[index]
            if (el.textContent.includes("2nd 12")) {
                element = el
            }
        }

        let rect = element.getBoundingClientRect()
        var clickEvent = document.createEvent('MouseEvents');
        clickEvent.initMouseEvent(
            'click', true, true, window, 0,
            0, 0, rect.x, rect.y + 10, false, false,
            false, false, 0, null
        );

        for (let index = 0; index < count; index++) {
            document.elementFromPoint(rect.x, rect.y + 10).dispatchEvent(clickEvent);
        }
    }, count)
}

exports.clickHighDozen = async function (frame, count) {
    return await frame.evaluate((count) => {
        let elements = document.querySelectorAll('text.roulette-table-cell__text-tag')
        var element = undefined

        for (let index = 0; index < elements.length; index++) {
            let el = elements[index]
            if (el.textContent.includes("3rd 12")) {
                element = el
            }
        }

        let rect = element.getBoundingClientRect()
        var clickEvent = document.createEvent('MouseEvents');
        clickEvent.initMouseEvent(
            'click', true, true, window, 0,
            0, 0, rect.x, rect.y + 10, false, false,
            false, false, 0, null
        );

        for (let index = 0; index < count; index++) {
            document.elementFromPoint(rect.x, rect.y + 10).dispatchEvent(clickEvent);
        }
    }, count)
}

/* CLICKS COL */

exports.clickColOne = async function (frame, count) {
    return await frame.evaluate((count) => {
        let elements = document.querySelectorAll('text.roulette-table-cell__text-tag')
        let filtered = []

        for (let index = 0; index < elements.length; index++) {
            let element = elements[index]
            if (element.textContent.includes("2to1")) {
                filtered.push(element)
            }
        }

        var element = filtered[2]
        let rect = element.getBoundingClientRect()
        var clickEvent = document.createEvent('MouseEvents');
        clickEvent.initMouseEvent(
            'click', true, true, window, 0,
            0, 0, rect.x, rect.y, false, false,
            false, false, 0, null
        );

        for (let index = 0; index < count; index++) {
            document.elementFromPoint(rect.x, rect.y + 10).dispatchEvent(clickEvent);
        }
    }, count)
}

exports.clickColTwo = async function (frame, count) {
    return await frame.evaluate((count) => {
        let elements = document.querySelectorAll('text.roulette-table-cell__text-tag')
        let filtered = []

        for (let index = 0; index < elements.length; index++) {
            let element = elements[index]
            if (element.textContent.includes("2to1")) {
                filtered.push(element)
            }
        }

        var element = filtered[1]
        let rect = element.getBoundingClientRect()
        var clickEvent = document.createEvent('MouseEvents');
        clickEvent.initMouseEvent(
            'click', true, true, window, 0,
            0, 0, rect.x, rect.y, false, false,
            false, false, 0, null
        );

        for (let index = 0; index < count; index++) {
            document.elementFromPoint(rect.x, rect.y + 10).dispatchEvent(clickEvent);
        }
    }, count)
}

exports.clickColThree = async function (frame, count) {
    return await frame.evaluate((count) => {
        let elements = document.querySelectorAll('text.roulette-table-cell__text-tag')
        let filtered = []

        for (let index = 0; index < elements.length; index++) {
            let element = elements[index]
            if (element.textContent.includes("2to1")) {
                filtered.push(element)
            }
        }

        var element = filtered[0]
        let rect = element.getBoundingClientRect()
        var clickEvent = document.createEvent('MouseEvents');
        clickEvent.initMouseEvent(
            'click', true, true, window, 0,
            0, 0, rect.x, rect.y, false, false,
            false, false, 0, null
        );

        for (let index = 0; index < count; index++) {
            document.elementFromPoint(rect.x, rect.y + 10).dispatchEvent(clickEvent);
        }
    }, count)
}