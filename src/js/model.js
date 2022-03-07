export {Model};
// import allocation_load from '../allocation-load.json';

const Model = {    

    // this will hold the data stored in the model
    data: {
        years: []
    },

    load: function() {
        const allocationUrl = 'allocation-load.json'
        fetch(allocationUrl)
        .then((response) => {
            if (response.ok) {
                return response.json()
            }
        })
        .then((data) => {
            this.data = data;
            let event = new CustomEvent("modelUpdated");
            window.dispatchEvent(event);
        })
    },

    _data_for: function(year) {
        if ( this.data ) {
            for(const data of this.data.years) {
                if (data.year == year) {
                    return data
                }
            }
        } else {
            return {offerings: {}, people: {}, activities: []}
        }
    },

    get_years: function() {
        return this.data.years.map(y => y.year)
    },

    get_offerings: function(year) {
        return Object.values(this._data_for(year).offerings)
    },

    get_offering: function(year, id) {
        return this._data_for(year).offerings[id]
    },

    get_people: function(year) {
        return Object.values(this._data_for(year).people);
    },
    
    get_people_with_load: function(year) {
        let people = this.get_people(year);
        for(let i=0; i<people.length; i++) {
            people[i].load = this.get_person_load(year, people[i].id);
        }
        return people;
    },

    get_person: function(year, id) {
        return this._data_for(year).people[id]
    },

    get_activities: function(year) {
        return this._data_for(year).activities;
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

    get_unit_activities: function(year, code) {

        let activities = this.get_activities(year);
        let result = [];
        for(let i=0; i<activities.length; i++) {
            if (activities[i].code === code) {
                result.push(record[i]);
            }
        }
        return result;
    },

    get_person_activities: function(year, personid) {

        let activities = this.get_activities(year);
        let result = [];
        for(let i=0; i<activities.length; i++) {
            if (activities[i].staffid === personid) {
                result.push(activities[i]);
            }
        }
        return result;
    },

    get_person_load: function(year, personid) {

        const activities = this.get_person_activities(year, personid);
        const load = {
            'Session 1': 0,
            'Session 2': 0,
            'Session 3': 0,
            total: 0
        }
        for(let i=0; i<activities.length; i++) {
            load[activities[i].session] += activities[i].load;
            load.total += activities[i].load;
        }

        return load;
    }
};


