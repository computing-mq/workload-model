/* Read and write files 
*/

const fs = require('fs')
const XLSX = require('xlsx')



const readAllocationWorkbook = (fileName) => {  

    const workbook = XLSX.readFile(fileName)

    const aconfig = {
        header: ['code','title', 'session', 'activity', 'quantity', 'marking', 'SGTA', 'new', 'staff', 'notes'],
        blankrows: false,
        range: 1 // ignore first row
    }

    const activities = XLSX.utils.sheet_to_json(workbook.Sheets['Activities'], aconfig)
    const pconfig = {
        header: ['name', 'role', 'points'],
        blankrows: false,
        range: 1 // ignore first row
    }
    const people = XLSX.utils.sheet_to_json(workbook.Sheets['Staff'], pconfig)

    return {people, activities}
}


const expandPeople = (people) => {

    return people.map((p, index) => {
        const parts = p.name.split(',');
        if (parts.length > 1) {
            const person = {
                ...p,
                id: index, 
                first_name: parts[1].replace(" (A)", "").trim(),
                last_name: parts[0].trim(),
                adjunct: p.name.indexOf("(A)") >= 0
            }
            return person
        }
    })
}


const offeringName = (activity) => {
    let parts = activity.session.split(' ');
    return activity.code + "-S" + parts[1]; 
}

/**
 * Given an array of activities, generate an array of unit offerings
 * @param {Array} activities 
 */
const gatherOfferings = (activities) => {

    const offerings = [];
    
    activities.map((activity) => {

        if (offerings.findIndex(el => {return el.id === offeringName(activity);}) < 0) {
            if (activity.code) {
                let offering = {
                    id: offeringName(activity),
                    unit_code: activity.code,
                    title: activity.title,
                    session: activity.session
                }
                offerings.push(offering);
            }
        }
    })
    return offerings
}


/**
 * update references to people and offerings 
 * @param {Array} activities 
 * @param {Array} people 
 * @param {Array} offerings 
 */
const processActivities = (fileName) => {

    let {people, activities} = readAllocationWorkbook(fileName)

    const offerings = gatherOfferings(activities)

    people = expandPeople(people)
    activities =  activities.map((activity) => {
        const person = people.find(e => e.name === activity.staff)
        return {
            ...activity,
            staffid: person ? person.id : null,
            offeringid: offeringName(activity)
        }
        
    })

    return {activities, people, offerings}
}

const {activities, people, offerings} = processActivities('data/allocation-2020.xlsx')

console.log(people.length, 'people')
console.log(activities.length, 'activities')
console.log(offerings.length, 'offerings')

console.log(activities[0])

console.log(activities.filter(a => a.offeringid === 'COMP1000-S1'))