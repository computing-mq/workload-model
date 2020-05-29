export {Model};
import allocation_load from '../allocation-load.json';

const Model = {

    url: '/allocation-load.json',   
    
    // this will hold the data stored in the model
    data: {
        records: [],
    },

    load: function() {

        this.data.records = allocation_load;
        this.process();
        let event = new CustomEvent("modelUpdated");
        window.dispatchEvent(event);
    },

    process: function() {

        let records = this.data.records;
        // extract just the people
        this.data.people = [];
        this.data.offerings = [];
        for (let i=0; i<records.length; i++) {
            let name = records[i].staff;
            const personIndex = this.data.people.findIndex(el => {return el.name === name;}) 
            if (personIndex < 0) {
                
                if (name) {
                    let parts = name.split(',');
                    let person = {
                        id: i,
                        name: name,
                        first_name: parts[1].replace(" (A)", ""),
                        last_name: parts[0],
                        adjunct: name.indexOf("(A)") >= 0
                    }
                    this.data.people.push(person);
                }
                records[i].staffid = i;
            } else {
                records[i].staffid = this.data.people[personIndex].id;
            }

            let code = records[i].unit_code;
            let parts = records[i].session.split(' ');
            let offering_name = code + "-S" + parts[1]; 
            records[i].offeringId = offering_name;
            if (this.data.offerings.findIndex(el => {return el.id === offering_name;}) < 0) {
                if (code) {
                    let offering = {
                        id: offering_name,
                        unit_code: code,
                        title: records[i].title,
                        session: records[i].session
                    }
                    this.data.offerings.push(offering);
                }
            }
        }
        this.data.people.sort((a, b) => a.name > b.name);
        this.data.offerings.sort((a, b) => {
            if (a.session === b.session) {
                return a.unit_code > b.unit_code;
            } else {
                return -1;
            }
        });
    },
    
    get_offerings: function() {
        return this.data.offerings
    },

    get_offering: function(id) {
        for(const offering of this.data.offerings) {
            if (offering.id === id) {
                return offering;
            }
        }
    },

    get_people: function() {
        return this.data.people;
    },
    
    get_people_with_load: function() {
        let people = this.get_people();
        for(let i=0; i<people.length; i++) {
            people[i].load = this.get_person_load(people[i].name);
        }
        return people;
    },

    get_person: function(id) {
        for(const person of this.data.people) {
            if (person.id == id) {
                return person;
            }
        }
    },

    get_records: function() {
        return this.data.records;
    }, 

    filter_records: function(records, field, value) {

        let result = [];
        for(let i=0; i<records.length; i++) {
            if (records[i][field] === value) {
                result.push(records[i]);
            }
        }
        return result;
    },

    group_records: function(records, field, value) {

        let result = {};
        for(const record of records) {
            if (result[record[field]]) {
                result[record[field]].push(record);
            } else {
                result[record[field]] = [record];
            }
        }
        return result;
    }, 

    get_unit_records: function(code) {

        let records = this.get_records();
        let result = [];
        for(let i=0; i<records.length; i++) {
            if (record[i].unit_code === code) {
                result.push(record[i]);
            }
        }
        return result;
    },

    get_person_records: function(name) {

        let records = this.get_records();
        let result = [];
        for(let i=0; i<records.length; i++) {
            if (records[i].staff === name) {
                result.push(records[i]);
            }
        }
        return result;
    },

    get_person_load: function(name) {

        let records = this.get_person_records(name);
        let overall_load = 0.0;
        for(let i=0; i<records.length; i++) {
            overall_load += records[i].load;
        }
        return overall_load;
    }
};


