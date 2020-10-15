export {Model};
import allocation_load from '../allocation-load.json';

const Model = {    

    // this will hold the data stored in the model
    data: {
        activities: [],
        people: {},
        offerings: {}
    },

    load: function() {

        this.data = allocation_load;
        let event = new CustomEvent("modelUpdated");
        window.dispatchEvent(event);
    },

    get_offerings: function() {
        return Object.values(this.data.offerings)
    },

    get_offering: function(id) {
        return this.data.offerings[id]
    },

    get_people: function() {
        return Object.values(this.data.people);
    },
    
    get_people_with_load: function() {
        let people = this.get_people();
        for(let i=0; i<people.length; i++) {
            people[i].load = this.get_person_load(people[i].id);
        }
        return people;
    },

    get_person: function(id) {
        return this.data.people[id]
    },

    get_activities: function() {
        return this.data.activities;
    }, 

    filter_activities: function(activities, field, value) {

        let result = [];
        for(let i=0; i<activities.length; i++) {
            if (activities[i][field] === value) {
                result.push(activities[i]);
            }
        }
        return result;
    },

    group_activities: function(activities, field, value) {

        let result = {};
        for(const record of activities) {
            if (result[record[field]]) {
                result[record[field]].push(record);
            } else {
                result[record[field]] = [record];
            }
        }
        return result;
    }, 

    get_unit_activities: function(code) {

        let activities = this.get_activities();
        let result = [];
        for(let i=0; i<activities.length; i++) {
            if (record[i].unit_code === code) {
                result.push(record[i]);
            }
        }
        return result;
    },

    get_person_activities: function(personid) {

        let activities = this.get_activities();
        let result = [];
        for(let i=0; i<activities.length; i++) {
            if (activities[i].staffid === personid) {
                result.push(activities[i]);
            }
        }
        return result;
    },

    get_person_load: function(personid) {

        const activities = this.get_person_activities(personid);
        const load = {
            'Session 1': 0,
            'Session 2': 0,
            'Session 3': 0,
            total: 0
        }
        for(let i=0; i<activities.length; i++) {
            load[activities[i].session] += activities[i].load
            load.total += activities[i].load;
        }
        return load;
    }
};


