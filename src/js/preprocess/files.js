/* Read and write files 
*/
import fs from 'fs'
import XLSX from 'xlsx'
import workload from './workload.js'

const readAllocationWorkbook = (fileName) => {  

    const workbook = XLSX.readFile(fileName)

    const aconfig = {
        header: ['code','title', 'session', 'activity', 'quantity', 'marking', 'SGTA', 'bonus', 'staff', 'notes'],
        blankrows: false,
        range: 1 // ignore first row
    }

    const activities = XLSX.utils.sheet_to_json(workbook.Sheets['Activities'], aconfig)
    const pconfig = {
        header: ['name', 'adjunct', 's1target', 's2target'],
        blankrows: false,
        range: 1 // ignore first row
    }
    const people = XLSX.utils.sheet_to_json(workbook.Sheets['Staff'], pconfig)

    const uconfig = {
        header: ['code', 'title', 'session', 'enrollment',
                 'newUnit', 'cotaught', 'lectureType', 'lectureHours', 'SGTAHours'],
        blankrows: false,
        range: 1 // ignore first row
    }
    const offerings = XLSX.utils.sheet_to_json(workbook.Sheets['Units'], uconfig)

    return {activities, people, offerings}
}

const personName = (name) => {
    if (!name) {
        return null
    }
    const parts = name.split(',');
    if (parts.length > 1) {
        return {
            id: parts[1].trim() + parts[0].trim(),
            first_name: parts[1].trim(),
            last_name: parts[0].trim()
        }
    } else {
        return null
    }
}


const expandPeople = (people) => {

    const peopleObj = {}
    people.forEach((p) => {
        const name = personName(p.name)
        if (p) {
            const person = {
                ...p, 
                ...name
            }
            peopleObj[name.id] = person
        }
    })
    return peopleObj
}

/**
 * Generate an offering id like COMP1000-S1 from the code and session fields
 * 
 * @param {Object} it - an offering or activity with properties 'code' and 'session' 
 * @returns {String} an offering identifier
 */
const offeringName = (it) => {
    let parts = it.session.split(' ');
    return it.code + "-S" + parts[1]; 
}


/**
 * Add an Id to each offering, combine co-taught offerings
 * into one record with combined enrollment
 * @param {Array} offerings 
 */
const expandOfferings = (offerings) => {
    const offeringsMod = {}
    
    offerings.forEach( (o) => {
        const id = offeringName(o)
        if (!o.cotaught) {
            offeringsMod[id] = {
                ...o,
                id: id
            }
        }        
    })
    // now get all cotaught offerings
    offerings.forEach( (o) => {
        if (o.cotaught) {
            const id = offeringName({code: o.cotaught, session: o.session })
            offeringsMod[id].enrollment += o.enrollment
            offeringsMod[id].cotaughtWith = o.code
            offeringsMod[id].cotaughtEnrollment = o.enrollment
        }        
    })

    for (const [key, o] of Object.entries(offeringsMod)) {
        o.load = workload.computeOfferingLoad(o)
    }
     
    return offeringsMod
}

const expandActivities = (activities, offerings) => {
    const activitiesMod = []
    activities.forEach((activity) => {
        const person = personName(activity.staff)
        const offeringid = offeringName(activity)
        const offering = offerings[offeringid]
        if (!offering) {
            if (activity.notes && ! activity.notes.startsWith("Coteach")) {
                console.log("Unknown offering", activity)
            }
            return
        }

        activitiesMod.push({
            ...activity,
            staffid: person ? person.id : null,
            offeringid: offeringid
        })

        if (activity.SGTA) {
            activitiesMod.push({
                code: activity.code,
                title: activity.title,
                session: activity.session,
                activity: 'SGTA',
                quantity: activity.SGTA,
                staff: activity.staff,
                staffid: person ? person.id : null,
                offeringid: offeringid
            })
        }
        if (activity.marking) {
            activitiesMod.push({
                code: activity.code,
                title: activity.title,
                session: activity.session,
                activity: 'Marking',
                quantity: activity.marking,
                staff: activity.staff,
                staffid: person ? person.id : null,
                offeringid: offeringid
            })
        }
        // add bonus points if this is a new unit or this person is new to it
        if (activity.activity === "Lecturer" && (activity.bonus || offering.newUnit)) {
            activitiesMod.push({
                code: activity.code,
                title: activity.title,
                session: activity.session,
                activity: 'Bonus',
                quantity: (activity.bonus || 0) + workload.unitLoading(offering.newUnit) * activity.quantity,
                staff: activity.staff,
                staffid: person ? person.id : null,
                offeringid: offeringid
            })
        }
    })
    return computeWorkload(activitiesMod, offerings)
}

const computeWorkload = (activities, offerings) => {
    return activities.map( a => {
        return {
            ...a,
            load: workload.computeWorkload(a, offerings)
        }
    })
}



/**
 * update references to people and offerings 
 * @param {Array} activities 
 * @param {Array} people 
 * @param {Array} offerings 
 */
const readSpreadsheet = (fileName) => {

    console.log(fileName)
    let {activities, people, offerings} = readAllocationWorkbook(fileName)

    people = expandPeople(people)
    offerings = expandOfferings(offerings)
    activities = expandActivities(activities, offerings)
    
    return {activities, people, offerings}
}


const readConfig = (filename) => {
    const config = JSON.parse(fs.readFileSync(filename))

    console.log(config)
    for (const year of config.years) {
        console.log(year)
        const {activities, people, offerings} = readSpreadsheet(year.spreadsheet)
        year.activities = activities
        year.people = people
        year.offerings = offerings

        console.log(Object.getOwnPropertyNames(people).length, 'people')
        console.log(activities.length, 'activities')
        console.log(Object.getOwnPropertyNames(offerings).length, 'offerings')
    }

    return config
}


/*
console.log(activities.filter(a => a.offeringid === 'COMP3130-S1'))

console.log(offerings['COMP2010-S1'])
console.log(people['AnnabelleMcIver'])
*/

fs.writeFileSync('src/allocation-load.json', 
                 JSON.stringify(readConfig('./allocation-config.json'), null, 2))

